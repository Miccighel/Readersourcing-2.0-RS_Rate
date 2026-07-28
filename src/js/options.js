////////// INIT //////////

import {normalizeHost} from "./shared.js";

//######## CONTENT SECTIONS ########//

let optionsSection = $("#options-sect");

//######## MODALS ########//

let modalConfirm = $("#modal-confirm");

//######## UI COMPONENTS ########//

let optionsForm = $("#options-form");

let hostField = $("#host");

let hostValue = $("#host-value");

let saveButton = $("#save-btn");
let modalConfirmButton = $("#modal-confirm-btn");

let reloadIcons = $(".reload-icon");

//######## UI INITIAL SETUP ########//

optionsForm.submit(event => event.preventDefault());

reloadIcons.hide();
chrome.storage.sync.get(['host'], result => hostValue.text(result.host));

////////// OPTIONS //////////

//######### SAVE HANDLING #########//

saveButton.on("click", () => {
    saveButton.find(reloadIcons).toggle();
    let host;
    try {
        host = normalizeHost(hostField.val());
        hostField[0].setCustomValidity("");
    } catch (error) {
        saveButton.find(reloadIcons).toggle();
        hostField[0].setCustomValidity(error.message);
        hostField[0].reportValidity();
        return;
    }

    chrome.storage.sync.set({host}, () => {
        saveButton.find(reloadIcons).toggle();
        modalConfirm.modal("show");
        chrome.storage.sync.get(['host'], result => hostValue.text(result.host));
    });
});

hostField.on("input", () => hostField[0].setCustomValidity(""));

modalConfirmButton.on("click", () => {
    saveButton.text("Done!");
    saveButton.prop("disabled", true);
    modalConfirm.modal("hide");
});
