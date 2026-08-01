import {access, readFile, readdir} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "dist");
const requiredFirefoxData = [
    "authenticationInfo",
    "personallyIdentifyingInfo",
    "browsingActivity",
    "websiteActivity",
    "websiteContent",
];
const requiredOptionalHosts = [
    "http://*/*",
    "https://*/*",
];

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

function resolveContained(root, relativePath) {
    const resolved = path.resolve(root, relativePath);
    const relative = path.relative(root, resolved);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new Error(`Path escapes the extension package: ${relativePath}`);
    }
    return resolved;
}

async function assertPathExists(root, relativePath) {
    if (!relativePath) throw new Error("Manifest contains an empty extension path.");
    await access(resolveContained(root, relativePath));
}

async function validatePackage(name, packageRoot, manifest, packageJson) {
    if (manifest.manifest_version !== 3) {
        throw new Error(`${name} must remain on Manifest V3.`);
    }
    if (manifest.version !== packageJson.version) {
        throw new Error(
            `${name} version mismatch: manifest ${manifest.version}, package ${packageJson.version}.`,
        );
    }
    if (!manifest.content_security_policy?.extension_pages?.includes("script-src 'self'")) {
        throw new Error(`${name} extension pages must execute bundled scripts only.`);
    }
    for (const origin of requiredOptionalHosts) {
        if (!manifest.optional_host_permissions?.includes(origin)) {
            throw new Error(`${name} must allow the reader to grant access to ${origin}.`);
        }
    }

    const backgroundPaths = [
        manifest.background?.service_worker,
        ...(manifest.background?.scripts ?? []),
    ].filter(Boolean);
    const manifestPaths = [
        ...backgroundPaths,
        manifest.action?.default_popup,
        manifest.options_ui?.page,
        ...Object.values(manifest.action?.default_icon ?? {}),
        ...Object.values(manifest.icons ?? {}),
    ];
    await Promise.all(manifestPaths.map(relativePath => assertPathExists(packageRoot, relativePath)));

    const htmlFiles = await filesBelow(path.join(packageRoot, "src", "views"), ".html");
    let localAssetCount = 0;

    for (const htmlFile of htmlFiles) {
        const html = await readFile(htmlFile, "utf8");
        const assetPattern = /<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/g;

        for (const match of html.matchAll(assetPattern)) {
            const reference = match[1];
            if (/^(?:https?:)?\/\//i.test(reference)) {
                throw new Error(
                    `Remote executable asset in ${path.relative(packageRoot, htmlFile)}: ${reference}`,
                );
            }
            if (reference.startsWith("#") || reference.startsWith("data:")) continue;

            const assetPath = resolveContained(
                packageRoot,
                path.relative(packageRoot, path.resolve(path.dirname(htmlFile), reference)),
            );
            await access(assetPath);
            localAssetCount += 1;
        }

        if (html.includes("localhost:3000/publications/extract")) {
            throw new Error("The PDF extraction endpoint must use the configured RS_Server host.");
        }
    }

    const javascriptFiles = await filesBelow(path.join(packageRoot, "src", "js"), ".js");
    for (const javascriptFile of javascriptFiles) {
        const source = await readFile(javascriptFile, "utf8");
        const importPattern = /from\s+["'](\.[^"']+)["']/g;
        for (const match of source.matchAll(importPattern)) {
            await access(path.resolve(path.dirname(javascriptFile), match[1]));
        }
    }

    return {
        htmlFiles: htmlFiles.length,
        javascriptFiles: javascriptFiles.length,
        localAssetCount,
    };
}

const packageJson = await readJson("package.json");
const chromiumRoot = path.join(outputRoot, "chromium");
const firefoxRoot = path.join(outputRoot, "firefox");
const chromiumManifest = JSON.parse(
    await readFile(path.join(chromiumRoot, "manifest.json"), "utf8"),
);
const firefoxManifest = JSON.parse(
    await readFile(path.join(firefoxRoot, "manifest.json"), "utf8"),
);

for (const field of ["name", "short_name", "version", "description", "default_locale"]) {
    if (chromiumManifest[field] !== firefoxManifest[field]) {
        throw new Error(`Browser manifests disagree on ${field}.`);
    }
}

if (chromiumManifest.background?.service_worker !== "src/js/service_worker.js") {
    throw new Error("Chromium must run the background module as a service worker.");
}
if (
    firefoxManifest.background?.service_worker ||
    !firefoxManifest.background?.scripts?.includes("src/js/service_worker.js") ||
    firefoxManifest.background?.type !== "module"
) {
    throw new Error("Firefox must run the background module as an ES module event page.");
}
if (Object.hasOwn(firefoxManifest.action ?? {}, "browser_style")) {
    throw new Error("Firefox Manifest V3 must not use the obsolete browser_style action property.");
}

const gecko = firefoxManifest.browser_specific_settings?.gecko;
if (!gecko?.id) throw new Error("Firefox AMO signing requires a stable Gecko extension ID.");
if (Number.parseFloat(gecko.strict_min_version) < 142) {
    throw new Error("Firefox must require version 142+ for built-in data consent.");
}
const declaredFirefoxData = gecko.data_collection_permissions?.required ?? [];
for (const category of requiredFirefoxData) {
    if (!declaredFirefoxData.includes(category)) {
        throw new Error(`Firefox data collection disclosure is missing ${category}.`);
    }
}

const chromiumStats = await validatePackage(
    "Chromium",
    chromiumRoot,
    chromiumManifest,
    packageJson,
);
const firefoxStats = await validatePackage(
    "Firefox",
    firefoxRoot,
    firefoxManifest,
    packageJson,
);

console.log(
    `Validated Chromium and Firefox Manifest V3 packages: ${chromiumStats.htmlFiles} views, ` +
    `${chromiumStats.javascriptFiles} scripts and ${chromiumStats.localAssetCount} local asset ` +
    `references per target (${firefoxStats.htmlFiles}/${firefoxStats.javascriptFiles}/` +
    `${firefoxStats.localAssetCount} in Firefox).`,
);
