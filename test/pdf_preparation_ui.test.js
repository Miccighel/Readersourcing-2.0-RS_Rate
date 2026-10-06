import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const script = await readFile(new URL("../src/js/rating_web.js", import.meta.url), "utf8");
const view = await readFile(new URL("../src/views/rating_web.html", import.meta.url), "utf8");

test("prepares a publication only after the reader requests it", () => {
    assert.doesNotMatch(script, /publications\/is_fetchable\.json/);
    assert.match(script, /publications\/fetch\.json/);
    assert.match(script, /showPreparationStatus\("preparing"\)/);
    assert.match(script, /showPreparationStatus\("complete"\)/);
});

test("offers the original PDF upload through the same status interface", () => {
    assert.match(script, /publications\/fetch_upload\.json/);
    assert.match(script, /authentication_required/);
    assert.match(script, /verification_failed/);
    assert.match(view, /id="publication-preparation-status"/);
    assert.match(view, /id="source-publication-dropzone"/);
});

test("validates an extracted rating URL before assigning or opening it", () => {
    assert.match(script, /paperRatingUrl\(host, data\["baseUrl"\]\)/);
    assert.doesNotMatch(script, /window\.open\(data\["baseUrl"\]/);
    assert.match(script, /window\.open\(ratingUrl/);
});

test("explains a stopped PDF operation and offers the original upload", () => {
    assert.match(script, /processing_timeout: \["PDF operation timed out"/);
    assert.match(script, /Any previous prepared copy remains available/);
    assert.match(script, /const uploadStates = \[[^;]+"processing_timeout"/);
});

test("successful preparation clears the previous preparation error", () => {
    const handler = script.match(/function showPreparedPublication[\s\S]*?\n}\r?\n/)[0];
    const calls = [];
    const control = name => new Proxy({}, {
        get: (_, method) => (...args) => {
            calls.push({name, method, args});
            return control(name);
        },
    });
    const context = {
        saveForLaterSection: {find: section => {
            assert.equal(section, "preparation errors");
            return {
                hide: () => calls.push({name: "preparation errors", method: "hide"}),
                find: alert => {
                    assert.equal(alert, "alert");
                    return {empty: () => calls.push({name: "preparation alert", method: "empty"})};
                },
            };
        }},
        errorsSection: "preparation errors", alert: "alert", reloadIcons: "reload icons",
        showPreparationStatus: state => calls.push({name: "status", method: state}),
        window: {open: () => ({focus() {}})},
    };
    for (const name of ["saveForLaterCaptionFirst", "saveForLaterCaptionSecond",
        "downloadButton", "openButton", "refreshButton", "sourceUploadSuccess", "sourceUploadError"]) {
        context[name] = control(name);
    }
    vm.createContext(context);
    vm.runInContext(handler, context);
    for (const openPublication of [false, true]) {
        context.showPreparedPublication({pdf_download_url_link: "/prepared.pdf"}, openPublication);
    }
    assert.equal(calls.filter(call => call.name === "preparation errors" && call.method === "hide").length, 2);
    assert.equal(calls.filter(call => call.name === "preparation alert" && call.method === "empty").length, 2);
    assert.equal(calls.filter(call => call.name === "status" && call.method === "complete").length, 2);
});
