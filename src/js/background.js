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