import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import {removePreloader} from "../src/js/shared.js";

function finishLoading(matchMedia) {
    const previousDollar = globalThis.$;
    const previousMatchMedia = globalThis.matchMedia;
    const events = [];
    globalThis.matchMedia = matchMedia;
    globalThis.$ = selector => ({
        stop(clearQueue, jumpToEnd) {
            events.push([selector, "stop", clearQueue, jumpToEnd]);
            return this;
        },
        fadeOut(duration) { events.push([selector, "fadeOut", duration]); return this; },
        removeClass(name) { events.push([selector, "removeClass", name]); return this; },
        css(name, value) { events.push([selector, "css", name, value]); return this; },
    });
    try {
        removePreloader();
        removePreloader();
        return events;
    } finally {
        globalThis.$ = previousDollar;
        globalThis.matchMedia = previousMatchMedia;
    }
}

test("initial loading ends with a short fade and clears queued animations", () => {
    const events = finishLoading(query => {
        assert.equal(query, "(prefers-reduced-motion: reduce)");
        return {matches: false};
    });
    const completion = [
        [".preloader-wrapper", "stop", true, true],
        [".preloader-wrapper", "fadeOut", 180],
        ["body", "removeClass", "preloader"],
        [".preloader", "css", "overflow", "visible"],
    ];
    assert.deepEqual(events, [...completion, ...completion]);
});

test("reduced motion removes the loading overlay without a fade", () => {
    const events = finishLoading(() => ({matches: true}));
    assert.deepEqual(events.filter(event => event[1] === "fadeOut"), [
        [".preloader-wrapper", "fadeOut", 0],
        [".preloader-wrapper", "fadeOut", 0],
    ]);
});

test("loading completion works when matchMedia is unavailable", () => {
    const events = finishLoading(undefined);
    assert.equal(events.find(event => event[1] === "fadeOut")[2], 180);
});

test("the initial overlay is translucent and respects reduced motion", async () => {
    const css = await readFile(new URL("../src/css/general.css", import.meta.url), "utf8");
    const overlay = css.match(/\.preloader-wrapper\s*\{([^}]+)}/)[1];
    assert.match(overlay, /background:\s*rgba\(35, 35, 35, 0\.65\);/);
    assert.match(overlay, /position:\s*fixed;/);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*\.preloader-wrapper\s+\.preloader\s+\*\s*\{\s*animation:\s*none\s*!important;/);
});
