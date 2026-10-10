////////// INIT //////////

//######## IMPORTS ########//

import {deleteToken} from "./shared.js";
import {ajax} from "./shared.js";
import {emptyAjax} from "./shared.js";
import {buildErrors} from "./shared.js";
import {fetchToken} from "./shared.js";

//######## SECTIONS ########//

let errorsSection = $(".errors-sect");

//######## UI COMPONENTS ########//

let signUpForm = $("#sign-up-form");

let firstNameField = $("#first-name");
let lastNameField = $("#last-name");
let orcidField = $("#orcid");

let subscribeCheckbox = $("#subscribe");

let backButton = $("#back-btn");
let updateButton = $("#update-btn");
let errorButton = $(".error-btn");
let optionsButton = $("#options-btn");
let retryButton = $("#profile-retry-btn");
let loadingStatus = $("#profile-loading-status");

let alert = $(".alert");

let checkIcon = $("#check-icon");
let backIcon = $("#back-icon");
let reloadIcons = $(".reload-icon");
let fieldLoadingIcons = signUpForm.find(".field-loading-icon");

//######## UI INITIAL SETUP ########//

errorsSection.hide();
errorButton.hide();

firstNameField.prop("disabled", true);
lastNameField.prop("disabled", true);
orcidField.prop("disabled", true);
subscribeCheckbox.prop("disabled", true);
backButton.find(reloadIcons).hide();
updateButton.find(reloadIcons).hide();

updateButton.prop("disabled", true);

let validationInstance = signUpForm.parsley();

signUpForm.submit(event => event.preventDefault());

////////// USER ///////////

//####### STATUS HANDLING (SCORES, ...) #########//

let authToken = fetchToken();
function fetchUserInfo() {
    retryButton.hide();
    fieldLoadingIcons.show();
    loadingStatus.text("Loading your profile...").show();
    signUpForm.attr("aria-busy", "true");
    let successCallback = (data, status, jqXHR) => {
        firstNameField.val(data["first_name"]);
        firstNameField.prop("disabled", false);
        lastNameField.val(data["last_name"]);
        lastNameField.prop("disabled", false);
        orcidField.val(data["orcid"]);
        orcidField.prop("disabled", false);
        (data["subscribe"]) === true ? subscribeCheckbox.prop('checked', true) : subscribeCheckbox.prop('checked', false);
        subscribeCheckbox.prop("disabled", false);
        fieldLoadingIcons.hide();
        loadingStatus.hide();
        signUpForm.attr("aria-busy", "false");
        updateButton.prop("disabled", false);
    };
    let errorCallback = (jqXHR, status) => {
        fieldLoadingIcons.hide();
        signUpForm.attr("aria-busy", "false");
        loadingStatus.text("Your profile could not be loaded. Try again or return to the previous page.").show();
        retryButton.show();
    };
    let promise = emptyAjax("POST", "/users/info.json", "application/json; charset=utf-8", "json", true, successCallback, errorCallback);
}
if (authToken != null) fetchUserInfo();
else window.location.href = "login.html";
retryButton.on("click", fetchUserInfo);

//########## UPDATE HANDLING ##########//

if (authToken != null) {
    updateButton.on("click", () => {
        if (updateButton.prop("disabled")) return;
        validationInstance.validate();
        if (validationInstance.isValid()) {
            updateButton.find(checkIcon).toggle();
            updateButton.find(reloadIcons).toggle();
            let successCallback = (data, status, jqXHR) => {
                let secondData = {
                    user: {
                        first_name: firstNameField.val(),
                        last_name: lastNameField.val(),
                        orcid: orcidField.val(),
                        subscribe: !!subscribeCheckbox.is(":checked")
                    },
                };
                if (orcidField.val() === "")
                    delete secondData.user.orcid;
                let secondSuccessCallback = async (data, status, jqXHR) => {
                    updateButton.find(reloadIcons).toggle();
                    await deleteToken();
                    chrome.storage.sync.set({message: data["message"]}, () => {
                        window.location.href = "login.html";
                    });
                };
                let secondErrorCallback = (jqXHR, status) => {
                    updateButton.find(reloadIcons).toggle();
                    updateButton.find(checkIcon).toggle();
                    if (jqXHR.responseText == null) {
                        updateButton.hide();
                        let button = updateButton.parent().find(errorButton);
                        button.show();
                        button.prop("disabled", true)
                    } else {
                        let errorPromise = buildErrors(jqXHR.responseText).then(result => {
                            updateButton.parent().find(errorsSection).find(alert).empty();
                            updateButton.parent().find(errorsSection).find(alert).append(result);
                            updateButton.parent().find(errorsSection).show();
                        });
                    }
                };
                let secondPromise = ajax("PUT", `/users/${data["id"]}.json`, "application/json; charset=utf-8", "json", true, secondData, secondSuccessCallback, secondErrorCallback);
            };
            let errorCallback = (jqXHR, status) => {
                updateButton.find(reloadIcons).toggle();
                updateButton.find(checkIcon).toggle();
                if (jqXHR.responseText == null) {
                    updateButton.hide();
                    let button = updateButton.parent().find(errorButton);
                    button.show();
                    button.prop("disabled", true)
                } else {
                    let errorPromise = buildErrors(jqXHR.responseText).then(result => {
                        updateButton.parent().find(errorsSection).find(alert).empty();
                        updateButton.parent().find(errorsSection).find(alert).append(result);
                        updateButton.parent().find(errorsSection).show();
                    });
                }
            };
            let promise = emptyAjax("POST", "users/info.json", "application/json; charset=utf-8", "json", true, successCallback, errorCallback);
        }
    });
}

////////// GENERAL //////////

//######### OPTIONS HANDLING #########//

optionsButton.on("click", () => {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage(); else window.open(chrome.runtime.getURL('options.html'));
});

//########## GO BACK HANDLING #########//

backButton.on("click", function () {
    backButton.find(reloadIcons).toggle();
    backButton.find(backIcon).toggle();
    window.history.back()
});
