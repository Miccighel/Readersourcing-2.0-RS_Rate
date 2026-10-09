import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const script = await readFile(new URL("../src/js/rating_web.js", import.meta.url), "utf8");

function uploadControls() {
    const elements = new Map();
    const controls = new Map();
    const statuses = [];
    const element = name => {
        if (!elements.has(name)) {
            elements.set(name, {
                visible: false,
                content: undefined,
                properties: new Map(),
                show() { this.visible = true; return this; },
                hide() { this.visible = false; return this; },
                text(value) { this.content = value; return this; },
                prop(name, value) { this.properties.set(name, value); return this; },
            });
        }
        return elements.get(name);
    };
    class Dropzone {
        static options = {};
        constructor(selector) {
            this.options = Dropzone.options[selector === "#source-publication-dropzone"
                ? "sourcePublicationDropzone" : "annotatedPublicationDropzone"];
            this.handlers = new Map();
            controls.set(selector, this);
        }
        on(event, handler) { this.handlers.set(event, handler); }
    }
    const context = {
        firefoxUploadPopup: false, uploadContextError: undefined, uploadContext: null,
        Dropzone,
        $: () => ({each() {}}),
        chrome: {storage: {sync: {get: (keys, callback) => callback({host: "https://readersourcing.test/"})}}},
        authToken: "synthetic-token",
        currentPublicationUrl: "https://publisher.test/original.pdf",
        buildUrl: (host, path) => new URL(path, host).href,
        paperRatingUrl: (host, url) => new URL(url, host).href,
        window: {open: () => ({focus() {}})},
        showPreparationStatus: (status, message) => statuses.push({status, message}),
        showPreparedPublication: (data, open) => statuses.push({data, open}),
    };
    for (const name of ["annotatedPublicationDropzone", "annotatedPublicationDropzoneSuccess",
        "annotatedPublicationDropzoneError", "goToRatingButton", "sourcePublicationDropzone",
        "sourceUploadSuccess", "sourceUploadError", "extractCaptionFirst", "extractCaptionSecond"]) {
        context[name] = element(name);
    }
    vm.createContext(context);
    vm.runInContext(script.match(/const preparationStates = \{[\s\S]*?\r?\n};/)[0], context);
    for (const name of ["preparationResponse", "uploadErrorResponse"]) {
        const helper = script.match(new RegExp(`function ${name}\\([\\s\\S]*?\\r?\\n}`));
        if (helper) vm.runInContext(helper[0], context);
    }
    vm.runInContext(script.slice(script.indexOf("chrome.storage.sync.get(['host'], result => {"),
        script.indexOf("//######### GO TO RATING URL HANDLING")), context);
    return {controls, elements, statuses};
}

test("successful original upload uses the shared preparation handler and opens the copy", () => {
    const {controls, statuses} = uploadControls();
    const data = {pdf_download_url_link: "https://readersourcing.test/prepared.pdf"};
    controls.get("#source-publication-dropzone").handlers.get("success")({}, data);
    assert.equal(statuses[0].data, data);
    assert.equal(statuses[0].open, true);
});

test("successful extraction clears the previous error and exposes the rating link", () => {
    const {controls, elements} = uploadControls();
    elements.get("annotatedPublicationDropzoneError").text("A previous error.").show();
    const url = "https://readersourcing.test/rate/1/test-reference";
    controls.get("#annotated-publication-dropzone").handlers.get("success")({}, {
        baseUrl: url, message: "The rating URL was found.",
    });
    assert.equal(elements.get("annotatedPublicationDropzoneError").visible, false);
    assert.equal(elements.get("annotatedPublicationDropzoneSuccess").visible, true);
    assert.equal(elements.get("annotatedPublicationDropzoneSuccess").content, "The rating URL was found.");
    assert.equal(elements.get("goToRatingButton").visible, true);
    assert.equal(elements.get("goToRatingButton").properties.get("href"), url);
});

for (const selector of ["#source-publication-dropzone", "#annotated-publication-dropzone"]) {
    test(`${selector} sends the authentication header once`, () => {
        const {controls, statuses} = uploadControls();
        const control = controls.get(selector);
        const headers = [];
        const fields = [];
        const xhr = {setRequestHeader: (name, value) => headers.push({name, value})};
        for (const [name, value] of Object.entries(control.options.headers)) xhr.setRequestHeader(name, value);
        control.handlers.get("sending")?.({}, xhr, {append: (name, value) => fields.push({name, value})});
        assert.deepEqual(headers, [{name: "Authorization", value: "synthetic-token"}]);
        if (selector === "#source-publication-dropzone") {
            assert.deepEqual(fields, [{name: "publication[pdf_url]", value: "https://publisher.test/original.pdf"}]);
            assert.equal(statuses[0].status, "preparing");
        }
    });
}

for (const [selector, errorName, successName, fallback] of [
    ["#source-publication-dropzone", "sourceUploadError", "sourceUploadSuccess",
        "The publication could not be prepared. Please try again."],
    ["#annotated-publication-dropzone", "annotatedPublicationDropzoneError", "annotatedPublicationDropzoneSuccess",
        "The rating URL could not be extracted. Please try again."],
]) {
    for (const [name, response, xhr, expected] of [
        ["a server message", {status: "malformed_pdf", message: "The PDF is invalid."}, {}, "The PDF is invalid."],
        ["server validation errors", {errors: ["The PDF is required."]}, {}, "The PDF is required."],
        ["a Rails error", {status: 422, error: "Unprocessable Entity"}, {}, "Unprocessable Entity"],
        ["a Dropzone message", "You cannot upload files of this type.", {}, "You cannot upload files of this type."],
        ["an XHR response", "Upload failed", {responseText: '{"message":"The operation timed out."}'}, "The operation timed out."],
        ["an empty object", {}, {}, fallback],
        ["an absent response", undefined, {}, fallback],
        ["a null response", null, {responseText: "null"}, fallback],
        ["nontextual error values", {message: {}, errors: [null, {detail: "invalid"}], error: 422}, {}, fallback],
        ["markup as plain text", {errors: ['<img src=x onerror="alert(1)">']}, {}, '<img src=x onerror="alert(1)">'],
    ]) {
        test(`${selector} displays ${name} as readable text`, () => {
            const {controls, elements, statuses} = uploadControls();
            elements.get(successName).show();
            elements.get("goToRatingButton").show();
            controls.get(selector).handlers.get("error")({}, response, xhr);
            assert.equal(elements.get(errorName).content, expected);
            assert.equal(elements.get(errorName).visible, true);
            assert.equal(elements.get(successName).visible, false);
            if (selector === "#source-publication-dropzone") {
                assert.equal(statuses[0].status, response?.status === "malformed_pdf" ? "malformed_pdf" : "failed");
                assert.equal(statuses[0].message, expected);
            } else {
                assert.equal(elements.get("goToRatingButton").visible, false);
            }
        });
    }
}
