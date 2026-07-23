const assert = require("node:assert/strict");
const test = require("node:test");
const { JSDOM } = require("jsdom");

test("initializes without the optional jQuery UI dependency", () => {
    const dom = new JSDOM(`
        <!doctype html><html lang="en"><body>
            <div id="layout" style="position:relative;width:800px;height:600px">
                <div class="ui-layout-west" style="width:180px"></div>
                <div class="ui-layout-center"></div>
            </div>
        </body></html>
    `, { url: "https://layout-no-ui.test/" });

    global.window = dom.window;
    global.document = dom.window.document;
    global.location = dom.window.location;

    const $ = require("jquery");
    global.jQuery = global.$ = dom.window.jQuery = dom.window.$ = $;
    $.expr.pseudos.visible = () => true;
    $.expr.pseudos.hidden = () => false;

    require("..");
    const layout = $("#layout").layout({
        resizeWithWindow: false,
        panes: { fxName: "none" },
        west: { size: 180 }
    });

    assert.equal(layout.state.initialized, true);
    assert.equal($.layout.plugins.draggable, false);
    assert.equal(layout.options.west.resizable, false);
    assert.equal(layout.state.west.size, 180);

    layout.close("west", true, true);
    assert.equal(layout.state.west.isClosed, true);
    layout.open("west", false, true);
    assert.equal(layout.state.west.isClosed, false);
    layout.destroy();
});

