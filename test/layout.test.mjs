import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { JSDOM } from "jsdom";

const require = createRequire(import.meta.url);
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "https://layout.test/"
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.location = dom.window.location;

const $ = require("jquery");
globalThis.jQuery = globalThis.$ = dom.window.jQuery = dom.window.$ = $;

// jsdom has no visual layout. CSS dimensions still work, but jQuery's default
// visibility test relies on client rects that jsdom intentionally omits.
$.expr.pseudos.visible = () => true;
$.expr.pseudos.hidden = () => false;

require("jquery-ui/dist/jquery-ui.js");
const exportedJQuery = require("..");

function addLayout(id) {
    $("body").append(`
        <div id="${id}" style="position:relative;width:1000px;height:700px">
            <div class="ui-layout-north" style="height:60px"></div>
            <div class="ui-layout-south" style="height:50px"></div>
            <div class="ui-layout-west" style="width:200px"></div>
            <div class="ui-layout-east" style="width:150px"></div>
            <div class="ui-layout-center"></div>
        </div>
    `);
    return $(`#${id}`);
}

function createLayout(id, options = {}) {
    return addLayout(id).layout($.extend(true, {
        name: id,
        resizeWithWindow: false,
        panes: { fxName: "none" },
        west: { size: 200 },
        east: { size: 150 },
        stateManagement: {
            enabled: true,
            autoLoad: false,
            autoSave: false
        }
    }, options));
}

test("loads with jQuery 4 and jQuery UI 1.14", () => {
    assert.equal($.fn.jquery, "4.0.0");
    assert.equal($.ui.version, "1.14.2");
    assert.equal($.layout.version, "2.0.0");
    assert.equal(exportedJQuery, $);
    assert.equal(typeof $.fn.draggable, "function");
    assert.equal($.layout.browser, undefined);
    assert.equal($.layout.browserZoom, undefined);
});

test("initializes, operates panes, persists state, and destroys cleanly", () => {
    let callbackCount = 0;
    $.layout.callbacks.testClose = () => { callbackCount += 1; };

    const layout = createLayout("lifecycle", {
        west: { onclose_end: "testClose" }
    });

    assert.equal(layout.state.initialized, true);
    assert.equal(layout.state.west.size, 200);
    assert.equal(layout.resizers.west.length, 1);

    layout.close("west", true, true);
    assert.equal(layout.state.west.isClosed, true);
    assert.equal(callbackCount, 1);

    layout.open("west", false, true);
    assert.equal(layout.state.west.isClosed, false);

    layout.sizePane("west", 240, false, true, true);
    assert.equal(layout.state.west.size, 240);

    const saved = layout.saveState();
    assert.equal(saved.west.size, 240);
    assert.deepEqual(
        JSON.parse(window.localStorage.getItem("jquery.layout:lifecycle")),
        saved
    );
    assert.deepEqual(layout.readStoredState(), saved);

    window.localStorage.setItem("jquery.layout:lifecycle", "{not valid json");
    assert.deepEqual(layout.readStoredState(), {});
    window.localStorage.setItem("jquery.layout:lifecycle", JSON.stringify(saved));

    layout.destroy();
    assert.equal(layout.destroyed, true);
    assert.equal($("#lifecycle").data("layout"), undefined);

    $("#lifecycle").remove();
    const restored = createLayout("lifecycle", {
        stateManagement: { enabled: true, autoLoad: true, autoSave: false }
    });
    assert.equal(restored.state.west.size, 240);
    restored.deleteState();
    assert.equal(window.localStorage.getItem("jquery.layout:lifecycle"), null);
    restored.destroy();
    $("#lifecycle").remove();
});

test("supports keyboard hotkeys and accessible custom buttons", () => {
    $("body").append('<button id="toggle-west">Toggle west</button>');
    const layout = createLayout("controls");
    layout.bindButton("#toggle-west", "toggle", "west");

    assert.equal($("#toggle-west").attr("role"), "button");
    assert.equal($("#toggle-west").attr("tabindex"), "0");

    $("#toggle-west").trigger("click");
    assert.equal(layout.state.west.isClosed, true);

    $("#toggle-west").trigger($.Event("keydown", { key: "Enter" }));
    assert.equal(layout.state.west.isClosed, false);

    $(document).trigger($.Event("keydown", { key: "ArrowLeft", ctrlKey: true }));
    assert.equal(layout.state.west.isClosed, true);

    layout.destroy();
    $("#controls, #toggle-west").remove();
});



