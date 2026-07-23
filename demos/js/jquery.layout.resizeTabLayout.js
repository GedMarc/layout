/**
 *	UI Layout Callback: resizeTabLayout
 *
 *	Requires Layout 2.0 or later
 *
 *	This callback is used when a tab-panel is the container for a layout
 *	The tab-layout can be initialized either before or after the tabs are created
 *	Assign this callback to the tabs activate event:
 *	- if the layout HAS been fully initialized already, it will be resized
 *	- if the layout has NOT fully initialized, it will attempt to do so
 *		- if it cannot initialize, it will try again next time the tab is accessed
 *		- it also looks for any visible layout inside the tab and resizes/initializes it
 *
 *	SAMPLE:
 *	$("#elem").tabs({ activate: $.layout.callbacks.resizeTabLayout });
 *	$("body").layout({ center__onresize: $.layout.callbacks.resizeTabLayout });
 *
 *	Version:	2.0
 *	Author:		Kevin Dalman (kevin@jquery-dev.com)
 */
;(function (factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(require("jquery"));
	} else if (typeof define === "function" && define.amd) {
		define(["jquery"], factory);
	} else {
		factory(window.jQuery);
	}
}(function ($) {
	var _ = $.layout;

// make sure the callbacks branch exists
if (!_) throw new Error("resizeTabLayout requires jQuery UI Layout");
_.callbacks = _.callbacks || {};

// this callback is bound to the tabs.show event OR to layout-pane.onresize event
_.callbacks.resizeTabLayout = function (event, ui) {
	// may be called EITHER from layout-pane.onresize OR tabs.show/activate
	var $P = ui.jquery ? ui : $(ui.newPanel || ui.panel);
	// find all VISIBLE layouts inside this pane/panel and resize them
	$P.filter(":visible").find(".ui-layout-container:visible").addBack().each(function(){
		var layout = $(this).data("layout");
		if (layout) {
			layout.options.resizeWithWindow = false; // set option just in case not already set
			layout.resizeAll();
		}
	});
};

	return $;
}));
