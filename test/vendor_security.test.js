import assert from "node:assert/strict";
import {readFile, readdir} from "node:fs/promises";
import test from "node:test";
import {createContext, Script} from "node:vm";

const root = new URL("../", import.meta.url);

async function loadLibrary(path, globals = {}) {
    const context = createContext({console, setTimeout, clearTimeout, ...globals}, {
        codeGeneration: {strings: false, wasm: false},
    });
    context.window = context;
    context.self = context;
    context.addEventListener = () => {};
    new Script(await readFile(new URL(path, root), "utf8"), {filename: path}).runInContext(context);
    return context;
}

async function dropzoneFixture() {
    const html = [];
    const textNode = () => ({
        textContent: "",
        set innerHTML(value) { assert.fail(`Expected text, received HTML: ${value}`); },
    });
    const name = textNode();
    const error = textNode();
    const size = {innerHTML: ""};
    const preview = {
        classList: {add() {}},
        querySelectorAll(selector) {
            return {
                "[data-dz-name]": [name],
                "[data-dz-size]": [size],
                "[data-dz-errormessage]": [error],
            }[selector] ?? [];
        },
    };
    const document = {
        readyState: "loading",
        addEventListener() {},
        querySelector() { return null; },
        querySelectorAll() { return []; },
        write() { assert.fail("The legacy document.write fallback must not run."); },
        createElement(tag) {
            assert.notEqual(tag, "iframe", "The legacy iframe fallback must not run.");
            if (tag === "div") {
                return {
                    childNodes: [preview],
                    set innerHTML(value) { html.push(value); },
                };
            }
            return {style: {}, classList: {}};
        },
    };
    const context = await loadLibrary("node_modules/dropzone/dist/dropzone.js", {
        document,
        navigator: {userAgent: "Firefox"},
        File() {}, FileReader() {}, FileList() {}, Blob() {}, FormData() {},
        ActiveXObject() { assert.fail("The ActiveX fallback must not run."); },
    });
    const Dropzone = context.Dropzone;
    // Isolate the shipped default handlers from layout, drag events, and network requests.
    Dropzone.prototype.init = function () {};
    const appended = [];
    const element = {
        nodeType: 1,
        getAttribute() { return null; },
        getElementsByTagName() { return []; },
        classList: {add() {}},
        appendChild(value) { appended.push(value); },
    };
    const zone = new Dropzone(element, {url: "/upload"});
    return {context, zone, html, appended, preview, name, error, size};
}

test("Dropzone loads with native globals and string compilation disabled", async () => {
    const {context, zone, html} = await dropzoneFixture();
    assert.equal(zone.version, "5.9.3");
    assert.equal(zone.options.addRemoveLinks, false);
    assert.deepEqual(html, []);
    assert.throws(() => new Script('Function("return 1")()').runInContext(context), /Code generation/);
});

test("Dropzone places hostile filenames and upload errors in text nodes", async () => {
    const {zone, html, appended, preview, name, error, size} = await dropzoneFixture();
    const payload = '<img src=x onerror="alert(1)">';
    const file = {name: payload, size: 123};
    zone.options.addedfile.call(zone, file);
    zone.options.error.call(zone, file, payload);
    assert.equal(name.textContent, payload);
    assert.equal(error.textContent, payload);
    assert.equal(file.previewElement, preview);
    assert.deepEqual(appended, [preview]);
    assert.deepEqual(html, [zone.options.previewTemplate.trim()]);
    assert.equal(html[0].includes(payload), false);
    assert.equal(size.innerHTML, "<strong>0.1</strong> KB");
    assert.equal(file._removeLink, undefined);
    zone.options.processing.call(zone, file);
    zone.options.complete.call(zone, file);
    assert.deepEqual(html, [zone.options.previewTemplate.trim()]);
    zone.options.error.call(zone, file, {error: payload});
    assert.equal(error.textContent, payload);
});

test("Dropzone formats numeric file sizes with its local unit labels", async () => {
    const {zone} = await dropzoneFixture();
    for (const value of [0, 1, 123, 1048576, 25 * 1024 * 1024]) {
        assert.match(zone.filesize(value), /^<strong>\d+(?:\.\d+)?<\/strong> (?:b|KB|MB|GB|TB)$/);
    }
});

test("the rating slider has no HTML tick labels and writes tooltip text literally", async () => {
    const {Slider} = await loadLibrary("node_modules/bootstrap-slider/dist/bootstrap-slider.js");
    assert.equal(Slider.prototype.defaultOptions.ticks_labels.length, 0);
    const node = {
        textContent: "",
        set innerHTML(value) { assert.fail(`Expected slider text, received HTML: ${value}`); },
    };
    const payload = '<svg onload="alert(1)">';
    Slider.prototype._setText(node, payload);
    assert.equal(node.textContent, payload);
});

test("current views and controllers retain the reviewed vendor configuration", async () => {
    const viewPaths = (await readdir(new URL("src/views/", root), {recursive: true})).filter(path => path.endsWith(".html"));
    const views = (await Promise.all(viewPaths.map(path => readFile(new URL(`src/views/${path}`, root), "utf8")))).join("\n");
    const scriptPaths = (await readdir(new URL("src/js/", root), {recursive: true})).filter(path => path.endsWith(".js"));
    const scripts = (await Promise.all(scriptPaths.map(path => readFile(new URL(`src/js/${path}`, root), "utf8")))).join("\n");
    assert.doesNotMatch(views, /<select\b|\bbs-select\b|data-slider-ticks|data-content\s*=/i);
    assert.doesNotMatch(scripts, /ticks_labels|previewTemplate|addRemoveLinks|dict[A-Z]|FontAwesome|\.html\s*\(/);
    assert.doesNotMatch(views, /fa-layers-text|data-search-pseudo-elements|FontAwesomeConfig/i);
    assert.match(scripts, /ratingSlider\.slider\(\{\}\)/);
});

test("both manifests retain a policy without dynamic string compilation", async () => {
    for (const path of ["manifest.json", "manifest-ff.json"]) {
        const manifest = JSON.parse(await readFile(new URL(path, root), "utf8"));
        assert.equal(manifest.content_security_policy.extension_pages, "script-src 'self'; object-src 'self';");
    }
});
