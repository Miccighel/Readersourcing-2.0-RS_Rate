import assert from "node:assert/strict";
import test from "node:test";

async function openLogin(message, caseName) {
    const elements = new Map();
    const removed = [];
    globalThis.$ = selector => {
        if (!elements.has(selector)) {
            const element = {
                visible: true,
                content: undefined,
                hide() { this.visible = false; return this; },
                show() { this.visible = true; return this; },
                find(target) { return target; },
                text(value) { this.content = value; return this; },
                append() { assert.fail("A stored server message must not be interpreted as HTML."); },
                on() { return this; },
                submit() { return this; },
                fadeOut() { return this; },
                removeClass() { return this; },
                css() { return this; },
            };
            elements.set(selector, element);
        }
        return elements.get(selector);
    };
    globalThis.chrome = {
        storage: {
            sync: {
                get(keys, callback) { callback({message}); },
                remove(keys) { removed.push(...keys); },
            },
        },
    };
    await import(`../src/js/login.js?case=${caseName}`);
    return {elements, removed};
}

test("login displays a stored server message as text and consumes it", async () => {
    const message = '<img src=x onerror="alert(1)"> & <b>Account created</b>';
    const {elements, removed} = await openLogin(message, "markup");
    assert.equal(elements.get("#success-sect").visible, true);
    assert.equal(elements.get(".alert-success").content, message);
    assert.deepEqual(removed, ["message"]);
});

test("login retains ordinary confirmation messages", async () => {
    const {elements} = await openLogin("Please confirm your email address.", "confirmation");
    assert.equal(elements.get(".alert-success").content, "Please confirm your email address.");
});

test("login hides the success section when no message is stored", async () => {
    const {elements, removed} = await openLogin(undefined, "empty");
    assert.equal(elements.get("#success-sect").visible, false);
    assert.equal(elements.get(".alert-success").content, undefined);
    assert.deepEqual(removed, []);
});
