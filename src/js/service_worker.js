//######### DEFAULT STARTUP VALUES #########//

chrome.runtime.onInstalled.addListener(() => {
    let hostDefault = "http://readersourcing.hrhbdyetgqdmc8d5.westeurope.azurecontainer.io:3000/";
    chrome.storage.sync.set({host: hostDefault}, () => {
        console.log("Default value for option \"Host\" set.");
        chrome.storage.sync.get(['host'], result => console.log(`Value for option "Host" is ${result.host}`));
    });
});