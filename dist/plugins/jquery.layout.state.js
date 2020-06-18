/**
 * @preserve jquery.layout.state 1.0
 * $Date: 2011-07-16 08:00:00 (Sat, 16 July 2011) $
 *
 * Copyright (c) 2010
 *   Kevin Dalman (http://allpro.net)
 *
 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)
 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.
 *
 * @dependancies: UI Layout 1.8.2 or higher
 * @dependancies: Persist.js
 *
 * @support: http://groups.google.com/group/jquery-ui-layout
 */
/*
 *	State-management options stored in options.stateManagement, which includes a .cookie hash
 *	Default options saves ALL KEYS for ALL PANES, ie: pane.size, pane.isClosed, pane.isHidden
 *
 *	// STATE/COOKIE OPTIONS
 *	@example $(el).layout({
				stateManagement: {
					enabled:	true
				,	stateKeys:	"east.size,west.size,east.isClosed,west.isClosed"
				,	cookie:		{ name: "appLayout", path: "/" }
				}
			})
 *	@example $(el).layout({ stateManagement__enabled: true }) // enable auto-state-management using cookies
 *	@example $(el).layout({ stateManagement__cookie: { name: "appLayout", path: "/" } })
 *	@example $(el).layout({ stateManagement__cookie__name: "appLayout", stateManagement__cookie__path: "/" })
 *
 *	// STATE/COOKIE METHODS
 *	@example myLayout.saveCookie( "west.isClosed,north.size,south.isHidden", {expires: 7} );
 *	@example myLayout.loadCookie();
 *	@example myLayout.deleteCookie();
 *	@example var JSON = myLayout.readState();	// CURRENT Layout State
 *	@example var JSON = myLayout.readCookie();	// SAVED Layout State (from cookie)
 *	@example var JSON = myLayout.state.stateData;	// LAST LOADED Layout State (cookie saved in layout.state hash)
 *
 *	CUSTOM STATE-MANAGEMENT (eg, saved in a database)
 *	@example var JSON = myLayout.readState( "west.isClosed,north.size,south.isHidden" );
 *	@example myLayout.loadState( JSON );
 */

// NOTE: For best readability, view with a fixed-width font and tabs equal to 4-chars

;(function ($) {

if (!$.layout) return;

/**
Persist-JS
*/
(function(){if(!window.google||!google.gears){var d=null;if("undefined"!=typeof GearsFactory)d=new GearsFactory;else try{d=new ActiveXObject("Gears.Factory"),-1!=d.getBuildInfo().indexOf("ie_mobile")&&d.privateSetGlobalObject(this)}catch(e){"undefined"!=typeof navigator.mimeTypes&&navigator.mimeTypes["application/x-googlegears"]&&(d=document.createElement("object"),d.style.display="none",d.width=0,d.height=0,d.type="application/x-googlegears",document.documentElement.appendChild(d))}d&&(window.google|| (google={}),google.gears||(google.gears={factory:d}))}})(); Persist=function(){var d,e,c,l,q,n;n=function(){var a=["expires","path","domain"],b=escape,f=unescape,d=document,c,e=function(s,f){var d,p,c=[],e=2<arguments.length?arguments[2]:{};c.push(b(s)+"="+b(f));for(var g=0;g<a.length;g++)d=a[g],(p=e[d])&&c.push(d+"="+p);e.secure&&c.push("secure");return c.join("; ")};c={set:function(a,b){var f=2<arguments.length?arguments[2]:{},c=new Date;c.setTime(c.getTime());var k={};if(f.expires)if(-1==f.expires)k.expires=-1;else{var m=864E5*f.expires;k.expires=new Date(c.getTime()+ m);k.expires=k.expires.toGMTString()}c=["path","domain","secure"];for(m=0;m<c.length;m++)f[c[m]]&&(k[c[m]]=f[c[m]]);f=e(a,b,k);d.cookie=f;return b},has:function(a){a=b(a);var f=d.cookie,c=f.indexOf(a+"="),f=f.substring(0,a.length);return!c&&a!=f||0>c?!1:!0},get:function(a){a=b(a);var c=d.cookie,e=c.indexOf(a+"="),p=e+a.length+1,k=c.substring(0,a.length);if(!e&&a!=k||0>e)return null;a=c.indexOf(";",p);0>a&&(a=c.length);return f(c.substring(p,a))},remove:function(a){var b=c.get(a);d.cookie=e(a,"",{expires:"Thu, 01-Jan-1970 00:00:01 GMT"}); return b},keys:function(){for(var a=d.cookie.split("; "),b,c=[],e=0;e<a.length;e++)b=a[e].split("="),c.push(f(b[0]));return c},all:function(){for(var a=d.cookie.split("; "),b,c=[],e=0;e<a.length;e++)b=a[e].split("="),c.push([f(b[0]),f(b[1])]);return c},version:"0.2.1",enabled:!1};c.enabled=function(){var a=new Date,a=a.toGMTString();this.set("__EC_TEST__",a);return this.enabled=this.remove("__EC_TEST__")==a}.call(c);return c}();var t=function(){return Array.prototype.indexOf?function(a,b){return Array.prototype.indexOf.call(a, b)}:function(a,b){for(var c=0,d=a.length;c<d;c++)if(a[c]==b)return c;return-1}}();q=function(){};c=function(a){return"PS"+a.replace(/_/g,"__").replace(/ /g,"_s")};var h="localstorage globalstorage gears cookie ie flash".split(" "),u=/^[a-z][a-z0-9_ \-]+$/i,r="init get set remove load save iterate".split(" "),v={autostart:!0};e={gears:{size:-1,test:function(){return window.google&&window.google.gears?!0:!1},methods:{init:function(){var a;a=this.db=google.gears.factory.create("beta.database");a.open(c(this.name)); a.execute("CREATE TABLE IF NOT EXISTS persist_data (k TEXT UNIQUE NOT NULL PRIMARY KEY, v TEXT NOT NULL)").close()},get:function(a){var b=this.db,c;b.execute("BEGIN").close();a=b.execute("SELECT v FROM persist_data WHERE k = ?",[a]);c=a.isValidRow()?a.field(0):null;a.close();b.execute("COMMIT").close();return c},set:function(a,b){var c=this.db;c.execute("BEGIN").close();c.execute("DELETE FROM persist_data WHERE k = ?",[a]).close();c.execute("INSERT INTO persist_data(k, v) VALUES (?, ?)",[a,b]).close(); c.execute("COMMIT").close();return b},remove:function(a){var b=this.db;b.execute("BEGIN").close();b.execute("DELETE FROM persist_data WHERE k = ?",[a]).close();b.execute("COMMIT").close();return!0},iterate:function(a,b){var c;for(c=this.db.execute("SELECT * FROM persist_data");c.isValidRow();)a.call(b||this,c.field(0),c.field(1)),c.next();c.close()}}},globalstorage:{size:5242880,test:function(){return window.globalStorage?!0:!1},methods:{key:function(a){return c(this.name)+c(a)},init:function(){this.store= globalStorage[this.o.domain]},get:function(a){a=this.key(a);return this.store.getItem(a)},set:function(a,b){a=this.key(a);this.store.setItem(a,b);return b},remove:function(a){var b;a=this.key(a);b=this.store.getItem[a];this.store.removeItem(a);return b}}},localstorage:{size:-1,test:function(){try{if(window.localStorage&&void 0==window.localStorage.setItem("persistjs_test_local_storage",null))if(window.localStorage.removeItem("persistjs_test_local_storage"),/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){if(9<= RegExp.$1)return!0;if("file:"==window.location.protocol)return!1}else return!0;else return!1;return window.localStorage?!0:!1}catch(a){return!1}},methods:{key:function(a){return this.name+">"+a},init:function(){this.store=localStorage},get:function(a){a=this.key(a);return this.store.getItem(a)},set:function(a,b){a=this.key(a);this.store.setItem(a,b);return b},remove:function(a){var b;a=this.key(a);b=this.store.getItem(a);this.store.removeItem(a);return b},iterate:function(a,b){for(var c=this.store, d,e,h=0;h<c.length;h++)d=c.key(h),e=d.split(">"),2==e.length&&e[0]==this.name&&a.call(b||this,e[1],c.getItem(d))}}},ie:{prefix:"_persist_data-",size:65536,test:function(){return window.ActiveXObject?!0:!1},make_userdata:function(a){var b=document.createElement("div");b.id=a;b.style.display="none";b.addBehavior("#default#userdata");document.body.appendChild(b);return b},methods:{init:function(){var a=e.ie.prefix+c(this.name);this.el=e.ie.make_userdata(a);this.o.defer&&this.load()},get:function(a){a= c(a);this.o.defer||this.load();return this.el.getAttribute(a)},set:function(a,b){a=c(a);this.el.setAttribute(a,b);this.o.defer||this.save();return b},remove:function(a){var b;a=c(a);this.o.defer||this.load();b=this.el.getAttribute(a);this.el.removeAttribute(a);this.o.defer||this.save();return b},load:function(){this.el.load(c(this.name))},save:function(){this.el.save(c(this.name))}}},cookie:{delim:":",size:4E3,test:function(){return d.Cookie.enabled?!0:!1},methods:{key:function(a){return this.name+ e.cookie.delim+a},get:function(a,b){a=this.key(a);return n.get(a)},set:function(a,b,c){a=this.key(a);n.set(a,b,this.o);return b},remove:function(a,b){a=this.key(a);return b=n.remove(a)}}},flash:{test:function(){return swfobject?8<=swfobject.getFlashPlayerVersion().major?!0:!1:!1},methods:{init:function(){if(!e.flash.el){var a,b;a=document.createElement("div");a.id="_persist_flash_wrap";b=document.createElement("div");b.id="_persist_flash";a.appendChild(b);document.body.appendChild(a);e.flash.el=swfobject.createSWF({id:"_persist_flash", data:this.o.swf_path||"persist.swf",width:1,height:1},v,"_persist_flash")}this.el=e.flash.el},get:function(a){a=c(a);return this.el.get(this.name,a)},set:function(a,b){a=c(a);return this.el.set(this.name,a,b)},remove:function(a){a=c(a);return this.el.remove(this.name,a)}}}};l=function(){var a,b,c=h;a=0;for(var g=r.length;a<g;a++)d.Store.prototype[r[a]]=q;d.type=null;d.size=-1;for(var g=0,l=c.length;!d.type&&g<l;g++)if(a=e[c[g]],a.test())for(b in d.type=c[g],d.size=a.size,a.methods)d.Store.prototype[b]= a.methods[b];d._init=!0};d={VERSION:"0.3.1",type:null,size:0,add:function(a){e[a.id]=a;h=[a.id].concat(h);l()},remove:function(a){var b=t(h,a);0>b||(h.splice(b,1),delete e[a],l())},Cookie:n,Store:function(a,b){if(!u.exec(a))throw Error("Invalid name");if(!d.type)throw Error("No suitable storage found");b=b||{};this.name=a;b.domain=b.domain||location.hostname||"localhost";b.domain=b.domain.replace(/:\d+$/,"");b.domain="localhost"==b.domain?"":b.domain;this.o=b;b.expires=b.expires||730;b.path=b.path|| "/";this.o.search_order&&(h=this.o.search_order,l());this.init()}};l();return d}();
var layoutStore = new Persist.Store("LayoutProperties");
// tell Layout that the state plugin is available
$.layout.plugins.stateManagement = true;

//	Add State-Management options to layout.defaults
$.layout.defaults.stateManagement = {
	enabled:	false	// true = enable state-management, even if not using cookies
,	autoSave:	true	// Save a state-cookie when page exits?
,	autoLoad:	true	// Load the state-cookie when Layout inits?
	// List state-data to save - must be pane-specific
,	stateKeys:	"north.size,south.size,east.size,west.size,"+
				"north.isClosed,south.isClosed,east.isClosed,west.isClosed,"+
				"north.isHidden,south.isHidden,east.isHidden,west.isHidden"
    , storeLocation: 'localstorage' //or globalStorage or sessionStorage or cookie or flash or
,	cookie: {
		name:	""	// If not specified, will use Layout.name, else just "Layout". Now the Store Name
	}
};
// Set stateManagement as a layout-option, NOT a pane-option
$.layout.optionsMap.layout.push("stateManagement");

/*
 *	State Managment methods
 */
$.layout.state = {
	// set data used by multiple methods below
	config: {
		allPanes:	"north,south,west,east,center"
	}

	/**
	 * Get the current layout state and save it to a cookie
	 *
	 * myLayout.saveCookie( keys, cookieOpts )
	 *
	 * @param {Object}			inst
	 * @param {(string|Array)=}	keys
	 * @param {Object=}			opts
	 */
,	saveCookie: function (inst, keys, cookieOpts) {
        var o	= inst.options
		,	oS	= o.stateManagement
		,	oC	= $.extend( {}, oS.cookie, cookieOpts || {} )
		,	data = inst.state.stateData = inst.readState( keys || oS.stateKeys ) // read current panes-state
		;
        var storeName = oC.name || o.name || "Layout";
        layoutStore.set(storeName,JSON.stringify(data));
        layoutStore.save();
		return $.extend( {}, data ); // return COPY of state.stateData data
	}

	/**
	 * Remove the state cookie
	 *
	 * @param {Object}	inst
	 */
,	deleteCookie: function (inst) {
		var o = inst.options;
        layoutStore.remove( o.stateManagement.cookie.name || o.name || "Layout");
	}

	/**
	 * Read & return data from the cookie - as JSON
	 *
	 * @param {Object}	inst
	 */
,	readCookie: function (inst) {
		var o = inst.options;
		var c = layoutStore.get(o.stateManagement.cookie.name || o.name || "Layout");
		// convert cookie string back to a hash and return it
		return c ? JSON.parse(c): {};
	}

	/**
	 * Get data from the cookie and USE IT to loadState
	 *
	 * @param {Object}	inst
	 */
,	loadCookie: function (inst) {
		var c = $.layout.state.readCookie(inst); // READ the cookie
		if (c && !$.isEmptyObject( c )) {
			inst.state.stateData = $.extend({}, c); // SET state.stateData
			inst.loadState(c); // LOAD the retrieved state
		}
		return c;
	}

	/**
	 * Update layout options from the cookie, if one exists
	 *
	 * @param {Object}		inst
	 * @param {Object=}		stateData
	 * @param {boolean=}	animate
	 */
,	loadState: function (inst, stateData, animate) {
		stateData = $.layout.transformData( stateData ); // panes = default subkey
		$.extend( true, inst.options, stateData ); // update layout options
		// if layout has already been initialized, then UPDATE layout state
		if (inst.state.initialized) {
			var pane, o, s, h, c
			,	noAnimate = (animate===false);
			$.each($.layout.state.config.allPanes.split(","), function (idx, pane) {
				o = stateData[ pane ];
				if (typeof o != 'object') return; // no key, continue
				s = o.size;
				c = o.initClosed;
				h = o.initHidden;
				if (s > 0 || s=="auto") inst.sizePane(pane, s, false, null, noAnimate); // will animate resize if option enabled
				if (h === true)			inst.hide(pane, a);
				else if (c === false)	inst.open (pane, false, noAnimate);
				else if (c === true)	inst.close(pane, false, noAnimate);
				else if (h === false)	inst.show (pane, false, noAnimate);
			});
		}
	}

	/**
	 * Get the *current layout state* and return it as a hash
	 *
	 * @param {Object=}			inst
	 * @param {(string|Array)=}	keys
	 */
,	readState: function (inst, keys) {
		var
			data	= {}
		,	alt		= { isClosed: 'initClosed', isHidden: 'initHidden' }
		,	state	= inst.state
		,	pair, pane, key, val
		;
		if (!keys) keys = inst.options.stateManagement.stateKeys; // if called by user
		if (Array.isArray(keys)) keys = keys.join(",");
		// convert keys to an array and change delimiters from '__' to '.'
		keys = keys.replace(/__/g, ".").split(',');
		// loop keys and create a data hash
		for (var i=0, n=keys.length; i < n; i++) {
			pair = keys[i].split(".");
			pane = pair[0];
			key  = pair[1];
			if ($.layout.state.config.allPanes.indexOf(pane) < 0) continue; // bad pane!
			val = state[ pane ][ key ];
			if (val == undefined) continue;
			if (key=="isClosed" && state[pane]["isSliding"])
				val = true; // if sliding, then *really* isClosed
			( data[pane] || (data[pane]={}) )[ alt[key] ? alt[key] : key ] = val;
		}
		return data;
	}
,	_create: function (inst) {
		//	ADD State-Management plugin methods to inst
		 $.extend( inst, {
		//	readCookie - update options from cookie - returns hash of cookie data
			readCookie:		function () { return $.layout.state.readCookie(inst); }
		//	deleteCookie
		,	deleteCookie:	function () { $.layout.state.deleteCookie(inst); }
		//	saveCookie - optionally pass keys-list and cookie-options (hash)
		,	saveCookie:		function (keys, cookieOpts) { return $.layout.state.saveCookie(inst, keys, cookieOpts); }
		//	loadCookie - readCookie and use to loadState() - returns hash of cookie data
		,	loadCookie:		function () { return $.layout.state.loadCookie(inst); }
		//	loadState - pass a hash of state to use to update options
		,	loadState:		function (stateData, animate) { $.layout.state.loadState(inst, stateData, animate); }
		//	readState - returns hash of current layout-state
		,	readState:		function (keys) { return $.layout.state.readState(inst, keys); }
		});

		// init state.stateData key, even if plugin is initially disabled
		inst.state.stateData = {};

		// read and load cookie-data per options
		var oS = inst.options.stateManagement;
		if (oS.enabled) {
			if (oS.autoLoad) // update the options from the cookie
				inst.loadCookie();
			else // don't modify options - just store cookie data in state.stateData
				inst.state.stateData = inst.readCookie();
		}
	}

,	_unload: function (inst) {
		var oS = inst.options.stateManagement;
		if (oS.enabled) {
			if (oS.autoSave) // save a state-cookie automatically
				inst.saveCookie();
			else // don't save a cookie, but do store state-data in state.stateData key
				inst.state.stateData = inst.readState();
		}
	}
};

// add state initialization method to Layout's onCreate array of functions
$.layout.onCreate.push( $.layout.state._create );
$.layout.onUnload.push( $.layout.state._unload );

})( jQuery );
