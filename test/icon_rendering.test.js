import assert from "node:assert/strict";
import {readFile, readdir} from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../", import.meta.url);

test("every extension view keeps its original icon elements when SVGs are added", async () => {
    const views = await readdir(new URL("src/views/", root));
    for (const view of views.filter(name => name.endsWith(".html"))) {
        const html = await readFile(new URL(`src/views/${view}`, root), "utf8");
        const scripts = [...html.matchAll(/<script\b[^>]*fontawesome-free\/js\/all\.min\.js[^>]*>/g)];
        assert.equal(scripts.length, 1, view);
        assert.match(scripts[0][0], /data-auto-replace-svg="nest"/, view);
    }
});

test("Font Awesome nesting preserves a cached hidden indicator and its identifier", async () => {
    const library = await readFile(new URL("node_modules/@fortawesome/fontawesome-free/js/all.js", root), "utf8");
    const start = library.indexOf("const mutators = {");
    const end = library.indexOf("function performOperationSync", start);
    assert.ok(start >= 0 && end > start, "The installed library must expose the expected DOM mutators.");
    const attributes = {id: "synthetic-indicator", class: "fas fa-sync-alt fa-spin reload-icon"};
    const icon = {
        style: {display: "none"},
        innerHTML: "",
        setAttribute: (name, value) => { attributes[name] = value; },
        removeAttribute: name => { delete attributes[name]; },
        remove: () => assert.fail("A cached indicator must not be removed."),
        parentNode: {insertBefore: () => assert.fail("The original icon must not be replaced.")},
    };
    const cachedIcon = icon;
    const svg = {
        tag: "svg",
        attributes: {id: attributes.id, class: "svg-inline--fa fa-sync-alt fa-spin reload-icon"},
    };
    vm.runInNewContext(`${library.slice(start, end)}\nmutators.nest(mutation);`, {
        mutation: [icon, [svg]],
        config: {replacementClass: "svg-inline--fa", cssPrefix: "fa"},
        DATA_FA_I2SVG: "data-fa-i2svg",
        classArray: node => attributes.class.split(" "),
        toHtml: abstract => { assert.equal(abstract, svg); return "<svg></svg>"; },
    });
    assert.equal(cachedIcon, icon);
    assert.equal(icon.style.display, "none");
    assert.equal(icon.innerHTML, "<svg></svg>");
    assert.equal(attributes.id, "synthetic-indicator");
    assert.equal(attributes.class, "reload-icon");
    assert.equal(attributes["data-fa-i2svg"], "");
    assert.equal(svg.attributes.id, undefined);
    assert.equal(svg.attributes.class, "svg-inline--fa fa-sync-alt fa-spin");
});
