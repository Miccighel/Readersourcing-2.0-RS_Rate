import assert from "node:assert/strict";
import {cp, mkdir, mkdtemp, readFile, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";
import test from "node:test";
import {assertDropzoneBundle, buildDropzone} from "../scripts/build_dropzone.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const bundlePath = "dist/chromium/node_modules/dropzone/dist/dropzone.js";

test("both browsers distribute the same readable Dropzone build and its license", async () => {
    const chromium = await readFile(path.join(root, bundlePath), "utf8");
    const firefox = await readFile(path.join(root, "dist/firefox/node_modules/dropzone/dist/dropzone.js"), "utf8");
    assert.equal(chromium, firefox);
    assertDropzoneBundle(chromium);
    assert.match(chromium, /Dropzone 5\.9\.3 \| MIT License/);
    assert.match(chromium, /class _Dropzone extends Emitter/);
    assert.match(chromium, /window\.Dropzone =/);
    const original = await readFile(path.join(root, "node_modules/dropzone/LICENSE"));
    for (const target of ["chromium", "firefox"]) {
        assert.deepEqual(await readFile(path.join(root, `dist/${target}/node_modules/dropzone/LICENSE`)), original);
    }
});

test("source maps contain the exact locked source without private filesystem paths", async () => {
    const directory = path.dirname(path.join(root, bundlePath));
    const map = JSON.parse(await readFile(path.join(root, bundlePath + ".map"), "utf8"));
    assert.equal(map.sources.length, 6);
    assert.equal(map.sources.length, map.sourcesContent.length);
    for (const [index, source] of map.sources.entries()) {
        assert.equal(path.isAbsolute(source), false);
        assert.doesNotMatch(source, /\/Users\/|\/private\/|https?:\/\//);
        assert.equal(map.sourcesContent[index], await readFile(path.resolve(directory, source), "utf8"));
    }
});

test("the build is reproducible in a different checkout directory", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "rs-rate-dropzone-build-"));
    try {
        await mkdir(path.join(directory, "scripts"));
        await mkdir(path.join(directory, "node_modules/dropzone"), {recursive: true});
        await cp(path.join(root, "scripts/dropzone_entry.js"), path.join(directory, "scripts/dropzone_entry.js"));
        await cp(path.join(root, "node_modules/dropzone/src"), path.join(directory, "node_modules/dropzone/src"), {recursive: true});
        await cp(path.join(root, "node_modules/dropzone/package.json"), path.join(directory, "node_modules/dropzone/package.json"));
        const result = await buildDropzone(directory);
        assert.equal(result.version, "5.9.3");
        assert.equal(result.inputs.length, 6);
        assert.equal(result.code, await readFile(path.join(root, bundlePath), "utf8"));
        assert.equal(result.sourceMap, await readFile(path.join(root, bundlePath + ".map"), "utf8"));
    } finally {
        await rm(directory, {recursive: true, force: true});
    }
});

test("validation rejects the upstream legacy distribution rather than hiding its findings", async () => {
    const upstream = await readFile(path.join(root, "node_modules/dropzone/dist/dropzone.js"), "utf8");
    assert.match(upstream, /NullProtoObjectViaActiveX/);
    assert.throws(() => assertDropzoneBundle(upstream), /legacy polyfills/);
    for (const source of ['eval("reader")', 'Function("return this")', 'document.write("reader")',
        'function scriptTag(content) {}', 'new ActiveXObject("htmlfile")']) {
        assert.throws(() => assertDropzoneBundle(source), /legacy polyfills/);
    }
});
