import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { JSDOM, VirtualConsole } from 'jsdom';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const demos = (await readdir(resolve(root, 'demos'))).filter(file => file.endsWith('.html'));

// Load actual demo HTML and local scripts without network access. jsdom cannot
// render or hit-test: this checks runtime integration, not visual geometry.
async function loadDemo(file, stored = {}) {
    const errors = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', error => errors.push(error));
    virtualConsole.on('error', (...args) => errors.push(args.join(' ')));
    virtualConsole.on('log', (...args) => {
        if (/Exception:|callback.*error|error.*callback/i.test(args.join(' '))) errors.push(args.join(' '));
    });
    const dom = new JSDOM(await readFile(resolve(root, 'demos', file), 'utf8'), {
        url: `https://layout.test/demos/${file}`,
        runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole
    });
    const { window } = dom;
    // jsdom 26's selector engine incorrectly returns no matches for this
    // standard selector used by jQuery UI tabs. Keep the workaround narrow.
    const querySelectorAll = window.Element.prototype.querySelectorAll;
    window.Element.prototype.querySelectorAll = function (selector) {
        if (selector === ':scope > li:has(a[href])') {
            return [...this.children].filter(child =>
                child.matches('li') && child.querySelector('a[href]'));
        }
        return querySelectorAll.call(this, selector);
    };

    window.alert = message => {
        if (/Exception:|callback.*error|error.*callback/i.test(message)) errors.push(message);
    };
    // Window dimensions otherwise report zero in jsdom.
    Object.defineProperty(window.document.documentElement, 'clientWidth', { value: 1440 });
    Object.defineProperty(window.document.documentElement, 'clientHeight', { value: 1000 });
    window.document.documentElement.style.cssText += 'width:1440px;height:1000px';
    window.document.body.style.cssText += 'width:1440px;height:1000px';
    for (const [key, value] of Object.entries(stored)) window.localStorage.setItem(key, value);
    try {
        for (const element of window.document.querySelectorAll('script[src], link[href], img[src]')) {
            const reference = element.getAttribute('src') || element.getAttribute('href');
            if (/^(?:https?:)?\/\//.test(reference)) continue;
            await access(resolve(root, 'demos', reference.split(/[?#]/)[0]));
        }
        for (const script of window.document.querySelectorAll('script')) {
            const source = script.getAttribute('src');
            if (source) {
                assert.ok(!/^(?:https?:)?\/\//.test(source), 'scripts are local');
                window.eval(await readFile(resolve(root, 'demos', source), 'utf8'));
                if (/jquery-4\.0\.0/.test(source)) {
                    const $ = window.jQuery;
                    window.CSS = { escape: $.escapeSelector };
                    // Same geometry workaround as test/layout.test.mjs.
                    $.expr.pseudos.visible = () => true;
                    $.expr.pseudos.hidden = () => false;
                    $.fx.off = true;
                }
            } else window.eval(script.textContent);
        }
        await new Promise(done => window.setTimeout(done, 30));
        assert.deepEqual(errors, [], 'setup does not throw');
        return { window, $: window.jQuery, errors };
    } catch (error) { window.close(); throw error; }
}

function layouts($, includePending = false) {
    return [...new Set($('*').toArray().map(element => $(element).data('layout'))
        .filter(layout => layout?.state && (includePending || layout.state.initialized) && !layout.destroyed))];
}

for (const file of demos) {
    test(`demo ${file}: runtime integration`, async t => {
        const { window, $, errors } = await loadDemo(file);
        t.after(() => window.close());
        if (file === 'index.html') {
            assert.equal(window.document.querySelectorAll('a[href$=".html"]').length, 18);
            assert.match(window.document.body.textContent, /layout-jquery3 2\.0\.1/);
            return;
        }
        assert.equal($.fn.jquery, '4.0.0');
        if (file === 'destroy.html') {
            window.createLayout('body');
            window.createLayout('body > .ui-layout-center');
        }
        assert.ok(layouts($).length > 0, 'demo creates a layout');
        // Runtime smoke intentionally retains jsdom's zero-layout geometry.
        // Full pane geometry/callback cases are covered by layout.test.mjs.
        // Activate a different tab/accordion section to invoke demo callbacks.
        $('.ui-tabs').first().each(function () {
            const tabs = $(this);
            if (tabs.find('> .ui-tabs-nav > li').length > 1) {
                tabs.tabs('option', 'active', 1);
                assert.equal(tabs.tabs('option', 'active'), 1);
            }
        });
        $('.ui-accordion').first().each(function () {
            const accordion = $(this);
            if (accordion.children('.ui-accordion-header').length > 1) {
                accordion.accordion('option', 'active', 1);
                assert.equal(accordion.accordion('option', 'active'), 1);
            }
        });
        t.diagnostic(`${layouts($).length} initialized layouts; ${layouts($, true).length - layouts($).length} deferred layouts (jsdom has no geometry)`);
        if (file === 'custom_togglers.html') {
            const layout = window.myLayout;
            // Supply dimensions only for this single-layout demo.
            layout.container.css({ width: 1440, height: 1000 });
            layout.resizeAll();
            layout.open('west', false, true);
            layout.togglers.west.find('.btnToggler').first().trigger('click');
            assert.equal(layout.state.west.isClosed, true);
            layout.togglers.west.find('.btnToggler').first().trigger('click');
            assert.equal(layout.state.west.isClosed, false);
        }
        if (file === 'layout_inside_dialog.html') {
            for (let i = 0; i < 2; i++) {
                $('#dialogBox').dialog('close');
                assert.equal($('#dialogBox').dialog('isOpen'), false);
                $('#dialogOpener').trigger('click');
                assert.equal($('#dialogBox').dialog('isOpen'), true);
            }
        }
        if (file === 'destroy.html') {
            const original = window.innerLayout;
            window.destroyLayout('body > .ui-layout-center');
            assert.equal(original.destroyed, true);
            window.createLayout('body > .ui-layout-center');
            assert.notEqual(window.innerLayout, original);
            assert.equal(window.innerLayout.state.initialized, true);
        }
        if (file === 'destroy2.html') {
            for (const name of ['Inner']) {
                for (const verb of ['Destroy', 'Create']) {
                    const button = $('button').toArray().find(element => element.textContent.trim() === `${verb} ${name}`);
                    assert.ok(button, `${verb} ${name} button exists`);
                    // outside-only does not run inline handlers automatically.
                    window.eval(button.getAttribute('onclick'));
                }
            }
            assert.ok(layouts($).length >= 3);
        }
        if (file === 'swap_panes.html') {
            for (const button of $('button[onclick]').toArray()) window.eval(button.getAttribute('onclick'));
        }
        if (file.startsWith('saved_state')) {
            const saved = window.myLayout.saveState();
            assert.deepEqual(window.myLayout.readStoredState(), saved);
            const storage = Object.fromEntries(Object.keys(window.localStorage).map(key => [key, window.localStorage.getItem(key)]));
            const restored = await loadDemo(file, storage);
            try {
                assert.equal(restored.window.myLayout.options.west.size, saved.west.size);
                assert.equal(restored.window.myLayout.options.west.initClosed, saved.west.initClosed);
            } finally { restored.window.close(); }
        }
        assert.deepEqual(errors, [], 'interactions do not throw');
    });
}
