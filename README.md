jQuery UI Layout
================

<a href="https://snyk.io/test/github/GedMarc/layout?targetFile=package.json"><img src="https://snyk.io/test/github/GedMarc/layout/badge.svg?targetFile=package.json" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/GedMarc/layout?targetFile=package.json" style="max-width:100%;"></a>

1.8.5
-----------------
* Default masking and iframefix to false, allow switching usage to either
  
  Can be applied per pane as well
  ```
  $().layout({draggableIframeFix:true,mask:false});
  $().layout({draggableIframeFix:false,mask:true});
  ```
  Applicable demo : layout_inside_dialog
  
1.8.4
-----------------
- Allows custom storage co-ordinates using Persist.JS
- Updated Persist.JS to use HTML 5 cookie detection
- Create NPM coordinates layout-jquery3


1.7.5
------------------
- Update to JQuery 3.5.1
- Add JQuery Migrate 3.3
- A few more smaller fixes
- Prep for the .css() update as brought up by @Melloware


1.7.1
------------------
- Update to JQuery 3.5
- Add JQuery Migrate 3.2
- Fix deprecation warnings

1.7.0
------------------
 @rsprinkle      Add AMD Support,
 
 @alexsielicki   Fixing issue with running under webpack with jQuery 3.3.1 and jQuery Migrate plugin

Version bump for identification into AMD

1.6.0 - 1.6.3
------------------
- Added addSlideToggle methods and addSlideToggleBtn utility
- unbind() to off()


1.5.12.2 - 1.6.0
------------------
- Updated responsive features to be more dynamic with size control and dynamic construction variations.
- Updated the demo pages to reflect a true representation of JQuery 3 and JQuery UI 1.12
- Allows for elements to be specified as toggle contents as well as the pre-existing html. These elements are moved to the toggle location and various classes are applied in the default manner.

1.4.4 - 1.5.12
----------------
- **Responsiveness added directly to pane options. Use with .addToggle() to add a button to show in a certain state
- **JQuery 3 Full Compatibility. Updated to use on instead of bind, remove the incompatible line from other post
- **Bootstrap Compatibility. Updated to fully support drown downs and others easily
- **Removed default demo page theming. Allows for full styling from a blank canvas in the css file
- **resizeJQuery function that runs all 3 (Accordion, Tab, Datatable) in a single call to onresize_end
- **Fixed bug where onResizeEnd would fail on resize if no function was supplied


The Ultimate Page Layout Manager
--------------------------------

This widget was inspired by the extJS border-layout, and recreates that functionality in a jQuery plug-in. 
The Layout plug-in can create _any_ UI look you want - from simple headers or sidebars, 
to a complex application with toolbars, menus, help-panels, status bars, sub-forms, etc.

Combined it with other jQuery UI widgets to create a sophisticated application. 
There are no limitations or issues - this widget is ready for production use. 
If you create a good looking application using UI Layout, please let us know.

### Highlights

- **simple yet powerful**"- syntax is easy to learn
- **unlimited layout capabilities**: 5 regions per layout - unlimited nesting
- **dozens of options**: every aspect is customizable, globally and by region
- **total CSS control**: dozens of auto-generated classes create ANY UI look
- **extensible**: callbacks, methods, and special utilities provide total control
- **custom buttons**: integrates with your own buttons for a custom UI look
- **collapsable**: each pane can be closed, using any UI animation you want
- **hidable**: panes can be completely hidden, either on startup or at any time
- **resizable**: each pane can be resized, within automatic or specified limits
- **slidable**: panes can also 'slide open' for temporary access
- **headers & footers**: each region has unlimited headers or footers
- **hotkeys**: can use the cursor-keys and/or define custom hotkeys
- **use any elements**: use divs, iframes or any elements you want as a 'pane'
- **compatible with UI widgets**: integrates with jQuery widgets and plug-ins
- **demo mode**: set applyDefaultStyles option for a fully functional layout
- **and MORE**: see the documentation and demos

### History & Future

UI Layout was created 8 years ago as an enhancement to the borderLayout widget.
Sourcecode was transferred to GitHub, which also allowed it to be _re-registered_ on the jQuery plugins site.
You can find Layout on the jQuery site at: http://plugins.jquery.com/layout 

Documentation and other information is being updated for the latest version and will be migrated to GitHub. 
In the meantime you can find information and demos on the widget's old website and in its forum...

- Website: http://layout.jquery-dev.com
- Support: https://groups.google.com/forum/#!forum/jquery-ui-layout

More information will be added here soon. This is just to get the migration process started...

/Kevin
