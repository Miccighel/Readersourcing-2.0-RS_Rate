////////// NETWORKING SECTION //////////

export function storeToken(authToken) {
    Cookies.set('authToken', authToken);
}

export function fetchToken() {
    return Cookies.get('authToken');
}

export function deleteToken() {
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

export async function buildErrors(errors) {
    try {
        let parsedErrors = JSON.parse(errors);
        let element = "";
        Object.keys(parsedErrors).forEach((attribute, index) => {
            element = `<span class="color-red-dark">${element}${attribute.capitalize()}:</span><ul>`;
            let messages = parsedErrors[attribute];
            Object.values(messages).forEach((message, index) => {
                element = `${element}<li class="color-red-dark">${message}</li>`;
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

export function removePreloader() {
    $('.preloader-wrapper').fadeOut(1500);
    $('body').removeClass('preloader');
    $('.preloader').css('overflow', 'visible');
}
