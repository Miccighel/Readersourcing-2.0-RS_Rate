import {readFile} from "node:fs/promises";
import path from "node:path";
import {build} from "esbuild";

export function assertDropzoneBundle(source) {
    const legacyCode = /\bcore-js\b|\bActiveXObject\b|\bNullProtoObjectVia\w*\b|\bFunction\s*\(|\beval\s*\(|\bdocument\.write\s*\(|\bscriptTag\s*\(/;
    if (legacyCode.test(source)) {
        throw new Error("The Dropzone bundle contains legacy polyfills or dynamic string compilation.");
    }
}

export async function buildDropzone(projectRoot) {
    const packageJson = JSON.parse(await readFile(path.join(projectRoot, "node_modules/dropzone/package.json"), "utf8"));
    const result = await build({
        absWorkingDir: projectRoot,
        entryPoints: ["scripts/dropzone_entry.js"],
        outfile: "dist/chromium/node_modules/dropzone/dist/dropzone.js",
        bundle: true,
        format: "iife",
        platform: "browser",
        target: "es2018",
        minify: false,
        keepNames: true,
        charset: "utf8",
        legalComments: "inline",
        sourcemap: "linked",
        sourcesContent: true,
        metafile: true,
        write: false,
        banner: {js: `/*! Dropzone ${packageJson.version} | MIT License | See ../LICENSE. Built from the locked upstream source. */`},
        loader: {".html": "text"},
    });
    const inputs = Object.keys(result.metafile.inputs);
    const permittedInputs = new Set([
        "scripts/dropzone_entry.js",
        "node_modules/dropzone/package.json",
        "node_modules/dropzone/src/dropzone.js",
        "node_modules/dropzone/src/emitter.js",
        "node_modules/dropzone/src/options.js",
        "node_modules/dropzone/src/preview-template.html",
    ]);
    if (inputs.some(input => !permittedInputs.has(input))) {
        throw new Error("The Dropzone build contains an unexpected source module.");
    }
    const code = result.outputFiles.find(file => file.path.endsWith(".js")).text;
    const sourceMap = result.outputFiles.find(file => file.path.endsWith(".js.map")).text;
    assertDropzoneBundle(code);
    return {code, sourceMap, inputs, version: packageJson.version};
}
