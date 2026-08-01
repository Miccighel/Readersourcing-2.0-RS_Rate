import assert from "node:assert/strict";
import test from "node:test";

import {
    HostPermissionError,
    hostPermissionPattern,
    requestHostPermission,
} from "../src/js/server_access.js";

test("builds a permission pattern for the configured RS_Server origin", () => {
    assert.equal(
        hostPermissionPattern("https://readersourcing.example:8443/application/"),
        "https://readersourcing.example:8443/*"
    );
    assert.equal(
        hostPermissionPattern("localhost:3000"),
        "http://localhost:3000/*"
    );
});

test("requests access only to the configured origin", async () => {
    let requestedPermissions;
    const permissions = {
        request: (request, callback) => {
            requestedPermissions = request;
            callback(true);
        },
    };

    const host = await requestHostPermission(
        "https://readersourcing.example/application",
        permissions,
        {}
    );

    assert.deepEqual(requestedPermissions, {
        origins: ["https://readersourcing.example/*"],
    });
    assert.equal(host, "https://readersourcing.example/application/");
});

test("does not accept a host when access is denied", async () => {
    const permissions = {
        request: (request, callback) => callback(false),
    };

    await assert.rejects(
        requestHostPermission("https://readersourcing.example", permissions, {}),
        error => {
            assert.ok(error instanceof HostPermissionError);
            assert.equal(error.message, "Access to this RS_Server host was not granted.");
            return true;
        }
    );
});

test("reports browser permission errors", async () => {
    const permissions = {
        request: (request, callback) => callback(false),
    };

    await assert.rejects(
        requestHostPermission(
            "https://readersourcing.example",
            permissions,
            {lastError: {message: "Permission request failed."}}
        ),
        error => {
            assert.ok(error instanceof HostPermissionError);
            assert.equal(error.message, "Permission request failed.");
            return true;
        }
    );
});
