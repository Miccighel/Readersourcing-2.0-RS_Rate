////////// INIT //////////

//######## CONTENT SECTIONS ########//

let optionsSection = $("#options-sect");

//######## UI COMPONENTS ########//

let optionsForm = $("#options-form");

let hostField = $("#host");

let hostValue = $("#host-value");

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

////////// OPTIONS //////////

//######### SAVE HANDLING #########//

saveButton.on("click", function () {
    saveButton.find(reloadIcons).toggle();
    let host = "";
    if (hostField.val().indexOf("localhost") >= 0) {
        host = `http://${hostField.val()}/`;
    } else {
        host = `https://${hostField.val()}/`;
    }
    chrome.storage.sync.set({host: host}, function () {
        saveButton.find(reloadIcons).toggle();
        chrome.storage.sync.get(['host'], function (result) {
            hostValue.text(result.host);
        });
    });
});