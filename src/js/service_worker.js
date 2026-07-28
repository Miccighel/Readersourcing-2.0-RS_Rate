//######### DEFAULT STARTUP VALUES #########//

export const DEFAULT_HOST = "http://localhost:3000/";

function storageGet(keys) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(keys, result => {
            const error = chrome.runtime?.lastError;
            if (error) reject(new Error(error.message)); else resolve(result);
        });
    });
}

function storageSet(values) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set(values, () => {
            const error = chrome.runtime?.lastError;
            if (error) reject(new Error(error.message)); else resolve();
        });
    });
}

export async function initializeDefaultHost() {
    const {host} = await storageGet(["host"]);
    if (host) return host;

    await storageSet({host: DEFAULT_HOST});
    return DEFAULT_HOST;
}

chrome.runtime.onInstalled.addListener(() => {
    void initializeDefaultHost();
});
