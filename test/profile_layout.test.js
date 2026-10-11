import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

test("profile values may wrap without changing or truncating their text", async () => {
    const css = await readFile(new URL("../src/css/rating_web.css", import.meta.url), "utf8");
    const rule = css.match(/#modal-profile #user-score-sect \.box-simple\s*\{([^}]+)}/);
    assert.ok(rule, "The wrap rule must remain scoped to the profile values.");
    assert.match(rule[1], /overflow-wrap:\s*anywhere;/);
    assert.doesNotMatch(rule[1], /text-overflow|overflow:\s*hidden|font-size|word-break:\s*break-all/);
});
