//######### DEFAULT STARTUP VALUES #########//

chrome.runtime.onInstalled.addListener(() => {
    let hostDefault = "https://rs-server.herokuapp.com/";
    chrome.storage.sync.set({host: hostDefault}, () => {
        console.log("Default value for option \"Host\" set.");
        chrome.storage.sync.get(['host'], result => console.log(`Value for option "Host" is ${result.host}`));
    });
});