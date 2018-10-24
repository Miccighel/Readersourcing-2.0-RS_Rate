////////// INIT //////////

//######## CONTENT SECTIONS ########//

let optionsSection = $("#options-sect");

//######## UI COMPONENTS ########//

let optionsForm = $("#options-form");

let hostField = $("#host");

let hostValue = $("#host-value");
let recaptchaSiteKeyValue = $("#recaptcha-site-key-value");

let saveButton = $("#save-btn");

let reloadIcons = $(".reload-icon");

//######## UI INITIAL SETUP ########//

optionsForm.submit(function (event) {
    event.preventDefault();
});

reloadIcons.hide();

chrome.storage.sync.get(['host'], function (result) {
    hostValue.text(result.host);
});

chrome.storage.sync.get(['recaptchaSiteKey'], function (result) {
    recaptchaSiteKeyValue.text(result.recaptchaSiteKey);
});

////////// OPTIONS //////////

//######### SAVE HANDLING #########//

saveButton.on("click", function () {
    saveButton.find(reloadIcons).toggle();
    let host = "";
    let recaptchaSiteKey = "";
    if (hostField.val().indexOf("localhost") >= 0) {
        host = `http://${hostField.val()}/`;
        recaptchaSiteKey = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
    } else {
        host = `https://${hostField.val()}/`;
        recaptchaSiteKey = "6LdilXYUAAAAAPFirZ_MtdNbTUn-KcEV0f_HxhGc"
    }
    let hostPromise = chrome.storage.sync.set({host: host});
    let recaptchaSiteKeyPromise = chrome.storage.sync.set({recaptchaSiteKey: recaptchaSiteKey});
    $.when([hostPromise,recaptchaSiteKeyPromise]).then(function(results) {
        saveButton.find(reloadIcons).toggle();
        chrome.storage.sync.get(['host'], function (result) {
            hostValue.text(result.host);
        });
        chrome.storage.sync.get(['recaptchaSiteKey'], function (result) {
            recaptchaSiteKeyValue.text(result.recaptchaSiteKey);
        });
    });
});