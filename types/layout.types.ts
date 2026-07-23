import $ = require("..");

const paneNames: ReadonlySet<JQueryLayout.PaneName> = new Set([
    "north",
    "south",
    "east",
    "west",
    "center"
]);

const options: JQueryLayout.Options = {
    name: "typed-layout",
    resizeWithWindow: false,
    panes: {
        fxName: "none",
        responsive: {
            enabled: true,
            when: "md",
            sizes: { md: 768 }
        }
    },
    west: {
        size: "25%",
        onclose_end(pane, paneElement, state, paneOptions, layoutName) {
            pane satisfies JQueryLayout.PaneName;
            paneElement.addClass(`${layoutName}-${pane}`);
            state.isClosed satisfies boolean | undefined;
            paneOptions.closable satisfies boolean | undefined;
        }
    },
    stateManagement: {
        enabled: true,
        autoSave(instance, state) {
            instance.state.initialized satisfies boolean;
            state.west?.size satisfies JQueryLayout.PaneSize | undefined;
        }
    }
};

const layout = $("#layout").layout(options);
if (layout) {
    layout.close("west", true, true);
    layout.sizePane("west", 240);
    layout.bindButton("#toggle-west", "toggle", "west");

    const saved: JQueryLayout.StateData = layout.saveState();
    layout.loadState(saved, { animate: false, includeChildren: true });

    for (const pane of paneNames) {
        const paneElement = layout.panes[pane];
        if (paneElement)
            paneElement.addClass("typed-pane");
    }
}

$.layout.callbacks.afterResize = (
    pane: JQueryLayout.PaneName,
    paneElement: JQuery
) => {
    paneElement.attr("data-pane", pane);
};

const exportedJQuery: JQueryStatic = $;
exportedJQuery.layout.version satisfies "2.0.0";

// @ts-expect-error center cannot be opened or closed.
layout?.open("center");
// @ts-expect-error unknown button actions are rejected.
layout?.bindButton("#bad", "spin", "west");



