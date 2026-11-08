import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { JSDOM } from "jsdom";

const require = createRequire(import.meta.url);
let dom, $, exportedJQuery;

// Keep each fixture independent. Reusing a jsdom window across repeated layout
// lifecycles makes DOM operations progressively slower and leaks state between tests.
test.beforeEach(() => {
    dom = new JSDOM("<!doctype html><html><body></body></html>", {
        url: "https://layout.test/"
    });
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.location = dom.window.location;

    for (const module of ["jquery", "jquery-ui/dist/jquery-ui.js", ".."]) {
        delete require.cache[require.resolve(module)];
    }
    $ = require("jquery");
    globalThis.jQuery = globalThis.$ = dom.window.jQuery = dom.window.$ = $;

    // jsdom has no visual layout. CSS dimensions still work, but jQuery's default
    // visibility test relies on client rects that jsdom intentionally omits.
    $.expr.pseudos.visible = () => true;
    $.expr.pseudos.hidden = () => false;

    require("jquery-ui/dist/jquery-ui.js");
    exportedJQuery = require("..");
});
test.afterEach(() => { dom.window.close(); });

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

function createLayout(id, options = {}, onlyPane) {
    const container = addLayout(id);
    if (onlyPane)
        container.children().not(`.ui-layout-center, .ui-layout-${onlyPane}`).remove();
    return container.layout($.extend(true, {
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

for (const pane of ["north", "south", "east", "west"]) {
    for (const initClosed of [false, true]) {
        test(`hides and shows the ${initClosed ? "closed" : "open"} ${pane} pane`, () => {
            const id = `hide-show-${pane}-${initClosed}`;
            let hideCount = 0;
            let showCount = 0;
            let showEndCount = 0;
            const layout = createLayout(id, {
                [pane]: {
                    initClosed,
                    onhide_end: () => { hideCount += 1; },
                    onshow_start: () => { showCount += 1; },
                    onshow_end: () => { showEndCount += 1; }
                }
            }, pane);

            try {
                const assertHidden = () => {
                    assert.equal(layout.state[pane].isHidden, true);
                    assert.equal(layout.state[pane].isClosed, true);
                    assert.equal(layout.state[pane].isVisible, false);
                    assert.equal(layout.panes[pane].css("display"), "none");
                    assert.equal(layout.resizers[pane].css("display"), "none");
                };

                layout.hide(pane, true);
                assertHidden();
                layout.hide(pane, true);
                assertHidden();
                assert.equal(hideCount, 1, "hiding an already hidden pane is a no-op");

                layout.show(pane, false, true);
                assert.equal(layout.state[pane].isHidden, false);
                assert.equal(layout.state[pane].isClosed, true);
                assert.equal(layout.panes[pane].css("display"), "none");
                assert.notEqual(layout.resizers[pane].css("display"), "none");
                assert.equal(showCount, 1);
                assert.equal(showEndCount, 1);

                layout.hide(pane, true);
                assertHidden();
                layout.show(pane, true, true);
                assert.equal(layout.state[pane].isHidden, false);
                assert.equal(layout.state[pane].isClosed, false);
                assert.equal(layout.state[pane].isVisible, true);
                assert.notEqual(layout.panes[pane].css("display"), "none");
                assert.notEqual(layout.resizers[pane].css("display"), "none");
                assert.equal(hideCount, 2);
                assert.equal(showCount, 2);
                assert.equal(showEndCount, 2);

                layout.show(pane, true, true);
                layout.close(pane, true, true);
                layout.open(pane, false, true);
                assert.equal(showEndCount, 2, "ordinary opens and redundant shows do not finish a show");
            } finally {
                layout.destroy();
                $(`#${id}`).remove();
            }
        });
    }
}

for (const triggerEventsOnLoad of [false, true]) {
    test(`initializes hidden panes with triggerEventsOnLoad=${triggerEventsOnLoad}`, () => {
        const id = `init-hidden-${triggerEventsOnLoad}`;
        let hideCount = 0;
        let showEndCount = 0;
        const layout = createLayout(id, {
            west: {
                initHidden: true,
                triggerEventsOnLoad,
                onhide_end: () => { hideCount += 1; },
                onshow_end: () => { showEndCount += 1; }
            }
        }, "west");

        try {
            assert.equal(layout.state.initialized, true);
            assert.equal(layout.state.west.isHidden, true);
            assert.equal(layout.state.west.isVisible, false);
            assert.equal(layout.panes.west.css("display"), "none");
            assert.equal(layout.resizers.west.css("display"), "none");
            assert.equal(hideCount, triggerEventsOnLoad ? 1 : 0);
            assert.equal(showEndCount, 0);

            layout.show("west", true, true);
            assert.equal(layout.state.west.isHidden, false);
            assert.equal(layout.state.west.isClosed, false);
            assert.equal(showEndCount, 1);
        } finally {
            layout.destroy();
            $(`#${id}`).remove();
        }
    });
}

test("allows onhide_start to cancel hiding without changing the pane or resizer", () => {
    let hideCount = 0;
    const layout = createLayout("cancel-hide", {
        west: {
            onhide_start: () => false,
            onhide_end: () => { hideCount += 1; }
        }
    }, "west");

    try {
        layout.hide("west", true);
        assert.equal(layout.state.west.isHidden, false);
        assert.equal(layout.state.west.isClosed, false);
        assert.equal(layout.state.west.isVisible, true);
        assert.notEqual(layout.panes.west.css("display"), "none");
        assert.notEqual(layout.resizers.west.css("display"), "none");
        assert.equal(hideCount, 0);
    } finally {
        layout.destroy();
        $("#cancel-hide").remove();
    }
});



for (const method of ["show-default", "show-open", "open", "toggle"]) {
    test(`finishes showing a hidden pane exactly once through ${method}`, () => {
        const id = `show-end-${method}`;
        const events = [];
        const completions = [];
        const layout = createLayout(id, {
            west: {
                initHidden: true,
                onshow_start: () => { events.push("show_start"); },
                onopen_start: () => { events.push("open_start"); },
                onopen_end: () => { events.push("open_end"); },
                onshow_end: (pane, element, state, options, name) => {
                    events.push("show_end");
                    completions.push({
                        pane, element, options, name,
                        isHidden: state.isHidden,
                        isClosed: state.isClosed,
                        isVisible: state.isVisible,
                        isMoving: state.isMoving,
                        isShowing: state.isShowing,
                        resizerOpen: element.parent().find(".ui-layout-resizer-west-open").length
                    });
                },
                onresize_end: () => { events.push("resize_end"); }
            }
        }, "west");
        layout.panes.west.on("layoutpaneonshow_end", () => { events.push("bound_show_end"); });
        layout.panes.west.on("layoutpaneonshow", () => { events.push("bound_show"); });
        events.length = 0;

        try {
            for (let cycle = 0; cycle < 2; cycle += 1) {
                if (method === "show-default") layout.show("west");
                if (method === "show-open") layout.show("west", true, true);
                if (method === "open") layout.open("west", false, true);
                if (method === "toggle") layout.toggle("west");

                assert.deepEqual(events, [
                    "show_start", "open_start", "open_end", "show_end",
                    "bound_show_end", "bound_show", "resize_end"
                ]);
                assert.deepEqual(completions[cycle], {
                    pane: "west", element: layout.panes.west, options: layout.options.west, name: id,
                    isHidden: false, isClosed: false, isVisible: true,
                    isMoving: false, isShowing: undefined, resizerOpen: 1
                });
                layout.hide("west", true);
                events.length = 0;
            }
            assert.equal(completions.length, 2);
        } finally {
            layout.destroy();
            $(`#${id}`).remove();
        }
    });
}

test("does not finish a canceled show or aborted open, and succeeds on retry", () => {
    let allowShow = false;
    let allowOpen = false;
    let showEndCount = 0;
    const layout = createLayout("cancel-show", {
        west: {
            initHidden: true,
            onshow_start: () => allowShow,
            onopen_start: () => allowOpen ? undefined : "abort",
            onshow_end: () => { showEndCount += 1; }
        }
    }, "west");

    try {
        layout.show("west", true, true);
        assert.equal(showEndCount, 0);
        assert.equal(layout.state.west.isHidden, true);
        assert.equal(layout.state.west.isShowing, undefined);
        assert.equal(layout.resizers.west.css("display"), "none");

        allowShow = true;
        layout.show("west", true, true);
        assert.equal(showEndCount, 0);
        assert.equal(layout.state.west.isHidden, true);
        assert.equal(layout.state.west.isVisible, false);

        allowOpen = true;
        layout.show("west", true, true);
        assert.equal(showEndCount, 1);
        assert.equal(layout.state.west.isHidden, false);
        assert.equal(layout.state.west.isShowing, undefined);
    } finally {
        layout.destroy();
        $("#cancel-show").remove();
    }
});

test("finishes showing only after an asynchronous opening effect completes", async () => {
    const events = [];
    const layout = createLayout("show-effect", {
        west: {
            initHidden: true,
            fxName_open: "slide",
            fxSpeed_open: 20,
            onopen_end: () => { events.push("open_end"); },
            onshow_end: () => { events.push("show_end"); }
        }
    }, "west");
    const originalShow = $.fn.show;
    let finishEffect;
    // Simulate the effect's asynchronous completion without depending on jsdom geometry.
    $.fn.show = function (...args) {
        if (this[0] === layout.panes.west[0] && typeof args[3] === "function") {
            finishEffect = args[3];
            return originalShow.call(this);
        }
        return originalShow.apply(this, args);
    };

    try {
        layout.show("west", true);
        assert.equal(typeof finishEffect, "function");
        assert.equal(layout.state.west.isMoving, true);
        assert.deepEqual(events, []);
        await new Promise((resolve) => setTimeout(resolve, 0));
        finishEffect();
        assert.deepEqual(events, ["open_end", "show_end"]);
        assert.equal(layout.state.west.isMoving, false);
        assert.equal(layout.state.west.isShowing, undefined);
    } finally {
        $.fn.show = originalShow;
        layout.destroy();
        $("#show-effect").remove();
    }
});
