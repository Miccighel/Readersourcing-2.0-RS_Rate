import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const css = await readFile(new URL("src/css/rating_web.css", root), "utf8");
const bootstrap = await readFile(new URL("node_modules/bootstrap/dist/css/bootstrap.min.css", root), "utf8");
const view = await readFile(new URL("src/views/rating_web.html", root), "utf8");

function luminance(hex) {
    const channels = hex.replace("#", "").match(/../g).map(channel => {
        const value = parseInt(channel, 16) / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

test("popup message styles load after Bootstrap and the white text theme", () => {
    const custom = view.indexOf('../css/rating_web.css');
    assert.ok(custom > view.indexOf('bootstrap/dist/css/bootstrap.min.css'));
    assert.ok(custom > view.indexOf('../css/system/style.blue.css'));
});

for (const state of ["info", "success", "warning", "danger"]) {
    test(`${state} messages and their children retain readable Bootstrap text colors`, () => {
        const original = bootstrap.match(new RegExp(`\\.alert-${state}\\{([^}]+)\\}`))[1];
        const originalColor = original.match(/(?:^|;)color:(#[a-f0-9]{6})(?:;|$)/i)[1];
        const background = original.match(/(?:^|;)background-color:(#[a-f0-9]{6})(?:;|$)/i)[1];
        const override = css.match(new RegExp(
            `\\.color-white\\s+\\.alert-${state}\\s*,\\s*\\.color-white\\s+\\.alert-${state}\\s+\\*\\s*\\{([^}]+)\\}`
        ));
        assert.ok(override, "The alert and its child text must override the white text theme.");
        const foreground = override[1].match(/color:\s*(#[a-f0-9]{6})\s*!important\s*;/i)?.[1];
        assert.equal(foreground, originalColor);
        assert.doesNotMatch(override[1], /background|border|padding|margin|font/i);
        const lights = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
        const ratio = (lights[1] + 0.05) / (lights[0] + 0.05);
        assert.ok(ratio >= 4.5, `Text contrast is ${ratio.toFixed(2)}:1.`);
    });
}

test("upload preview filenames and file sizes retain readable text without changing their layout", () => {
    const override = css.match(
        /\.color-white\s+\.dropzone\s+\.dz-details\s*,\s*\.color-white\s+\.dropzone\s+\.dz-details\s+\*\s*\{([^}]+)\}/
    );
    assert.ok(override, "The preview and its child text must override the white text theme.");
    const foreground = override[1].match(/color:\s*(#[a-f0-9]{6})\s*!important\s*;/i)?.[1];
    assert.equal(foreground, "#555555");
    assert.doesNotMatch(override[1], /background|border|padding|margin|font/i);
    const background = css.match(
        /#annotated-publication-dropzone,\s*#source-publication-dropzone\s*\{\s*background-color:\s*(#[a-f0-9]{6})\s*;/i
    )[1];
    for (const surface of [background, "#ffffff"]) {
        const lights = [luminance(foreground), luminance(surface)].sort((a, b) => a - b);
        const ratio = (lights[1] + 0.05) / (lights[0] + 0.05);
        assert.ok(ratio >= 4.5, `Preview contrast is ${ratio.toFixed(2)}:1.`);
    }
});
