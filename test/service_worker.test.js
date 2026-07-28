import assert from "node:assert/strict";
import test from "node:test";

let installedListener;
let storedHost;
let setCalls = 0;

globalThis.chrome = {
    runtime: {
        onInstalled: {
            addListener: listener => {
                installedListener = listener;
            },
        },
    },
    storage: {
        sync: {
            get: (keys, callback) => callback({host: storedHost}),
            set: (values, callback) => {
                storedHost = values.host;
                setCalls += 1;
                callback();
            },
        },
    },
};

const {DEFAULT_HOST, initializeDefaultHost} = await import("../src/js/service_worker.js");

test("registers the Manifest V3 installation listener", () => {
    assert.equal(typeof installedListener, "function");
});

test("sets the local RS_Server default on first installation", async () => {
    storedHost = undefined;
    setCalls = 0;

    assert.equal(await initializeDefaultHost(), DEFAULT_HOST);
    assert.equal(storedHost, "http://localhost:3000/");
    assert.equal(setCalls, 1);
});

test("preserves a user-configured RS_Server host during updates", async () => {
    storedHost = "https://readersourcing.example/api/";
    setCalls = 0;

    assert.equal(await initializeDefaultHost(), storedHost);
    assert.equal(setCalls, 0);
});
