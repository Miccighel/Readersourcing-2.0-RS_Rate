import {access, readFile, readdir} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "dist");

async function readJson(relativePath) {
    return JSON.parse(await readFile(path.join(projectRoot, relativePath), "utf8"));
}

async function filesBelow(directory, extension) {
    const entries = await readdir(directory, {withFileTypes: true});
    const files = await Promise.all(entries.map(async entry => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return filesBelow(entryPath, extension);
        return entryPath.endsWith(extension) ? [entryPath] : [];
    }));
    return files.flat();
}

async function assertPathExists(relativePath) {
    await access(path.join(outputRoot, relativePath));
}

const packageJson = await readJson("package.json");
const manifest = JSON.parse(await readFile(path.join(outputRoot, "manifest.json"), "utf8"));

if (manifest.manifest_version !== 3) throw new Error("RS_Rate must remain on Manifest V3.");
if (manifest.version !== packageJson.version) {
    throw new Error(`Version mismatch: manifest ${manifest.version}, package ${packageJson.version}.`);
}
if (!manifest.content_security_policy?.extension_pages?.includes("script-src 'self'")) {
    throw new Error("Manifest V3 extension pages must execute bundled scripts only.");
}

const manifestPaths = [
    manifest.background.service_worker,
    manifest.action.default_popup,
    manifest.options_ui.page,
    ...Object.values(manifest.action.default_icon),
    ...Object.values(manifest.icons),
];
await Promise.all(manifestPaths.map(assertPathExists));

const htmlFiles = await filesBelow(path.join(outputRoot, "src", "views"), ".html");
let localAssetCount = 0;

for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, "utf8");
    const assetPattern = /<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/g;

    for (const match of html.matchAll(assetPattern)) {
        const reference = match[1];
        if (/^https?:\/\//i.test(reference)) {
            throw new Error(`Remote executable asset in ${path.relative(outputRoot, htmlFile)}: ${reference}`);
        }
        if (reference.startsWith("#") || reference.startsWith("data:")) continue;

        const assetPath = path.resolve(path.dirname(htmlFile), reference);
        if (!assetPath.startsWith(`${outputRoot}${path.sep}`)) {
            throw new Error(`Asset escapes the extension package: ${reference}`);
        }
        await access(assetPath);
        localAssetCount += 1;
    }

    if (html.includes("localhost:3000/publications/extract")) {
        throw new Error("The PDF extraction endpoint must use the configured RS_Server host.");
    }
}

const javascriptFiles = await filesBelow(path.join(outputRoot, "src", "js"), ".js");
for (const javascriptFile of javascriptFiles) {
    const source = await readFile(javascriptFile, "utf8");
    const importPattern = /from\s+["'](\.[^"']+)["']/g;
    for (const match of source.matchAll(importPattern)) {
        await access(path.resolve(path.dirname(javascriptFile), match[1]));
    }
}

console.log(
    `Validated Manifest V${manifest.manifest_version}, ${htmlFiles.length} views, ` +
    `${javascriptFiles.length} scripts and ${localAssetCount} local asset references.`
);
