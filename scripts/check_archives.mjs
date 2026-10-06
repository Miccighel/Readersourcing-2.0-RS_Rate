import {readFile, readdir} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import JSZip from "jszip";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = ["chromium", "firefox"];

async function filesBelow(directory, prefix = "") {
    const entries = await readdir(directory, {withFileTypes: true});
    const files = await Promise.all(entries.map(async entry => {
        const relativePath = prefix + entry.name;
        if (entry.isDirectory()) {
            return filesBelow(path.join(directory, entry.name), relativePath + "/");
        }
        return [relativePath];
    }));
    return files.flat();
}

export async function checkArchive(sourceDir, archivePath, dependencies) {
    const archive = await JSZip.loadAsync(await readFile(archivePath), {checkCRC32: true});
    const sourceFiles = await filesBelow(sourceDir);
    const archiveFiles = Object.values(archive.files).filter(entry => !entry.dir);
    if (archiveFiles.length !== sourceFiles.length) {
        throw new Error(`Archive file count differs from the unpacked build: ${archivePath}`);
    }

    for (const relativePath of sourceFiles) {
        if (relativePath.startsWith("node_modules/")) {
            const parts = relativePath.split("/");
            const dependency = parts[1].startsWith("@") ? parts.slice(1, 3).join("/") : parts[1];
            if (!Object.hasOwn(dependencies, dependency)) {
                throw new Error(`Undeclared runtime dependency in the package: ${dependency}`);
            }
        }

        const entry = archive.file(relativePath);
        if (!entry) throw new Error(`Archive omits a build asset: ${relativePath}`);
        const source = await readFile(path.join(sourceDir, relativePath));
        if (!source.equals(await entry.async("nodebuffer"))) {
            throw new Error(`Archive asset differs from the unpacked build: ${relativePath}`);
        }
    }
    return sourceFiles.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const selectedTargets = process.argv.slice(2);
    const packageJson = JSON.parse(await readFile(path.join(projectRoot, "package.json"), "utf8"));
    for (const target of selectedTargets.length ? selectedTargets : targets) {
        if (!targets.includes(target)) throw new Error(`Unknown extension target: ${target}`);
        const count = await checkArchive(
            path.join(projectRoot, "dist", target),
            path.join(projectRoot, "artifacts", `rs_rate-${target}.zip`),
            packageJson.dependencies,
        );
        console.log(`Validated ${target} archive: ${count} matching build assets and no development dependencies.`);
    }
}
