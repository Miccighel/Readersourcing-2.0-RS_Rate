import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test, {afterEach} from "node:test";
import vm from "node:vm";

const originalGlobals = {
    chrome: globalThis.chrome, browser: globalThis.browser, Cookies: globalThis.Cookies,
    $: globalThis.$, XMLHttpRequest: globalThis.XMLHttpRequest,
};
let pageNumber = 0;

afterEach(() => Object.assign(globalThis, originalGlobals));

function firefoxSession(initialToken) {
    const items = initialToken === undefined ? {} : {authToken: initialToken};
    const listeners = [];
    const session = {
        async get(key) {
            assert.equal(key, "authToken");
            return {...items};
        },
        async set(values) {
            const oldValue = items.authToken;
            Object.assign(items, values);
            for (const listener of listeners) listener({authToken: {oldValue, newValue: items.authToken}});
        },
        async remove(key) {
            assert.equal(key, "authToken");
            const oldValue = items.authToken;
            delete items.authToken;
            for (const listener of listeners) listener({authToken: {oldValue}});
        },
        onChanged: {addListener: listener => listeners.push(listener)},
    };
    globalThis.chrome = {
        runtime: {getManifest: () => ({browser_specific_settings: {gecko: {id: "rs-rate@readersourcing.com"}}})},
    };
    globalThis.browser = {storage: {session}};
    globalThis.Cookies = {
        set() { assert.fail("Firefox must not store its token in document cookies."); },
        get() { assert.fail("Firefox must not read its token from document cookies."); },
        remove() { assert.fail("Firefox must not depend on document cookies for logout."); },
    };
    return {session, items};
}

function openPage() {
    return import(`../src/js/shared.js?firefox-session=${++pageNumber}`);
}

test("Firefox starts without a token when extension session storage is empty", async () => {
    firefoxSession();
    const page = await openPage();
    assert.equal(page.fetchToken(), undefined);
});

test("Firefox loads the session token before a controller can read it", async () => {
    firefoxSession("synthetic-reader-token");
    const page = await openPage();
    assert.equal(page.fetchToken(), "synthetic-reader-token");
});

test("Firefox retains the token when another extension page opens", async () => {
    const {items} = firefoxSession();
    const page = await openPage();
    await page.storeToken("synthetic-reader-token");
    assert.equal(items.authToken, "synthetic-reader-token");
    const reopenedPage = await openPage();
    assert.equal(reopenedPage.fetchToken(), "synthetic-reader-token");
});

test("Firefox waits for the token write before accepting the new session", async () => {
    const {session} = firefoxSession();
    let finishWrite;
    session.set = () => new Promise(resolve => { finishWrite = resolve; });
    const page = await openPage();
    const writing = page.storeToken("synthetic-reader-token");
    assert.equal(page.fetchToken(), undefined);
    finishWrite();
    await writing;
    assert.equal(page.fetchToken(), "synthetic-reader-token");
});

test("Firefox clears the token in open pages and newly opened pages on logout", async () => {
    const {items} = firefoxSession("synthetic-reader-token");
    const firstPage = await openPage();
    const secondPage = await openPage();
    await firstPage.deleteToken();
    assert.equal(items.authToken, undefined);
    assert.equal(firstPage.fetchToken(), undefined);
    assert.equal(secondPage.fetchToken(), undefined);
    assert.equal((await openPage()).fetchToken(), undefined);
});

test("Firefox does not accept a token when session storage rejects the write", async () => {
    const {session} = firefoxSession();
    session.set = async () => { throw new Error("Session storage unavailable."); };
    const page = await openPage();
    await assert.rejects(page.storeToken("synthetic-reader-token"), /Session storage unavailable/);
    assert.equal(page.fetchToken(), undefined);
});

test("Firefox does not initialize a controller after a session read failure", async () => {
    const {session} = firefoxSession();
    session.get = async () => { throw new Error("Session storage unavailable."); };
    await assert.rejects(openPage(), /Session storage unavailable/);
});

for (const method of ["ajax", "emptyAjax"]) {
    test(`Firefox ${method} omits browser cookies and retains explicit token authentication`, async () => {
        firefoxSession("synthetic-reader-token");
        globalThis.chrome.storage = {
            sync: {get: (keys, callback) => callback({host: "http://127.0.0.1:3300/"})},
        };
        let request;
        globalThis.$ = {ajax: options => { request = options; return options; }};
        globalThis.XMLHttpRequest = class {
            constructor(options) { this.options = options; }
        };
        const page = await openPage();
        await page[method]("POST", "users/info.json", "application/json", "json", true);
        assert.equal(request.url, "http://127.0.0.1:3300/users/info.json");
        assert.equal(request.headers.Authorization, "synthetic-reader-token");
        assert.deepEqual(request.xhr().options, {mozAnon: true});
    });
}

test("Chromium keeps cookie token storage and the default request transport", async () => {
    let cookieToken;
    globalThis.chrome = {
        runtime: {getManifest: () => ({manifest_version: 3})},
        storage: {sync: {get: (keys, callback) => callback({host: "http://127.0.0.1:3300/"})}},
    };
    globalThis.browser = {
        storage: {get session() { assert.fail("Chromium must not use the Firefox session adapter."); }},
    };
    globalThis.Cookies = {
        set(key, value) { assert.equal(key, "authToken"); cookieToken = value; },
        get(key) { assert.equal(key, "authToken"); return cookieToken; },
        remove(key) { assert.equal(key, "authToken"); cookieToken = undefined; },
    };
    let request;
    globalThis.$ = {ajax: options => { request = options; return options; }};
    const page = await openPage();
    await page.storeToken("synthetic-reader-token");
    assert.equal(page.fetchToken(), "synthetic-reader-token");
    for (const method of ["ajax", "emptyAjax"]) {
        await page[method]("POST", "users/info.json", "application/json", "json", true);
        assert.equal(request.headers.Authorization, "synthetic-reader-token");
        assert.equal(Object.hasOwn(request, "xhr"), false);
    }
    await page.deleteToken();
    assert.equal(page.fetchToken(), undefined);
});

test("logout waits for local token removal before opening the login page", async () => {
    const source = await readFile(new URL("../src/js/rating_web.js", import.meta.url), "utf8");
    let logoutHandler;
    let successCallback;
    let finishRemoval;
    const removing = new Promise(resolve => { finishRemoval = resolve; });
    const context = {
        logoutButton: {on: (event, handler) => { logoutHandler = handler; }},
        deleteToken: () => removing,
        emptyAjax: (...args) => { successCallback = args[5]; },
        window: {location: {href: "rating_web.html"}},
    };
    vm.runInNewContext(source.slice(source.indexOf('logoutButton.on("click"'),
        source.indexOf("//######### OPTIONS HANDLING")), context);
    logoutHandler();
    const completing = successCallback({});
    assert.equal(context.window.location.href, "rating_web.html");
    finishRemoval();
    await completing;
    assert.equal(context.window.location.href, "login.html");
});
