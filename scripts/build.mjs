import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import CleanCSS from "clean-css";
import { minify } from "terser";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stable = join(root, "source", "stable");
const dist = join(root, "dist");
const demoJs = join(root, "demos", "js");
const demoCss = join(root, "demos", "css");

async function copyFile(source, target) {
    await mkdir(dirname(target), { recursive: true });
    await cp(source, target, { force: true });
}

async function writeMinifiedJavaScript(sourcePath, targets) {
    const source = await readFile(sourcePath, "utf8");
    const result = await minify(source, {
        compress: true,
        mangle: true,
        format: { comments: /^!|@preserve|@license|copyright/i }
    });
    if (!result.code)
        throw new Error(`Terser produced no output for ${sourcePath}`);
    await Promise.all(targets.map((target) => writeFile(target, `${result.code}\n`, "utf8")));
}

await Promise.all([mkdir(dist, { recursive: true }), mkdir(demoJs, { recursive: true })]);

const bundle = join(stable, "jquery.layout_and_plugins.js");
const bundleCopies = [
    join(dist, "jquery.layout_and_plugins.js"),
    join(demoJs, "jquery.layout_and_plugins.js")
];
await Promise.all(bundleCopies.map((target) => copyFile(bundle, target)));
await copyFile(
    join(stable, "jquery.layout_and_plugins.d.ts"),
    join(dist, "jquery.layout_and_plugins.d.ts")
);

const minifiedBundleTargets = [
    join(stable, "jquery.layout_and_plugins.min.js"),
    join(dist, "jquery.layout_and_plugins.min.js"),
    join(demoJs, "jquery.layout_and_plugins.min.js")
];
await writeMinifiedJavaScript(bundle, minifiedBundleTargets);

const cssSource = join(stable, "layout-default.css");
const css = await readFile(cssSource, "utf8");
const minifiedCss = new CleanCSS({ level: 2 }).minify(css);
if (minifiedCss.errors.length)
    throw new Error(`CleanCSS failed: ${minifiedCss.errors.join(", ")}`);
await Promise.all([
    writeFile(join(stable, "layout-default.min.css"), `${minifiedCss.styles}\n`, "utf8"),
    copyFile(cssSource, join(dist, "layout-default.css")),
    writeFile(join(dist, "layout-default.min.css"), `${minifiedCss.styles}\n`, "utf8")
]);

for (const callback of ["jquery.layout.resizePaneAccordions", "jquery.layout.resizeTabLayout"]) {
    const source = join(stable, "callbacks", `${callback}.js`);
    const minified = join(stable, "callbacks", `${callback}.min.js`);
    await writeMinifiedJavaScript(source, [minified]);
    await copyFile(source, join(demoJs, `${callback}.js`));
    await copyFile(minified, join(demoJs, `${callback}.min.js`));
}

const jqueryDist = join(root, "node_modules", "jquery", "dist");
await copyFile(join(jqueryDist, "jquery.js"), join(demoJs, "jquery-4.0.0.js"));
await copyFile(join(jqueryDist, "jquery.min.js"), join(demoJs, "jquery-4.0.0.min.js"));
await copyFile(join(jqueryDist, "jquery.min.map"), join(demoJs, "jquery-4.0.0.min.map"));

const jqueryUi = join(root, "node_modules", "jquery-ui");
await copyFile(join(jqueryUi, "dist", "jquery-ui.js"), join(demoJs, "jquery-ui.js"));
await copyFile(join(jqueryUi, "dist", "jquery-ui.min.js"), join(demoJs, "jquery-ui.min.js"));
await cp(join(jqueryUi, "themes", "base"), join(demoCss, "jquery-ui-1.14.2"), {
    recursive: true,
    force: true
});

console.log("Built jQuery UI Layout 2.0.0 artifacts.");


