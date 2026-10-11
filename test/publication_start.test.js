import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const script = await readFile(new URL("../src/js/rating_web.js", import.meta.url), "utf8");
const setup = script.slice(script.indexOf("//#######  PUBLICATION STATUS SETUP"),
    script.indexOf("//########## RELOAD HANDLING"));
const publicationUrl = "https://publisher.test/paper.pdf";

function openPublication({token = "synthetic-session", immediateTab = false} = {}) {
    const controls = new Map();
    const requests = [];
    const states = [];
    let receiveTab;
    const control = name => {
        if (!controls.has(name)) controls.set(name, {
            visible: true, properties: {disabled: true},
            show() { this.visible = true; return this; },
            hide() { this.visible = false; return this; },
            prop(name, value) { this.properties[name] = value; return this; },
            find() { return this; },
            text() { return this; },
        });
        return controls.get(name);
    };
    const context = {
        authToken: token,
        currentPublicationUrl: null,
        showPreparationStatus: state => states.push(state),
        queryPublication(callback) {
            receiveTab = callback;
            if (immediateTab) callback([{url: publicationUrl}]);
        },
        ajax: (...args) => requests.push({method: args[0], path: args[1], data: args[5]}),
        emptyAjax: () => assert.fail("The publication lookup must precede the rating and copy reads."),
    };
    for (const name of ["loadingSection", "ratingSection", "ratingControls", "ratingText", "ratingButtons",
        "doRateButton", "configureButton", "saveForLaterCaptionFirst", "saveForLaterCaptionSecond",
        "downloadButton", "openButton", "refreshButton", "showSourceUploadButton"]) {
        context[name] = control(name);
    }
    vm.runInNewContext(setup, context);
    return {controls, requests, states, context, receiveTab};
}

test("the pending tab read already has a checking state with no premature rating controls", () => {
    const {controls, requests, states, context} = openPublication();
    assert.deepEqual(states, ["checking"]);
    assert.equal(controls.get("loadingSection").visible, true);
    for (const name of ["ratingSection", "ratingControls", "ratingText", "doRateButton", "configureButton",
        "openButton", "refreshButton", "saveForLaterCaptionSecond"]) {
        assert.equal(controls.get(name).visible, false, name);
    }
    assert.equal(controls.get("ratingButtons").properties.disabled, true);
    assert.equal(controls.get("showSourceUploadButton").properties.disabled, true);
    assert.equal(context.currentPublicationUrl, null);
    assert.equal(requests.length, 0);
});

test("resolving the tab sends the same lookup and keeps checking while the server is pending", () => {
    const {controls, requests, states, context, receiveTab} = openPublication();
    receiveTab([{url: publicationUrl}]);
    assert.equal(context.currentPublicationUrl, publicationUrl);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].method, "POST");
    assert.equal(requests[0].path, "publications/lookup.json");
    assert.equal(requests[0].data.publication.pdf_url, publicationUrl);
    assert.deepEqual(states, ["checking"]);
    assert.equal(controls.get("loadingSection").visible, true);
    assert.equal(controls.get("doRateButton").visible, false);
    assert.equal(controls.get("showSourceUploadButton").properties.disabled, false);
});

test("a captured upload address follows the same initialization and lookup", () => {
    const {requests, states, context} = openPublication({immediateTab: true});
    assert.deepEqual(states, ["checking"]);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].data.publication.pdf_url, publicationUrl);
    assert.equal(context.currentPublicationUrl, publicationUrl);
});

test("a signed-out publication does not start a tab read or a server request", () => {
    const {requests, states, receiveTab} = openPublication({token: null});
    assert.equal(receiveTab, undefined);
    assert.deepEqual(states, []);
    assert.equal(requests.length, 0);
});
