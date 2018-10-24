//######### DEFAULT STARTUP VALUES #########//

chrome.runtime.onInstalled.addListener(function () {
    let hostDefault = "https://rs-server.herokuapp.com/";
    let recaptchaSiteKeyDefault = "6LdilXYUAAAAAPFirZ_MtdNbTUn-KcEV0f_HxhGc";
    chrome.storage.sync.set({host: hostDefault}, function () {
        console.log("Default value for option \"Host\" set.");
        chrome.storage.sync.get(['host'], function (result) {
            console.log(`Value for option "Host" is ${result.host}`)
        });
    });
    chrome.storage.sync.set({recaptchaSiteKey: recaptchaSiteKeyDefault}, function () {
        console.log("Default value for option \"reCAPTCHA Site Key\" set.");
        chrome.storage.sync.get(['recaptchaSiteKey'], function (result) {
            console.log(`Value for option "reCAPTCHA Site Key" is ${result.recaptchaSiteKey}`)
        });
    });
});

//######### PAGE STATE MATCHING #########//


let arxivRule = {
    conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {
            hostEquals: 'arxiv.org',
            schemes: ['https'],
            urlContains: 'pdf'
        },
    })],
    actions: [new chrome.declarativeContent.ShowPageAction()]
};
let springerLinkRule = {
    conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {
            hostEquals: 'link.springer.com',
            schemes: ['https'],
            urlContains: 'pdf'
        },
    })],
    actions: [new chrome.declarativeContent.ShowPageAction()]
};

chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([springerLinkRule]);
        chrome.declarativeContent.onPageChanged.addRules([arxivRule]);
    });
});