import {normalizeHost} from "./shared.js";

export class HostPermissionError extends Error {}

export function hostPermissionPattern(host) {
    const normalizedHost = new URL(normalizeHost(host));
    return `${normalizedHost.origin}/*`;
}

export function requestHostPermission(
    host,
    permissions = chrome.permissions,
    runtime = chrome.runtime
) {
    const normalizedHost = normalizeHost(host);
    const request = {origins: [hostPermissionPattern(normalizedHost)]};

    return new Promise((resolve, reject) => {
        permissions.request(request, granted => {
            const error = runtime?.lastError;
            if (error) {
                reject(new HostPermissionError(error.message));
            } else if (!granted) {
                reject(new HostPermissionError("Access to this RS_Server host was not granted."));
            } else {
                resolve(normalizedHost);
            }
        });
    });
}
