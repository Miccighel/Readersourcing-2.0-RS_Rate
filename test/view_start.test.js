import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../", import.meta.url);

async function startView(controller = "rating_web", firefox = true, query = "") {
    const source = await readFile(new URL("src/js/view_start.js", root), "utf8");
    const classes = new Set();
    const messages = [];
    const imports = [];
    const errors = [];
    let start;
    let resolveController;
    let rejectController;
    const pending = new Promise((resolve, reject) => {
        resolveController = resolve;
        rejectController = reject;
    });
    const location = {href: `https://extension.example/src/views/${controller}.html${query}`};
    const document = {
        currentScript: {src: "https://extension.example/src/js/view_start.js", dataset: {controller}},
        documentElement: {classList: {
            add: name => classes.add(name), remove: name => classes.delete(name),
        }},
        addEventListener(event, handler, options) {
            assert.equal(event, "DOMContentLoaded");
            assert.equal(options.once, true);
            start = handler;
        },
        createElement(tag) {
            assert.equal(tag, "p");
            return {attributes: {}, setAttribute(name, value) { this.attributes[name] = value; }};
        },
        body: {prepend: message => messages.push(message)},
    };
    assert.match(source, /await import\("\.\/home\.js"\)/);
    assert.match(source, /await import\("\.\/rating_web\.js"\)/);
    assert.doesNotMatch(source, /import\([^"']/);
    vm.runInNewContext(source.replace(/import\("(\.\/(?:home|rating_web)\.js)"\)/g, 'loadController("$1")'), {
        document, location, URL,
        chrome: {runtime: {getManifest: () => firefox ? {browser_specific_settings: {gecko: {}}} : {}}},
        loadController: url => { imports.push(url); return pending; },
        console: {error: (...args) => errors.push(args)},
        setTimeout: () => assert.fail("Opening a view must not introduce a fixed delay."),
    });
    return {classes, messages, imports, errors, start, resolveController, rejectController, location};
}

test("only views with session-dependent layouts initialize their content before displaying it", async () => {
    for (const page of ["home", "rating_web"]) {
        const html = await readFile(new URL(`src/views/${page}.html`, root), "utf8");
        const bootstrap = `<script src="../js/view_start.js" data-controller="${page}"></script>`;
        assert.ok(html.indexOf(bootstrap) > html.indexOf("<head>"));
        assert.ok(html.indexOf(bootstrap) < html.indexOf("</head>"));
        assert.doesNotMatch(html, new RegExp(`<script type="module" src="../js/${page}\\.js">`));
        assert.ok(html.indexOf('id="buttons-sect"') < html.indexOf("view-content"));
        assert.equal((html.match(/view-content/g) || []).length, page === "home" ? 1 : 3);
    }
    for (const page of ["login", "sign_up", "password_forgot", "password_update", "profile_update", "options"]) {
        const html = await readFile(new URL(`src/views/${page}.html`, root), "utf8");
        assert.doesNotMatch(html, /view_start|view-content/);
    }
    const css = await readFile(new URL("src/css/general.css", root), "utf8");
    assert.match(css, /html\.view-initializing \.view-content\s*\{\s*visibility:\s*hidden;\s*}/);
});

test("content is revealed after local setup without a timer or a server response", async () => {
    const view = await startView();
    assert.equal(view.classes.has("view-initializing"), true);
    assert.equal(view.imports.length, 0);
    const opening = view.start();
    assert.deepEqual(view.imports, ["./rating_web.js"]);
    assert.equal(view.classes.has("view-initializing"), true);
    view.resolveController();
    await opening;
    assert.equal(view.classes.has("view-initializing"), false);
    for (const page of ["home", "rating_web"]) {
        const source = await readFile(new URL(`src/js/${page}.js`, root), "utf8");
        assert.doesNotMatch(source, /await\s+(?:ajax|emptyAjax)\(/);
    }
});

for (const [firefox, query, expected] of [
    [true, "?pdfUpload=00000000-0000-0000-0000-000000000001", true],
    [true, "", false],
    [true, "?pdfUpload=", false],
    [false, "?pdfUpload=00000000-0000-0000-0000-000000000001", false],
]) {
    test(`the first layout distinguishes upload tabs from popups (${firefox}, ${query || "no reference"})`, async () => {
        const view = await startView("rating_web", firefox, query);
        assert.equal(view.classes.has("pdf-upload-view"), expected);
        assert.equal(view.imports.length, 0);
    });
}

test("a home redirect does not briefly display the signed-out actions", async () => {
    const view = await startView("home");
    const opening = view.start();
    view.location.href = "https://extension.example/src/views/rating_web.html";
    view.resolveController();
    await opening;
    assert.equal(view.classes.has("view-initializing"), true);
});

test("a failed controller shows an explanation and removes the initialization state", async () => {
    const view = await startView();
    const opening = view.start();
    view.rejectController(new Error("Session storage unavailable."));
    await opening;
    assert.equal(view.classes.has("view-initializing"), false);
    assert.equal(view.messages.length, 1);
    assert.equal(view.messages[0].attributes.role, "alert");
    assert.equal(view.messages[0].textContent, "This view could not be opened. Close it and try again.");
    assert.equal(view.errors.length, 1);
});

test("a controller name cannot load an arbitrary module", async () => {
    const view = await startView("../unrecognized");
    await view.start();
    assert.equal(view.imports.length, 0);
    assert.equal(view.classes.has("view-initializing"), false);
    assert.equal(view.messages.length, 1);
});
