import assert from "node:assert/strict";
import {mkdir, mkdtemp, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import test from "node:test";
import JSZip from "jszip";
import {checkArchive} from "../scripts/check_archives.mjs";

const assets = {
    "manifest.json": '{"manifest_version":3}',
    "src/views/login.html": "<html></html>",
    "node_modules/jquery/dist/jquery.js": "window.jQuery = {};",
    "node_modules/@fontsource/roboto/latin-400.css": "body {font-family: Roboto;}",
};
const dependencies = {jquery: "^3.7.1", "@fontsource/roboto": "^5.3.0"};

async function withArchive(sourceAssets, archiveAssets, assertion) {
    const directory = await mkdtemp(path.join(tmpdir(), "rs-rate-archive-"));
    try {
        const sourceDir = path.join(directory, "build");
        const archivePath = path.join(directory, "extension.zip");
        for (const [name, content] of Object.entries(sourceAssets)) {
            const file = path.join(sourceDir, name);
            await mkdir(path.dirname(file), {recursive: true});
            await writeFile(file, content);
        }
        const archive = new JSZip();
        for (const [name, content] of Object.entries(archiveAssets)) archive.file(name, content);
        await writeFile(archivePath, await archive.generateAsync({type: "nodebuffer"}));
        await assertion(() => checkArchive(sourceDir, archivePath, dependencies));
    } finally {
        await rm(directory, {recursive: true, force: true});
    }
}

test("accepts an archive containing every build asset, including scoped dependencies", async () => {
    await withArchive(assets, assets, async check => {
        assert.equal(await check(), Object.keys(assets).length);
    });
});

test("rejects an archive that omits the local runtime libraries", async () => {
    const incomplete = Object.fromEntries(Object.entries(assets).filter(([name]) => !name.startsWith("node_modules/")));
    await withArchive(assets, incomplete, check => assert.rejects(check, /Archive file count differs/));
});

test("rejects a substituted asset even when the archive file count is unchanged", async () => {
    const substituted = {...assets, "src/views/other.html": assets["src/views/login.html"]};
    delete substituted["src/views/login.html"];
    await withArchive(assets, substituted, check => assert.rejects(check, /Archive omits a build asset/));
});

test("rejects archived content that differs from the build", async () => {
    const altered = {...assets, "node_modules/jquery/dist/jquery.js": "window.jQuery = null;"};
    await withArchive(assets, altered, check => assert.rejects(check, /Archive asset differs/));
});

test("rejects development dependencies copied into the build and archive", async () => {
    const development = {...assets, "node_modules/node-forge/lib/rsa.js": "development dependency"};
    await withArchive(development, development, check => assert.rejects(check, /Undeclared runtime dependency.*node-forge/));
});

test("rejects an extra archived file outside the build", async () => {
    const extra = {...assets, "extra.txt": "not part of the build"};
    await withArchive(assets, extra, check => assert.rejects(check, /Archive file count differs/));
});
