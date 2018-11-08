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

optionsForm.submit(event => event.preventDefault());

reloadIcons.hide();
chrome.storage.sync.get(['host'], result => hostValue.text(result.host));

////////// OPTIONS //////////

//######### SAVE HANDLING #########//

saveButton.on("click", () => {
    saveButton.find(reloadIcons).toggle();
    let host = "";
    host = hostField.val().indexOf("localhost") >= 0 ? `http://${hostField.val()}/` : `https://${hostField.val()}/`;
    chrome.storage.sync.set({host: host}, () => {
        saveButton.find(reloadIcons).toggle();
        chrome.storage.sync.get(['host'], result => hostValue.text(result.host));
    });
});