////////// INIT //////////

//######## IMPORTS ########//

import {fetchToken} from "./shared.js";
import {deleteToken} from "./shared.js";
import {ajax} from "./shared.js";
import {emptyAjax} from "./shared.js";
import {buildErrors} from "./shared.js";

//######## CONTENT SECTIONS ########//

let registrationForm = $("#sign-up-form");

let errorsSection = $("#errors-sect");

//######## UI COMPONENTS ########//

let firstNameField = $("#first-name");
let lastNameField = $("#last-name");
let emailField = $("#email");
let orcidField = $("#orcid");

let subscribeCheckbox = $("#subscribe");

let optionsButton = $("#options-btn");
let backButton = $("#back-btn");
let updateButton = $("#update-btn");
let errorButton = $(".error-btn");

let alert = $(".alert");

let backIcon = $("#back-icon");
let signUpIcon = $("#sign-up-icon");
let reloadIcons = $(".reload-icon");

//######## UI INITIAL SETUP ########//

errorsSection.hide();
errorButton.hide();
reloadIcons.hide();

////////// GENERAL //////////

//######### OPTIONS HANDLING #########//

optionsButton.on("click", function () {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage(); else window.open(chrome.runtime.getURL('options.html'));
});

////////// USER ///////////

//####### STATUS HANDLING (SCORES, ...) #########//

fetchToken().then(function (authToken) {
    if (authToken != null) {
        let successCallback = function (data, status, jqXHR) {
            firstNameField.val(data["first_name"]);
            lastNameField.val(data["last_name"]);
            emailField.val(data["email"]);
            orcidField.val(data["orcid"]);
            (data["subscribe"]) === true ? subscribeCheckbox.prop('checked', true) : subscribeCheckbox.prop('checked', false);
        };
        let errorCallback = function (jqXHR, status) {
            firstNameField.val();
            lastNameField.val();
            emailField.val();
            orcidField.val();
            subscribeCheckbox.prop('checked', false);
        };
        let promise = emptyAjax("POST", "users/info.json", "application/json; charset=utf-8", "json", true, successCallback, errorCallback);
    }
});

//########## UPDATE HANDLING ##########//

let validationInstance = registrationForm.parsley();

registrationForm.submit(function (event) {
    event.preventDefault();
});

fetchToken().then(function (authToken) {
    if (authToken != null) {
        updateButton.on("click", function () {
            updateButton.find(signUpIcon).toggle();
            updateButton.find(reloadIcons).toggle();
            let successCallback = function (data, status, jqXHR) {
                if (validationInstance.isValid()) {
                    let secondData = {
                        user: {
                            first_name: firstNameField.val(),
                            last_name: lastNameField.val(),
                            email: emailField.val(),
                            orcid: orcidField.val(),
                            subscribe: !!subscribeCheckbox.is(":checked")
                        },
                    };
                    if (orcidField.val() === "")
                        delete secondData.user.orcid;
                    let secondSuccessCallback = function (data, status, jqXHR) {
                        updateButton.find(reloadIcons).toggle();
                        deleteToken().then(function () {
                            localStorage.setItem("message", data["message"]);
                            window.location.href = "login.html";
                        });
                    };
                    let secondErrorCallback = function (jqXHR, status) {
                        updateButton.find(reloadIcons).toggle();
                        updateButton.find(signUpIcon).toggle();
                        if (jqXHR.responseText == null) {
                            updateButton.hide();
                            let button = updateButton.parent().find(errorButton);
                            button.show();
                            button.prop("disabled", true)
                        } else {
                            let errorPromise = buildErrors(jqXHR.responseText).then(function(result) {
                                errorsSection.find(alert).empty();
                                errorsSection.find(alert).append(result);
                                errorsSection.show();
                            });
                        }
                    };
                    let secondPromise = ajax("PUT", `users/${data["id"]}.json`, "application/json; charset=utf-8", "json", true, secondData, secondSuccessCallback, secondErrorCallback);
                }
            };
            let errorCallback = function (jqXHR, status) {
                updateButton.find(reloadIcons).toggle();
                updateButton.find(signUpIcon).toggle();
                if (jqXHR.responseText == null) {
                    updateButton.hide();
                    let button = updateButton.parent().find(errorButton);
                    button.show();
                    button.prop("disabled", true)
                } else {
                    let errorPromise = buildErrors(jqXHR.responseText).then(function(result) {
                        errorsSection.find(alert).empty();
                        errorsSection.find(alert).append(result);
                        errorsSection.show();
                    });
                }
            };
            let promise = emptyAjax("POST", "users/info.json", "application/json; charset=utf-8", "json", true, successCallback, errorCallback);
        });
    }
});

//////////// UTILITY FUNCTIONS ////////////

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

//########## GO BACK HANDLING #########//

backButton.on("click", function () {
    backButton.find(reloadIcons).toggle();
    backButton.find(backIcon).toggle();
    window.history.back()
});