const uploadContextPrefix = "pdfUpload:";

export function isFirefox(runtime = globalThis.chrome?.runtime) {
    return !!runtime?.getManifest?.().browser_specific_settings?.gecko;
}

function validateUploadContext(context) {
    if (!context || !["source", "extract"].includes(context.mode)) {
        throw new TypeError("Open the publication and choose the PDF upload again.");
    }
    if (context.mode === "extract") return context;
    const publication = new URL(context.pdf_url);
    if (!["http:", "https:"].includes(publication.protocol) || publication.username || publication.password) {
        throw new TypeError("Open the publication from a complete HTTP or HTTPS address.");
    }
    return context;
}

export async function fetchUploadContext(
    location = globalThis.location,
    runtime = globalThis.chrome?.runtime,
    storage = globalThis.browser?.storage.session
) {
    if (!isFirefox(runtime)) return null;
    const reference = new URL(location.href).searchParams.get("pdfUpload");
    if (!reference) return null;
    if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(reference)) {
        throw new TypeError("Open the publication and choose the PDF upload again.");
    }
    const key = `${uploadContextPrefix}${reference}`;
    return validateUploadContext((await storage.get(key))[key]);
}

export async function openUploadPage(
    mode,
    pdfUrl,
    runtime = chrome.runtime,
    storage = browser.storage.session,
    tabs = browser.tabs
) {
    const context = validateUploadContext({mode, pdf_url: mode === "source" ? pdfUrl : null});
    const reference = crypto.randomUUID();
    const key = `${uploadContextPrefix}${reference}`;
    await storage.set({[key]: context});
    try {
        const page = await tabs.create({
            url: `${runtime.getURL("src/views/rating_web.html")}?pdfUpload=${reference}`,
            active: false,
        });
        await storage.set({[key]: {...context, tabId: page.id}});
        await tabs.update(page.id, {active: true});
        return page;
    } catch (error) {
        await storage.remove(key);
        throw error;
    }
}

export function registerUploadContextCleanup(
    runtime = globalThis.chrome?.runtime,
    storage = globalThis.browser?.storage.session,
    tabs = globalThis.browser?.tabs
) {
    if (!isFirefox(runtime)) return;
    tabs.onRemoved.addListener(async tabId => {
        const items = await storage.get(null);
        const keys = Object.keys(items).filter(key =>
            key.startsWith(uploadContextPrefix) && items[key]?.tabId === tabId);
        if (keys.length) await storage.remove(keys);
    });
}
