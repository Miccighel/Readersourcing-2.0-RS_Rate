////////// INIT //////////

//######## CONTENT SECTIONS ########//

let optionsSection = $("#options-sect");

//######## UI COMPONENTS ########//

let hostField = $("#host");

let saveButton = $("#save-btn");

let reloadIcons = $(".reload-icon");

//######## UI INITIAL SETUP ########//

reloadIcons.hide();

////////// OPTIONS //////////

//######### SAVE HANDLING #########//

saveButton.on("click", function () {
    saveButton.find(reloadIcons).toggle();
    let host = hostField.val();
    chrome.storage.sync.set({host: host}, function() {
         saveButton.find(reloadIcons).toggle();
        chrome.storage.sync.get(['host'], function(result) {
            console.log('Value currently is ' + result.host);
        });
    });
});