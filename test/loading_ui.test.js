import assert from "node:assert/strict";
import {readFile, readdir} from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../", import.meta.url);

test("extension views and controllers have no full page loading overlay", async () => {
    for (const name of await readdir(new URL("src/views/", root))) {
        if (!name.endsWith(".html")) continue;
        const view = await readFile(new URL(`src/views/${name}`, root), "utf8");
        assert.doesNotMatch(view, /preloader-wrapper/, name);
    }
    for (const name of await readdir(new URL("src/js/", root))) {
        if (!name.endsWith(".js")) continue;
        const source = await readFile(new URL(`src/js/${name}`, root), "utf8");
        assert.doesNotMatch(source, /removePreloader|addClass\(['"]preloader['"]\)/, name);
    }
});

for (const [page, button, variable] of [
    ["login", "login-btn", "loginButton"],
    ["sign_up", "sign-up-btn", "registrationButton"],
    ["password_forgot", "password-forgot-btn", "passwordForgotButton"],
    ["password_update", "password-edit-btn", "passwordEditButton"],
]) {
    test(`${page} enables submission only after its handlers are registered`, async () => {
        const view = await readFile(new URL(`src/views/${page}.html`, root), "utf8");
        const source = await readFile(new URL(`src/js/${page}.js`, root), "utf8");
        const markup = view.match(new RegExp(`<button[^>]*id="${button}"[^>]*>`))[0];
        assert.match(markup, /\bdisabled\b/);
        const ready = source.indexOf(`${variable}.prop("disabled", false)`);
        assert.ok(ready > source.indexOf(`${variable}.on("click"`));
        assert.ok(ready > source.indexOf(".submit("));
    });
}

test("idle indicators and messages are hidden before initialization, with reduced motion", async () => {
    const css = await readFile(new URL("src/css/general.css", root), "utf8");
    assert.match(css, /\.reload-icon, \.errors-sect, \.error-btn, #success-sect[^}]*display:\s*none;/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.reload-icon svg, #loading-sect \.fa-spin[^}]*animation:\s*none/);
});

test("publication controls are initially safe and readiness follows the lookup", async () => {
    const view = await readFile(new URL("src/views/rating_web.html", root), "utf8");
    const source = await readFile(new URL("src/js/rating_web.js", root), "utf8");
    for (const id of ["do-rate-btn", "configure-btn", "download-btn", "show-source-upload-btn", "show-extract-upload-btn"]) {
        assert.match(view.match(new RegExp(`<button[^>]*id="${id}"[^>]*>`))[0], /\bdisabled\b/);
    }
    assert.doesNotMatch(source, /showPreparationStatus\("ready"\);\s*successCallback\(\{}/);
    assert.match(source, /if \(authToken == null\) window\.location\.href = "login\.html"/);
});

async function openProfile(authToken = "synthetic-session") {
    const source = await readFile(new URL("src/js/profile_update.js", root), "utf8");
    const elements = new Map();
    const requests = [];
    const location = {href: "profile_update.html"};
    const $ = selector => {
        if (typeof selector !== "string") return selector;
        if (!elements.has(selector)) {
            const element = {
                visible: true, value: "", content: "", properties: {}, attributes: {}, handlers: {},
                hide() { this.visible = false; return this; },
                show() { this.visible = true; return this; },
                text(value) { this.content = value; return this; },
                val(value) { if (arguments.length === 0) return this.value; this.value = value; return this; },
                prop(name, value) { if (arguments.length === 1) return this.properties[name]; this.properties[name] = value; return this; },
                attr(name, value) { this.attributes[name] = value; return this; },
                find: target => $(target),
                parent() { return this; },
                on(name, handler) { this.handlers[name] = handler; return this; },
                submit() { return this; },
                parsley: () => ({validate() {}, isValid: () => true}),
            };
            elements.set(selector, element);
        }
        return elements.get(selector);
    };
    vm.runInNewContext(source.replace(/^import .*;\r?\n/gm, ""), {
        $, fetchToken: () => authToken, window: {location, history: {back() {}}},
        emptyAjax: (...args) => requests.push({method: args[0], path: args[1], success: args[5], error: args[6]}),
        ajax: () => assert.fail("Reading a profile must not update it."),
    });
    return {elements, requests, location};
}

test("profile fields stay visible and disabled during a real read", async () => {
    const {elements, requests} = await openProfile();
    assert.equal(requests.length, 1);
    assert.equal(requests[0].method, "POST");
    assert.equal(requests[0].path, "/users/info.json");
    for (const id of ["#first-name", "#last-name", "#orcid", "#subscribe"]) {
        assert.equal(elements.get(id).visible, true, id);
        assert.equal(elements.get(id).properties.disabled, true, id);
    }
    assert.equal(elements.get("#update-btn").properties.disabled, true);
    assert.equal(elements.get(".field-loading-icon").visible, true);
    assert.equal(elements.get("#sign-up-form").attributes["aria-busy"], "true");
    assert.notEqual(elements.get("#back-btn").properties.disabled, true);
    assert.notEqual(elements.get("#options-btn").properties.disabled, true);
});

test("a completed profile read populates fields and removes only their local indicators", async () => {
    const {elements, requests} = await openProfile();
    requests[0].success({first_name: "Demo", last_name: "Reader", orcid: "", subscribe: true});
    assert.equal(elements.get("#first-name").value, "Demo");
    assert.equal(elements.get("#last-name").value, "Reader");
    assert.equal(elements.get("#subscribe").properties.checked, true);
    for (const id of ["#first-name", "#last-name", "#orcid", "#subscribe", "#update-btn"]) {
        assert.equal(elements.get(id).properties.disabled, false, id);
    }
    assert.equal(elements.get(".field-loading-icon").visible, false);
    assert.equal(elements.get("#profile-loading-status").visible, false);
    assert.equal(elements.get("#sign-up-form").attributes["aria-busy"], "false");
});

test("a failed profile read does not allow editing and can be retried", async () => {
    const {elements, requests} = await openProfile();
    requests[0].error({status: 500});
    assert.equal(elements.get(".field-loading-icon").visible, false);
    assert.equal(elements.get("#update-btn").properties.disabled, true);
    assert.match(elements.get("#profile-loading-status").content, /could not be loaded/);
    assert.equal(elements.get("#profile-retry-btn").visible, true);
    elements.get("#update-btn").handlers.click();
    assert.equal(requests.length, 1);
    elements.get("#profile-retry-btn").handlers.click();
    assert.equal(requests.length, 2);
    assert.equal(elements.get("#profile-retry-btn").visible, false);
    assert.equal(elements.get(".field-loading-icon").visible, true);
    requests[1].success({first_name: "Demo", last_name: "Reader", orcid: "", subscribe: false});
    assert.equal(elements.get("#update-btn").properties.disabled, false);
});

test("an unsigned-in profile view requests no data and opens login", async () => {
    const {requests, location} = await openProfile(null);
    assert.equal(requests.length, 0);
    assert.equal(location.href, "login.html");
});
