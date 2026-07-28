import {access, cp, mkdir, rm} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "dist");

const projectEntries = [
    "manifest.json",
    "_locales",
    "src",
];

const dependencyEntries = [
    "@fontsource/roboto/latin-300.css",
    "@fontsource/roboto/latin-ext-300.css",
    "@fontsource/roboto/latin-400.css",
    "@fontsource/roboto/latin-ext-400.css",
    "@fontsource/roboto/latin-700.css",
    "@fontsource/roboto/latin-ext-700.css",
    "@fontsource/roboto/files/roboto-latin-300-normal.woff",
    "@fontsource/roboto/files/roboto-latin-300-normal.woff2",
    "@fontsource/roboto/files/roboto-latin-ext-300-normal.woff",
    "@fontsource/roboto/files/roboto-latin-ext-300-normal.woff2",
    "@fontsource/roboto/files/roboto-latin-400-normal.woff",
    "@fontsource/roboto/files/roboto-latin-400-normal.woff2",
    "@fontsource/roboto/files/roboto-latin-ext-400-normal.woff",
    "@fontsource/roboto/files/roboto-latin-ext-400-normal.woff2",
    "@fontsource/roboto/files/roboto-latin-700-normal.woff",
    "@fontsource/roboto/files/roboto-latin-700-normal.woff2",
    "@fontsource/roboto/files/roboto-latin-ext-700-normal.woff",
    "@fontsource/roboto/files/roboto-latin-ext-700-normal.woff2",
    "@fortawesome/fontawesome-free/js/all.min.js",
    "bootstrap/dist/css/bootstrap.min.css",
    "bootstrap/dist/js/bootstrap.bundle.min.js",
    "bootstrap-select/dist/css/bootstrap-select.css",
    "bootstrap-select/dist/js/bootstrap-select.min.js",
    "bootstrap-slider/dist/css/bootstrap-slider.css",
    "bootstrap-slider/dist/bootstrap-slider.min.js",
    "dropzone/dist/dropzone.css",
    "dropzone/dist/dropzone.js",
    "jquery/dist/jquery.js",
    "jquery-parallax.js/parallax.min.js",
    "jquery.cookie/jquery.cookie.js",
    "jquery.counterup/jquery.counterup.min.js",
    "jquery.scrollto/jquery.scrollTo.min.js",
    "js-cookie/dist/js.cookie.js",
    "load-awesome/css/ball-grid-pulse.css",
    "owl.carousel/dist/assets",
    "owl.carousel/dist/owl.carousel.min.js",
    "owl.carousel2.thumbs/dist/owl.carousel2.thumbs.min.js",
    "parsleyjs/dist/i18n/it.js",
    "parsleyjs/dist/parsley.min.js",
    "waypoints/lib/jquery.waypoints.min.js",
];

async function copyRelative(relativePath, sourceRoot = projectRoot, destinationRoot = outputRoot) {
    const source = path.join(sourceRoot, relativePath);
    const destination = path.join(destinationRoot, relativePath);
    await access(source);
    await mkdir(path.dirname(destination), {recursive: true});
    await cp(source, destination, {recursive: true});
}

await rm(outputRoot, {recursive: true, force: true});
await mkdir(outputRoot, {recursive: true});

for (const entry of projectEntries) {
    await copyRelative(entry);
}

for (const entry of dependencyEntries) {
    await copyRelative(entry, path.join(projectRoot, "node_modules"), path.join(outputRoot, "node_modules"));
}

console.log(`Built unpacked extension in ${path.relative(projectRoot, outputRoot)}/`);
