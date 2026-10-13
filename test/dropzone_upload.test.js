import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import {createContext, Script} from "node:vm";

const code = await readFile(new URL("../dist/chromium/node_modules/dropzone/dist/dropzone.js", import.meta.url), "utf8");

function uploadFixture(endpoint, response, status = 200) {
    const requests = [];
    const inputs = [];
    const events = new Map();
    const element = {
        nodeType: 1, tagName: "DIV",
        getAttribute() { return null; },
        getElementsByTagName() { return []; },
        querySelector() { return null; },
        querySelectorAll() { return []; },
        classList: {add() {}, remove() {}, contains() { return false; }},
        addEventListener(name, handler) { events.set(name, handler); },
        removeEventListener(name) { events.delete(name); },
        dispatchEvent() {},
    };
    const body = {
        appendChild(input) { inputs.push(input); input.parentNode = this; },
        removeChild(input) { inputs.splice(inputs.indexOf(input), 1); input.parentNode = null; },
    };
    const document = {
        readyState: "loading", addEventListener() {},
        querySelector(selector) { assert.equal(selector, "body"); return body; },
        createElement(tag) {
            if (tag === "a") return {classList: {}};
            assert.equal(tag, "input");
            return {
                style: {}, attributes: {}, listeners: {},
                setAttribute(key, value) { this.attributes[key] = value; },
                addEventListener(name, handler) { this.listeners[name] = handler; },
                click() { this.clicked = true; },
            };
        },
        write() { assert.fail("Legacy document writes must not run."); },
    };
    class FormData {
        fields = [];
        append(...values) { this.fields.push(values); }
    }
    class XMLHttpRequest {
        upload = {};
        headers = [];
        open(method, url) { this.method = method; this.url = url; this.readyState = 1; }
        setRequestHeader(name, value) { this.headers.push([name, value]); }
        getResponseHeader() { return "application/json"; }
        send(body) {
            this.body = body;
            requests.push(this);
            this.readyState = 4;
            this.status = status;
            this.responseText = JSON.stringify(response);
            this.onload({});
        }
    }
    const context = createContext({
        console, setTimeout, clearTimeout, document,
        navigator: {userAgent: "Firefox"},
        File() {}, FileReader() {}, FileList() {}, Blob() {},
        FormData, XMLHttpRequest,
        CustomEvent: class { constructor(type, detail) { this.type = type; this.detail = detail; } },
        addEventListener() {},
    }, {codeGeneration: {strings: false, wasm: false}});
    context.window = context;
    new Script(code).runInContext(context);
    const zone = new context.Dropzone(element, {
        url: endpoint, acceptedFiles: "application/pdf", paramName: "file", maxFiles: 1,
        headers: {Authorization: "synthetic-token"},
        autoProcessQueue: false, previewsContainer: false, createImageThumbnails: false,
    });
    return {zone, requests, inputs, events, element, Dropzone: context.Dropzone};
}

for (const mode of ["fetch_upload", "extract"]) {
    test(`the shipped Dropzone preserves ${mode} multipart uploads and JSON success`, () => {
        const result = mode === "extract" ? {baseUrl: "https://rs.test/rate/1/test-reference"} : {preparation_status: "complete"};
        const {zone, requests, inputs, events, element, Dropzone} = uploadFixture(`https://rs.test/publications/${mode}.json`, result);
        const successes = [];
        zone.on("success", (file, data) => successes.push(data));
        if (mode === "fetch_upload") zone.on("sending", (file, xhr, form) => form.append("publication[pdf_url]", "https://publisher.test/Reader.pdf"));
        events.get("click")({target: element});
        assert.equal(inputs[0].clicked, true);
        assert.equal(inputs[0].attributes.accept, "application/pdf");
        const file = {name: "Reader.pdf", size: 100, type: "application/pdf"};
        zone.addFile(file);
        zone.processFile(file);
        assert.equal(requests.length, 1);
        assert.equal(requests[0].method, "POST");
        assert.equal(requests[0].url, `https://rs.test/publications/${mode}.json`);
        assert.deepEqual(requests[0].headers.filter(([key]) => key === "Authorization"), [["Authorization", "synthetic-token"]]);
        assert.equal(requests[0].withCredentials, false);
        assert.deepEqual(requests[0].body.fields.filter(([name]) => name === "file"), [["file", file, "Reader.pdf"]]);
        assert.equal(requests[0].body.fields.some(([name]) => name === "publication[pdf_url]"), mode === "fetch_upload");
        assert.equal(JSON.stringify(successes), JSON.stringify([result]));
        assert.equal(file.status, Dropzone.SUCCESS);
        zone.destroy();
        assert.equal(inputs.length, 0);
    });
}

test("the shipped Dropzone preserves PDF rejection and structured server errors", () => {
    const result = {status: "malformed_pdf", message: "The PDF is invalid."};
    const {zone, requests, Dropzone} = uploadFixture("https://rs.test/publications/extract.json", result, 422);
    const errors = [];
    zone.on("error", (file, error) => errors.push(error));
    const invalid = {name: "Reader.txt", size: 100, type: "text/plain"};
    zone.addFile(invalid);
    assert.equal(invalid.accepted, false);
    assert.equal(requests.length, 0);
    zone.removeFile(invalid);
    const file = {name: "Reader.pdf", size: 100, type: "application/pdf"};
    zone.addFile(file);
    zone.processFile(file);
    assert.equal(file.status, Dropzone.ERROR);
    assert.equal(JSON.stringify(errors.at(-1)), JSON.stringify(result));
    assert.equal(requests.length, 1);
    zone.destroy();
});
