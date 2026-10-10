import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import {fetchUploadContext, openUploadPage, registerUploadContextCleanup} from "../src/js/publication_context.js";

const runtime = {
    getManifest: () => ({browser_specific_settings: {gecko: {id: "rs-rate@readersourcing.com"}}}),
    getURL: path => `moz-extension://synthetic-extension/${path}`,
};
const publication = "https://publisher.test/article.pdf?download=1";

function sessionStorage() {
    const items = {};
    return {
        items,
        async get(key) { return key === null ? {...items} : {[key]: items[key]}; },
        async set(values) { Object.assign(items, values); },
        async remove(keys) { for (const key of [keys].flat()) delete items[key]; },
    };
}

test("the Firefox upload page keeps the publisher URL while its tab becomes active", async () => {
    const storage = sessionStorage();
    let pageUrl;
    const tabs = {
        async create(options) {
            assert.equal(options.active, false);
            pageUrl = options.url;
            const context = await fetchUploadContext({href: pageUrl}, runtime, storage);
            assert.equal(context.pdf_url, publication);
            return {id: 12};
        },
        async update(id, options) {
            assert.equal(id, 12);
            assert.equal(options.active, true);
            assert.equal(Object.values(storage.items)[0].tabId, id);
        },
    };
    await openUploadPage("source", publication, runtime, storage, tabs);
    assert.equal(pageUrl.includes("publisher.test"), false);
    assert.equal((await fetchUploadContext({href: pageUrl}, runtime, storage)).pdf_url, publication);
});

test("separate upload pages retain separate publication contexts", async () => {
    const storage = sessionStorage();
    const urls = [];
    const tabs = {
        async create({url}) { urls.push(url); return {id: urls.length}; },
        async update() {},
    };
    await openUploadPage("source", publication, runtime, storage, tabs);
    await openUploadPage("source", "https://publisher.test/second.pdf", runtime, storage, tabs);
    assert.notEqual(urls[0], urls[1]);
    assert.equal((await fetchUploadContext({href: urls[0]}, runtime, storage)).pdf_url, publication);
    assert.equal((await fetchUploadContext({href: urls[1]}, runtime, storage)).pdf_url, "https://publisher.test/second.pdf");
});

test("extraction does not require a publisher tab or send its address", async () => {
    const storage = sessionStorage();
    let url;
    await openUploadPage("extract", "about:newtab", runtime, storage, {
        async create(options) { url = options.url; return {id: 7}; },
        async update() {},
    });
    const context = await fetchUploadContext({href: url}, runtime, storage);
    assert.equal(context.mode, "extract");
    assert.equal(context.pdf_url, null);
});

test("ordinary popups and Chromium ignore upload context parameters", async () => {
    const storage = {get() { assert.fail("No context should be read."); }};
    assert.equal(await fetchUploadContext({href: runtime.getURL("src/views/rating_web.html")}, runtime, storage), null);
    assert.equal(await fetchUploadContext({href: "chrome-extension://test/rating_web.html?pdfUpload=invalid"},
        {getManifest: () => ({manifest_version: 3})}, storage), null);
});

test("missing or malformed references never fall back to the extension tab address", async () => {
    const storage = sessionStorage();
    for (const reference of ["invalid", "00000000-0000-0000-0000-000000000000"]) {
        await assert.rejects(fetchUploadContext({href: `${runtime.getURL("src/views/rating_web.html")}?pdfUpload=${reference}`},
            runtime, storage), /choose the PDF upload again/);
    }
});

test("original uploads refuse non-HTTP addresses and embedded credentials", async () => {
    const storage = sessionStorage();
    const tabs = {create() { assert.fail("An invalid source must not open an upload page."); }};
    for (const address of ["moz-extension://test/rating_web.html", "file:///tmp/source.pdf", "https://user:password@publisher.test/paper.pdf"]) {
        await assert.rejects(openUploadPage("source", address, runtime, storage, tabs), /HTTP or HTTPS/);
    }
    assert.deepEqual(storage.items, {});
});

test("a failed tab creation removes its unused context", async () => {
    const storage = sessionStorage();
    await assert.rejects(openUploadPage("source", publication, runtime, storage, {
        async create() { throw new Error("Tab creation failed."); },
    }), /Tab creation failed/);
    assert.deepEqual(storage.items, {});
});

test("closing an upload tab removes only its context and retains the session token", async () => {
    const storage = sessionStorage();
    await storage.set({authToken: "synthetic-token", "pdfUpload:first": {tabId: 10}, "pdfUpload:second": {tabId: 11}});
    let removed;
    registerUploadContextCleanup(runtime, storage, {onRemoved: {addListener: handler => { removed = handler; }}});
    await removed(10);
    assert.deepEqual(storage.items, {authToken: "synthetic-token", "pdfUpload:second": {tabId: 11}});
});

test("the existing publication actions use the captured source instead of the active upload tab", async () => {
    const source = await readFile(new URL("../src/js/rating_web.js", import.meta.url), "utf8");
    const handler = source.match(/function queryPublication[\s\S]*?\n}/)[0];
    const context = {
        uploadContext: {mode: "source", pdf_url: publication}, uploadContextError: undefined,
        chrome: {tabs: {query() { assert.fail("The upload tab must not become the publication."); }}},
    };
    vm.runInNewContext(handler, context);
    let received;
    context.queryPublication(tabs => { received = tabs[0].url; });
    assert.equal(received, publication);
    assert.equal((source.match(/queryPublication\(tabs =>/g) || []).length, 4);
    context.uploadContext = {mode: "extract", pdf_url: null};
    context.queryPublication(() => assert.fail("Extraction must not look up a publication page."));
    context.uploadContextError = new Error("Missing context.");
    context.queryPublication(() => assert.fail("Missing context must not send a publication request."));
});

test("the extraction page hides the unrelated rating and preparation controls", async () => {
    const source = await readFile(new URL("../src/js/rating_web.js", import.meta.url), "utf8");
    const view = await readFile(new URL("../src/views/rating_web.html", import.meta.url), "utf8");
    const setup = source.match(/if \(uploadContext\?\.mode === "extract"\) \{[\s\S]*?\n}/)[0];
    const hidden = [];
    vm.runInNewContext(setup, {
        uploadContext: {mode: "extract"},
        ratingSection: {parent: () => ({hide: () => hidden.push("rating")})},
        saveForLaterSection: {hide: () => hidden.push("preparation")},
    });
    assert.deepEqual(hidden, ["rating", "preparation"]);
    assert.match(view, /id="save-for-later-section"/);
});

async function uploadPageHandler(globals) {
    const source = await readFile(new URL("../src/js/rating_web.js", import.meta.url), "utf8");
    const handler = source.match(/async function showPdfUploadPage\(mode\) \{[\s\S]*?\n}/)[0];
    const context = vm.createContext(globals);
    vm.runInContext(handler, context);
    return context.showPdfUploadPage;
}

test("the Firefox popup closes only after the upload tab is ready", async () => {
    const events = [];
    const window = {close: () => events.push("close")};
    let finish;
    const handler = await uploadPageHandler({
        firefoxUploadPopup: true, currentPublicationUrl: publication, window,
        browser: {extension: {getViews: options => {
            assert.equal(options.type, "popup");
            return [window];
        }}},
        openUploadPage: async (mode, pdfUrl) => {
            assert.equal(mode, "source");
            assert.equal(pdfUrl, publication);
            await new Promise(resolve => { finish = resolve; });
            events.push("ready");
        },
        showPreparationStatus: () => assert.fail("Opening the tab should succeed."),
    });
    const opening = handler("source");
    assert.deepEqual(events, []);
    finish();
    await opening;
    assert.deepEqual(events, ["ready", "close"]);
});

test("a normal Firefox extension tab is never closed as a popup", async () => {
    let opened = false;
    const handler = await uploadPageHandler({
        firefoxUploadPopup: true, currentPublicationUrl: publication,
        window: {close: () => assert.fail("A normal tab must remain open.")},
        browser: {extension: {getViews: () => []}},
        openUploadPage: async () => { opened = true; },
        showPreparationStatus: () => assert.fail("Opening the tab should succeed."),
    });
    await handler("extract");
    assert.equal(opened, true);
});

test("the upload handoff does not use Firefox view APIs in Chromium", async () => {
    let opened = false;
    const handler = await uploadPageHandler({
        firefoxUploadPopup: false, currentPublicationUrl: publication,
        window: {close: () => assert.fail("Chromium must not close its view.")},
        openUploadPage: async () => { opened = true; },
        showPreparationStatus: () => assert.fail("Opening the tab should succeed."),
    });
    await handler("extract");
    assert.equal(opened, true);
});

test("an upload handoff error leaves the popup open and explains the failure", async () => {
    const messages = [];
    const window = {close: () => assert.fail("The failure must remain visible.")};
    const handler = await uploadPageHandler({
        firefoxUploadPopup: true, currentPublicationUrl: publication, window,
        browser: {extension: {getViews: () => [window]}},
        openUploadPage: async () => { throw new Error("Tab activation failed."); },
        showPreparationStatus: (...args) => messages.push(args),
    });
    await handler("source");
    assert.deepEqual(messages, [["failed", "Tab activation failed."]]);
});

test("only upload pages and invalid upload references receive the tab layout", async () => {
    const source = await readFile(new URL("../src/js/rating_web.js", import.meta.url), "utf8");
    const setup = source.match(/body\.toggleClass\("pdf-upload-page"[^;]+;/)[0];
    for (const [uploadContext, uploadContextError, expected] of [
        [undefined, undefined, false],
        [{mode: "source"}, undefined, true],
        [{mode: "extract"}, undefined, true],
        [undefined, new Error("Missing context."), true],
    ]) {
        vm.runInNewContext(setup, {
            uploadContext, uploadContextError,
            body: {toggleClass: (name, enabled) => {
                assert.equal(name, "pdf-upload-page");
                assert.equal(enabled, expected);
            }},
        });
    }
});

test("the upload tab has a centered bounded form without widening the popup", async () => {
    const css = await readFile(new URL("../src/css/rating_web.css", import.meta.url), "utf8");
    const general = await readFile(new URL("../src/css/general.css", import.meta.url), "utf8");
    assert.match(general, /body\s*\{\s*width:\s*300px;/);
    assert.match(css, /body\.pdf-upload-page\s*\{[^}]*width:\s*100%;/);
    const form = css.match(/body\.pdf-upload-page\s*>\s*\.color-white\s*\{([^}]+)}/)[1];
    assert.match(form, /max-width:\s*560px;/);
    assert.match(form, /margin:\s*0 auto;/);
    assert.match(form, /padding:\s*0 16px 24px;/);
});
