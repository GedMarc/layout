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
    (function(){if(window.google&&google.gears){return}var a=null;if(typeof GearsFactory!="undefined"){a=new GearsFactory()}else{try{a=new ActiveXObject("Gears.Factory");if(a.getBuildInfo().indexOf("ie_mobile")!=-1){a.privateSetGlobalObject(this)}}catch(b){if((typeof navigator.mimeTypes!="undefined")&&navigator.mimeTypes["application/x-googlegears"]){a=document.createElement("object");a.style.display="none";a.width=0;a.height=0;a.type="application/x-googlegears";document.documentElement.appendChild(a)}}}if(!a){return}if(!window.google){google={}}if(!google.gears){google.gears={factory:a}}})();Persist=(function(){var i="0.3.1",d,b,g,h,e,f;f=(function(){var q="Thu, 01-Jan-1970 00:00:01 GMT",k=1000*60*60*24,r=["expires","path","domain"],m=escape,l=unescape,p=document,n;var s=function(){var t=new Date();t.setTime(t.getTime());return t};var j=function(x,A){var w,v,z,y=[],u=(arguments.length>2)?arguments[2]:{};y.push(m(x)+"="+m(A));for(var t=0;t<r.length;t++){v=r[t];z=u[v];if(z){y.push(v+"="+z)}}if(u.secure){y.push("secure")}return y.join("; ")};var o=function(){return navigator.cookieEnabled};n={set:function(B,x){var u=(arguments.length>2)?arguments[2]:{},v=s(),A,z={};if(u.expires){if(u.expires==-1){z.expires=-1}else{var w=u.expires*k;z.expires=new Date(v.getTime()+w);z.expires=z.expires.toGMTString()}}var C=["path","domain","secure"];for(var y=0;y<C.length;y++){if(u[C[y]]){z[C[y]]=u[C[y]]}}var t=j(B,x,z);p.cookie=t;return x},has:function(u){u=m(u);var x=p.cookie,w=x.indexOf(u+"="),t=w+u.length+1,v=x.substring(0,u.length);return((!w&&u!=v)||w<0)?false:true},get:function(v){v=m(v);var y=p.cookie,x=y.indexOf(v+"="),t=x+v.length+1,w=y.substring(0,v.length),u;if((!x&&v!=w)||x<0){return null}u=y.indexOf(";",t);if(u<0){u=y.length}return l(y.substring(t,u))},remove:function(t){var v=n.get(t),u={expires:q};p.cookie=j(t,"",u);return v},keys:function(){var y=p.cookie,x=y.split("; "),u,w,v=[];for(var t=0;t<x.length;t++){w=x[t].split("=");v.push(l(w[0]))}return v},all:function(){var y=p.cookie,x=y.split("; "),u,w,v=[];for(var t=0;t<x.length;t++){w=x[t].split("=");v.push([l(w[0]),l(w[1])])}return v},version:"0.2.1",enabled:false};n.enabled=o.call(n);return n}());var c=(function(){if(Array.prototype.indexOf){return function(j,k){return Array.prototype.indexOf.call(j,k)}}else{return function(o,p){var n,m;for(var k=0,j=o.length;k<j;k++){if(o[k]==p){return k}}return -1}}})();e=function(){};g=function(j){return"PS"+j.replace(/_/g,"__").replace(/ /g,"_s")};var a={search_order:["localstorage","globalstorage","gears","cookie","ie","flash"],name_re:/^[a-z][a-z0-9_ \-]+$/i,methods:["init","get","set","remove","load","save","iterate"],sql:{version:"1",create:"CREATE TABLE IF NOT EXISTS persist_data (k TEXT UNIQUE NOT NULL PRIMARY KEY, v TEXT NOT NULL)",get:"SELECT v FROM persist_data WHERE k = ?",set:"INSERT INTO persist_data(k, v) VALUES (?, ?)",remove:"DELETE FROM persist_data WHERE k = ?",keys:"SELECT * FROM persist_data"},flash:{div_id:"_persist_flash_wrap",id:"_persist_flash",path:"persist.swf",size:{w:1,h:1},params:{autostart:true}}};b={gears:{size:-1,test:function(){return(window.google&&window.google.gears)?true:false},methods:{init:function(){var j;j=this.db=google.gears.factory.create("beta.database");j.open(g(this.name));j.execute(a.sql.create).close()},get:function(l){var m,n=a.sql.get;var j=this.db;var k;j.execute("BEGIN").close();m=j.execute(n,[l]);k=m.isValidRow()?m.field(0):null;m.close();j.execute("COMMIT").close();return k},set:function(m,p){var k=a.sql.remove,o=a.sql.set,n;var j=this.db;var l;j.execute("BEGIN").close();j.execute(k,[m]).close();j.execute(o,[m,p]).close();j.execute("COMMIT").close();return p},remove:function(l){var n=a.sql.get,p=a.sql.remove,m,o=null,j=false;var k=this.db;k.execute("BEGIN").close();k.execute(p,[l]).close();k.execute("COMMIT").close();return true},iterate:function(m,l){var k=a.sql.keys;var n;var j=this.db;n=j.execute(k);while(n.isValidRow()){m.call(l||this,n.field(0),n.field(1));n.next()}n.close()}}},globalstorage:{size:5*1024*1024,test:function(){if(window.globalStorage){var j="127.0.0.1";if(this.o&&this.o.domain){j=this.o.domain}try{var l=globalStorage[j];return true}catch(k){if(window.console&&window.console.warn){console.warn("globalStorage exists, but couldn't use it because your browser is running on domain:",j)}return false}}else{return false}},methods:{key:function(j){return g(this.name)+g(j)},init:function(){this.store=globalStorage[this.o.domain]},get:function(j){j=this.key(j);return this.store.getItem(j)},set:function(j,k){j=this.key(j);this.store.setItem(j,k);return k},remove:function(j){var k;j=this.key(j);k=this.store.getItem[j];this.store.removeItem(j);return k}}},localstorage:{size:-1,test:function(){try{if(window.localStorage&&window.localStorage.setItem("persistjs_test_local_storage",null)==undefined){window.localStorage.removeItem("persistjs_test_local_storage");if(/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){var k=RegExp.$1;if(k>=9){return true}if(window.location.protocol=="file:"){return false}}else{return true}}else{return false}return window.localStorage?true:false}catch(j){return false}},methods:{key:function(j){return this.name+">"+j},init:function(){this.store=localStorage},get:function(j){j=this.key(j);return this.store.getItem(j)},set:function(j,k){j=this.key(j);this.store.setItem(j,k);return k},remove:function(j){var k;j=this.key(j);k=this.store.getItem(j);this.store.removeItem(j);return k},iterate:function(o,n){var j=this.store,m,p;for(var k=0;k<j.length;k++){m=j.key(k);p=m.split(">");if((p.length==2)&&(p[0]==this.name)){o.call(n||this,p[1],j.getItem(m))}}}}},ie:{prefix:"_persist_data-",size:64*1024,test:function(){return window.ActiveXObject?true:false},make_userdata:function(k){var j=document.createElement("div");j.id=k;j.style.display="none";j.addBehavior("#default#userdata");document.body.appendChild(j);return j},methods:{init:function(){var j=b.ie.prefix+g(this.name);this.el=b.ie.make_userdata(j);if(this.o.defer){this.load()}},get:function(j){var k;j=g(j);if(!this.o.defer){this.load()}k=this.el.getAttribute(j);return k},set:function(j,k){j=g(j);this.el.setAttribute(j,k);if(!this.o.defer){this.save()}return k},remove:function(j){var k;j=g(j);if(!this.o.defer){this.load()}k=this.el.getAttribute(j);this.el.removeAttribute(j);if(!this.o.defer){this.save()}return k},load:function(){this.el.load(g(this.name))},save:function(){this.el.save(g(this.name))}}},cookie:{delim:":",size:4000,test:function(){return d.Cookie.enabled?true:false},methods:{key:function(j){return this.name+b.cookie.delim+j},get:function(j,k){var l;j=this.key(j);l=f.get(j);return l},set:function(j,l,k){j=this.key(j);f.set(j,l,this.o);return l},remove:function(j,k){var k;j=this.key(j);k=f.remove(j);return k}}},flash:{test:function(){try{if(!swfobject){return false}}catch(k){return false}var j=swfobject.getFlashPlayerVersion().major;return(j>=8)?true:false},methods:{init:function(){if(!b.flash.el){var l,m,k,j=a.flash;m=document.createElement("div");m.id=j.div_id;k=document.createElement("div");k.id=j.id;m.appendChild(k);document.body.appendChild(m);b.flash.el=swfobject.createSWF({id:j.id,data:this.o.swf_path||j.path,width:j.size.w,height:j.size.h},j.params,j.id)}this.el=b.flash.el},get:function(j){var k;j=g(j);k=this.el.get(this.name,j);return k},set:function(k,l){var j;k=g(k);j=this.el.set(this.name,k,l);return j},remove:function(j){var k;j=g(j);k=this.el.remove(this.name,j);return k}}}};h=function(){var n,j,p,r,s=a.methods,t=a.search_order;for(var q=0,o=s.length;q<o;q++){d.Store.prototype[s[q]]=e}d.type=null;d.size=-1;for(var m=0,k=t.length;!d.type&&m<k;m++){p=b[t[m]];if(p.test()){d.type=t[m];d.size=p.size;for(r in p.methods){d.Store.prototype[r]=p.methods[r]}}}d._init=true};d={VERSION:i,type:null,size:0,add:function(j){b[j.id]=j;a.search_order=[j.id].concat(a.search_order);h()},remove:function(k){var j=c(a.search_order,k);if(j<0){return}a.search_order.splice(j,1);delete b[k];h()},Cookie:f,Store:function(j,k){if(!a.name_re.exec(j)){throw new Error("Invalid name")}if(!d.type){throw new Error("No suitable storage found")}k=k||{};this.name=j;k.domain=k.domain||location.hostname||"localhost";k.domain=k.domain.replace(/:\d+$/,"");k.domain=(k.domain=="localhost")?"":k.domain;this.o=k;k.expires=k.expires||365*2;k.path=k.path||"/";if(this.o.search_order){a.search_order=this.o.search_order;h()}this.init()}};h();return d})();
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
