import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

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
