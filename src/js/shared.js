////////// NETWORKING SECTION //////////

const tokenSession = globalThis.chrome?.runtime?.getManifest?.().browser_specific_settings?.gecko
    ? browser.storage.session : null;
let sessionToken = tokenSession ? (await tokenSession.get("authToken")).authToken : undefined;

if (tokenSession) {
    tokenSession.onChanged.addListener(changes => {
        if (changes.authToken) sessionToken = changes.authToken.newValue;
    });
}

export function storeToken(authToken) {
    if (tokenSession) {
        return tokenSession.set({authToken}).then(() => { sessionToken = authToken; });
    }
    Cookies.set('authToken', authToken);
}

export function fetchToken() {
    return tokenSession ? sessionToken : Cookies.get('authToken');
}

export function deleteToken() {
    if (tokenSession) {
        sessionToken = undefined;
        return tokenSession.remove("authToken");
    }
    Cookies.remove('authToken');
}

export function normalizeHost(host) {
    let normalizedHost = String(host ?? "").trim();
    if (normalizedHost === "") throw new TypeError("RS_Server host cannot be empty.");

    if (!/^[a-z][a-z\d+.-]*:\/\//i.test(normalizedHost)) {
        const hostname = normalizedHost.startsWith("[")
            ? normalizedHost.slice(0, normalizedHost.indexOf("]") + 1).toLowerCase()
            : normalizedHost.split(/[/:]/, 1)[0].toLowerCase();
        const localHostnames = new Set(["localhost", "127.0.0.1", "[::1]"]);
        normalizedHost = `${localHostnames.has(hostname) ? "http" : "https"}://${normalizedHost}`;
    }

    const parsedHost = new URL(normalizedHost);
    if (!["http:", "https:"].includes(parsedHost.protocol)) {
        throw new TypeError("RS_Server host must use HTTP or HTTPS.");
    }

    parsedHost.hash = "";
    parsedHost.search = "";
    if (!parsedHost.pathname.endsWith("/")) parsedHost.pathname += "/";
    return parsedHost.toString();
}

export function buildUrl(host, path) {
    const normalizedPath = String(path ?? "").replace(/^\/+/, "");
    return new URL(normalizedPath, normalizeHost(host)).toString();
}

export function paperRatingUrl(host, value) {
    const server = new URL(normalizeHost(host));
    const url = new URL(value);
    if (url.origin !== server.origin || url.username || url.password || url.search || url.hash ||
        !/^\/rate\/[1-9]\d*\/[^/]+$/.test(url.pathname)) {
        throw new TypeError("The PDF does not contain a rating URL for this RS_Server instance.");
    }
    return url.toString();
}

async function fetchHost() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(["host"], result => {
            const error = chrome.runtime?.lastError;
            if (error) reject(new Error(error.message)); else resolve(result.host);
        });
    });
}

export async function ajax(type, url, contentType, dataType, crossDomain, data, success, error) {
    const authToken = fetchToken();
    const host = await fetchHost();
    return $.ajax({
        type: type,
        url: buildUrl(host, url),
        contentType: contentType,
        dataType: dataType,
        crossDomain: crossDomain,
        ...(tokenSession ? {xhr: () => new XMLHttpRequest({mozAnon: true})} : {}),
        data: JSON.stringify(data),
        success: success,
        error: error,
        headers: {
            "Authorization": authToken
        },
    });
}

export async function emptyAjax(type, url, contentType, dataType, crossDomain, success, error) {
    const authToken = fetchToken();
    const host = await fetchHost();
    return $.ajax({
        type: type,
        url: buildUrl(host, url),
        contentType: contentType,
        dataType: dataType,
        crossDomain: crossDomain,
        ...(tokenSession ? {xhr: () => new XMLHttpRequest({mozAnon: true})} : {}),
        success: success,
        error: error,
        headers: {
            "Authorization": authToken
        },
    });
}

////////// UTILITY SECTION //////////

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function escapeHtml(value) {
    const entities = {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"};
    return String(value).replace(/[&<>"']/g, character => entities[character]);
}

export async function buildErrors(errors) {
    try {
        let parsedErrors = JSON.parse(errors);
        if (Array.isArray(parsedErrors.errors)) parsedErrors = {errors: parsedErrors.errors};
        let element = "";
        Object.keys(parsedErrors).forEach((attribute, index) => {
            element = `<span class="color-red-dark">${element}${escapeHtml(attribute.capitalize())}:</span><ul>`;
            let messages = parsedErrors[attribute];
            Object.values(messages).forEach((message, index) => {
                element = `${element}<li class="color-red-dark">${escapeHtml(message)}</li>`;
            });
            element = `${element}</ul>`;
        });
        return element;
    } catch (error) {
        let element = "";
        element = `<span class="color-red-dark">This is (probably) a server error (which could be dead now).</span>`;
        return element;
    }
}
