import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const readJson = async name => JSON.parse(await readFile(new URL(`../${name}`, import.meta.url), "utf8"));

test("Firefox uses its supported version key and retains the existing extension identity", async () => {
    const manifest = await readJson("manifest-ff.json");
    assert.equal(Object.hasOwn(manifest, "version_name"), false);
    assert.equal(manifest.browser_specific_settings.gecko.id, "rs-rate@readersourcing.com");
});

test("both browser manifests share the package version without removing the Chromium version name", async () => {
    const packageJson = await readJson("package.json");
    const chromium = await readJson("manifest.json");
    const firefox = await readJson("manifest-ff.json");
    assert.equal(chromium.version, packageJson.version);
    assert.equal(chromium.version_name, packageJson.version);
    assert.equal(firefox.version, packageJson.version);
});
