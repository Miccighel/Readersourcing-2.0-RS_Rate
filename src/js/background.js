//######### DEFAULT STARTUP VALUES #########//

chrome.runtime.onInstalled.addListener(function () {
    let hostDefault = "https://rs-server.herokuapp.com/";
    chrome.storage.sync.set({host: hostDefault}, function () {
        console.log("Default value for option \"Host\" set.");
        chrome.storage.sync.get(['host'], function (result) {
            console.log(`Value for option "Host" is ${result.host}`)
        });
    });
});

//######### PAGE STATE MATCHING #########//


chrome.runtime.onInstalled.addListener(function () {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        let currentTab = tabs[0];
        console.log(`Tab URL: ${currentTab.url}`);
        console.log(`Tab ID: ${currentTab.id}`);
    });
});