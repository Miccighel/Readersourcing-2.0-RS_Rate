//######### DEFAULT STARTUP VALUES #########//

export const DEFAULT_HOST = "http://localhost:3000/";

export async function initializeDefaultHost() {
    const {host} = await chrome.storage.sync.get(["host"]);
    if (host) return host;

    await chrome.storage.sync.set({host: DEFAULT_HOST});
    return DEFAULT_HOST;
}

chrome.runtime.onInstalled.addListener(() => {
    void initializeDefaultHost();
});
