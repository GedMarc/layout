import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const fail = (message) => failures.push(message);

async function exists(path) {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
}

const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
if (packageJson.version !== "2.0.0") fail("package.json must be version 2.0.0");
if (packageJson.peerDependencies?.jquery !== ">=4.0.0 <5") fail("jQuery 4 peer range is missing");
if (JSON.stringify(packageJson).includes("jquery-migrate")) fail("jquery-migrate must not be declared");
if (packageJson.types !== "dist/jquery.layout_and_plugins.d.ts") fail("TypeScript declaration entry point is missing");

const maintainedSources = [
    "source/stable/jquery.layout_and_plugins.js",
    "source/stable/callbacks/jquery.layout.resizePaneAccordions.js",
    "source/stable/callbacks/jquery.layout.resizeTabLayout.js"
];
const prohibited = [
    ["browser sniffing", /\$\.layout\.browser|navigator\.userAgent/],
    ["removed jQuery utility", /\$\.(?:isArray|isFunction|isNumeric|now|parseJSON|trim|type)\b/],
    ["removed traversal API", /\.andSelf\b/],
    ["obsolete runtime", /ActiveXObject|GearsFactory|\bPersist\b|globalStorage|swfobject|deviceXDPI|systemXDPI/],
    ["IE alpha filter", /Alpha\s*\(\s*Opacity|filter\s*=\s*["']Alpha/i],
    ["invalid hover event binding", /\.on\(\s*["']hover/],
    ["boxed primitive", /new\s+String\s*\(/],
    ["dynamic code execution", /(^|[^\w])eval\s*\(|new\s+Function\s*\(/m],
    ["literal inline style markup", /<[a-z][^>\r\n]+\sstyle\s*=/i],
    ["literal inline event handler", /<[a-z][^>\r\n]+\son\w+\s*=/i]
];

for (const file of maintainedSources) {
    const source = await readFile(join(root, file), "utf8");
    try {
        new vm.Script(source, { filename: file });
    } catch (error) {
        fail(`${file} does not parse: ${error.message}`);
    }
    for (const [label, pattern] of prohibited) {
        if (pattern.test(source)) fail(`${file} contains ${label}`);
    }
}

const bundleSource = await readFile(join(root, maintainedSources[0]), "utf8");
if (!bundleSource.includes('version:"2.0.0"')) fail("bundle runtime version is not 2.0.0");
if (!bundleSource.includes("jQuery UI Layout 2.0 requires jQuery 4 or newer")) fail("jQuery 4 runtime guard is missing");
if (bundleSource.includes("browserZoom") || bundleSource.includes("slideOffscreen") || bundleSource.includes("resizeDataTables")) {
    fail("removed plugins remain in the bundle");
}

const generatedGroups = [
    ["source/stable/jquery.layout_and_plugins.js", "dist/jquery.layout_and_plugins.js", "demos/js/jquery.layout_and_plugins.js"],
    ["source/stable/jquery.layout_and_plugins.min.js", "dist/jquery.layout_and_plugins.min.js", "demos/js/jquery.layout_and_plugins.min.js"],
    ["source/stable/jquery.layout_and_plugins.d.ts", "dist/jquery.layout_and_plugins.d.ts"],
    ["source/stable/layout-default.css", "dist/layout-default.css"],
    ["source/stable/layout-default.min.css", "dist/layout-default.min.css"]
];
for (const group of generatedGroups) {
    const expected = await readFile(join(root, group[0]), "utf8");
    for (const file of group.slice(1)) {
        const actual = await readFile(join(root, file), "utf8");
        if (actual !== expected) fail(`${file} is not synchronized with ${group[0]}`);
    }
}

const distributionFiles = (await readdir(join(root, "dist"))).sort();
const expectedDistributionFiles = [
    "jquery.layout_and_plugins.d.ts",
    "jquery.layout_and_plugins.js",
    "jquery.layout_and_plugins.min.js",
    "layout-default.css",
    "layout-default.min.css"
];
if (JSON.stringify(distributionFiles) !== JSON.stringify(expectedDistributionFiles)) {
    fail(`dist contains unexpected files: ${distributionFiles.join(", ")}`);
}

for (const file of [
    "source/stable/jquery.layout_and_plugins.min.js",
    "dist/jquery.layout_and_plugins.min.js",
    "demos/js/jquery.layout_and_plugins.min.js"
]) {
    try {
        new vm.Script(await readFile(join(root, file), "utf8"), { filename: file });
    } catch (error) {
        fail(`${file} does not parse: ${error.message}`);
    }
}

const demoDirectory = join(root, "demos");
const demoHtml = (await readdir(demoDirectory)).filter((file) => file.endsWith(".html"));
for (const file of demoHtml) {
    const html = await readFile(join(demoDirectory, file), "utf8");
    if (!/^<!DOCTYPE html>/i.test(html) || !/<html\s+lang="en">/i.test(html)) {
        fail(`demos/${file} is not normalized HTML5`);
    }
    if (/jquery-migrate|jquery-3\.7\.1|js\/jquery(?:\.min)?\.js/i.test(html)) {
        fail(`demos/${file} references a removed jQuery runtime`);
    }
    if (/<script[^>]+jquery[^>]+src=/i.test(html) && !html.includes("js/jquery-4.0.0.js")) {
        fail(`demos/${file} does not use jQuery 4.0.0`);
    }
    if (/\$\.(?:isArray|isFunction|now|parseJSON|type)\b|\.andSelf\b|\.(?:bind|delegate|unbind)\s*\(|\.click\s*\(|(^|[^\w])eval\s*\(/m.test(html)) {
        fail(`demos/${file} contains an API removed by jQuery 4 or CSP cleanup`);
    }
}

for (const removed of [
    "source/stable/plugins",
    "source/stable/callbacks/jquery.layout.pseudoClose.js",
    "source/stable/callbacks/jquery.layout.resizeDataTable.js",
    "demos/js/jquery-migrate.js",
    "demos/js/jquery-3.7.1.js"
]) {
    if (await exists(join(root, removed))) fail(`${removed} should have been removed`);
}

const jquery = await readFile(join(root, "demos/js/jquery-4.0.0.js"), "utf8");
if (!/jQuery JavaScript Library v4\.0\.0/.test(jquery)) fail("demo jQuery asset is not 4.0.0");
const jqueryUi = await readFile(join(root, "demos/js/jquery-ui.js"), "utf8");
if (!/jQuery UI - v1\.14\.2/.test(jqueryUi)) fail("demo jQuery UI asset is not 1.14.2");

if (failures.length) {
    console.error(failures.map((failure) => `- ${failure}`).join("\n"));
    process.exitCode = 1;
} else {
    console.log(`Validated ${maintainedSources.length} maintained sources and ${demoHtml.length} demos.`);
}




