import assert from "node:assert/strict";
import test from "node:test";

const cookies = new Map();
globalThis.Cookies = {
    set: (name, value) => cookies.set(name, value),
    get: name => cookies.get(name),
    remove: name => cookies.delete(name),
};

const {
    ajax,
    buildErrors,
    buildUrl,
    deleteToken,
    emptyAjax,
    fetchToken,
    normalizeHost,
    storeToken,
} = await import("../src/js/shared.js");

test("normalizes local and remote RS_Server hosts", () => {
    assert.equal(normalizeHost("localhost:3000"), "http://localhost:3000/");
    assert.equal(normalizeHost("127.0.0.1:3000/api"), "http://127.0.0.1:3000/api/");
    assert.equal(normalizeHost("[::1]:3000"), "http://[::1]:3000/");
    assert.equal(normalizeHost("example.test"), "https://example.test/");
    assert.equal(normalizeHost("https://example.test/api"), "https://example.test/api/");
    assert.throws(() => normalizeHost("file:///tmp/server"), /HTTP or HTTPS/);
    assert.throws(() => normalizeHost(""), /cannot be empty/);
});

test("joins endpoint paths without changing the configured base path", () => {
    assert.equal(
        buildUrl("http://localhost:3000/", "/users/info.json"),
        "http://localhost:3000/users/info.json"
    );
    assert.equal(
        buildUrl("https://example.test/readersourcing", "ratings.json"),
        "https://example.test/readersourcing/ratings.json"
    );
});

test("preserves the authentication token contract", () => {
    storeToken("reader-token");
    assert.equal(fetchToken(), "reader-token");
    deleteToken();
    assert.equal(fetchToken(), undefined);
});

test("ajax preserves the RS_Server JSON request contract", async () => {
    storeToken("reader-token");
    globalThis.chrome = {
        storage: {
            sync: {
                get: async () => ({host: "http://localhost:3000/"}),
            },
        },
    };

    let request;
    globalThis.$ = {
        ajax: options => {
            request = options;
            return {request: options};
        },
    };

    const success = () => {};
    const error = () => {};
    const result = await ajax(
        "POST",
        "ratings.json",
        "application/json; charset=utf-8",
        "json",
        true,
        {rating: {score: 80}},
        success,
        error
    );

    assert.equal(request.type, "POST");
    assert.equal(request.url, "http://localhost:3000/ratings.json");
    assert.equal(request.data, JSON.stringify({rating: {score: 80}}));
    assert.equal(request.headers.Authorization, "reader-token");
    assert.equal(request.success, success);
    assert.equal(request.error, error);
    assert.deepEqual(result, {request});
});

test("emptyAjax preserves requests without a JSON body", async () => {
    globalThis.chrome.storage.sync.get = async () => ({host: "https://example.test/"});
    let request;
    globalThis.$.ajax = options => {
        request = options;
        return options;
    };

    await emptyAjax("GET", "publications/1/is_rated.json", "application/json", "json", true);

    assert.equal(request.url, "https://example.test/publications/1/is_rated.json");
    assert.equal("data" in request, false);
});

test("buildErrors retains the existing server error representation", async () => {
    assert.equal(
        await buildErrors('{"email":["can not be blank"]}'),
        '<span class="color-red-dark">Email:</span><ul><li class="color-red-dark">can not be blank</li></ul>'
    );
    assert.match(await buildErrors("not-json"), /server error/);
});
