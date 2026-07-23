const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const bundle = readFileSync("dist/jquery.layout_and_plugins.min.js", "utf8");

test("rejects jQuery versions older than 4 before initialization", () => {
    const context = {
        window: {
            jQuery: { fn: { jquery: "3.7.1" } }
        }
    };

    assert.throws(
        () => vm.runInNewContext(bundle, context),
        /requires jQuery 4 or newer/
    );
});

