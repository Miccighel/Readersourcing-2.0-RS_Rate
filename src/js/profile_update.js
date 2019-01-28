////////// INIT //////////

//######## IMPORTS ########//

import {deleteToken} from "./shared.js";
import {ajax} from "./shared.js";
import {emptyAjax} from "./shared.js";
import {buildErrors} from "./shared.js";
import {removePreloader} from "./shared.js";

//######## CONTENT SECTIONS ########//

let signUpForm = $("#sign-up-form");

let errorsSection = $(".errors-sect");

//######## UI COMPONENTS ########//

let firstNameField = $("#first-name");
let lastNameField = $("#last-name");
let orcidField = $("#orcid");

let subscribeCheckbox = $("#subscribe");

let backButton = $("#back-btn");
let updateButton = $("#update-btn");
let errorButton = $(".error-btn");
let optionsButton = $("#options-btn");

let alert = $(".alert");

let checkIcon = $("#check-icon");
let backIcon = $("#back-icon");
let reloadIcons = $(".reload-icon");

//######## UI INITIAL SETUP ########//

errorsSection.hide();
errorButton.hide();

firstNameField.hide();
lastNameField.hide();
orcidField.hide();
subscribeCheckbox.hide();
backButton.find(reloadIcons).hide();
updateButton.find(reloadIcons).hide();

updateButton.prop("disabled", true);

let validationInstance = signUpForm.parsley();

signUpForm.submit(event => event.preventDefault());

removePreloader();

////////// USER ///////////

//####### STATUS HANDLING (SCORES, ...) #########//

chrome.storage.sync.get(['authToken'], result => {
    let authToken = result.authToken;
    if (authToken != null) {
        let successCallback = (data, status, jqXHR) => {
            firstNameField.val(data["first_name"]);
            firstNameField.show();
            firstNameField.parent().parent().find(reloadIcons).hide();
            lastNameField.val(data["last_name"]);
            lastNameField.show();
            lastNameField.parent().parent().find(reloadIcons).hide();
            orcidField.val(data["orcid"]);
            orcidField.show();
            orcidField.parent().parent().find(reloadIcons).hide();
            (data["subscribe"]) === true ? subscribeCheckbox.prop('checked', true) : subscribeCheckbox.prop('checked', false);
            subscribeCheckbox.show();
            subscribeCheckbox.parent().parent().find(reloadIcons).hide();
            updateButton.prop("disabled", false);
        };
        let errorCallback = (jqXHR, status) => {
            firstNameField.val();
            lastNameField.val();
            orcidField.val();
            subscribeCheckbox.prop('checked', false);
            updateButton.prop("disabled", false);
        };
        let promise = emptyAjax("POST", "/users/info.json", "application/json; charset=utf-8", "json", true, successCallback, errorCallback);
    }
});

//########## UPDATE HANDLING ##########//

chrome.storage.sync.get(['authToken'], result => {
    let authToken = result.authToken;
    if (authToken != null) {
        updateButton.on("click", () => {
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
                    let secondSuccessCallback = (data, status, jqXHR) => {
                        updateButton.find(reloadIcons).toggle();
                        deleteToken().then(() => {
                            localStorage.setItem("message", data["message"]);
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
                let promise = emptyAjax("POST", "/users/info.json", "application/json; charset=utf-8", "json", true, successCallback, errorCallback);
            }
        });
    }
});

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