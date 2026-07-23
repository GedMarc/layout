/**
 *	UI Layout Callback: resizePaneAccordions
 *
 *	This callback is used when a layout-pane contains 1 or more accordions
 *	- whether the accordion a child of the pane or is nested within other elements
 *	Assign this callback to the pane.onresize event:
 *
 *	SAMPLE:
 *	$("#elem").tabs({ activate: $.layout.callbacks.resizePaneAccordions });
 *	$("body").layout({ center__onresize: $.layout.callbacks.resizePaneAccordions });
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
if (!_) throw new Error("resizePaneAccordions requires jQuery UI Layout");
_.callbacks = _.callbacks || {};

_.callbacks.resizePaneAccordions = function (event, ui) {
	// may be called from a layout pane resize or tabs activate
	var $P = ui.jquery ? ui : $(ui.newPanel || ui.panel);
	// find all VISIBLE accordions inside this pane and resize them
	$P.find(".ui-accordion:visible").each(function(){
		var $E = $(this);
		if ($E.data("ui-accordion"))
			$E.accordion("refresh");
	});
};

	return $;
}));
