////////// INIT //////////

//######## IMPORTS ########//

import {ajax} from "./shared.js";
import {deleteToken} from "./shared.js";
import {buildErrors} from "./shared.js";

//######## CONTENT SECTIONS ########//

let registrationForm = $("#sign-up-form");

let errorsSection = $("#errors-sect");

//######## UI COMPONENTS ########//

let firstNameField = $("#first-name");
let lastNameField = $("#last-name");
let emailField = $("#email");
let orcidField = $("#orcid");
let passwordField = $("#password");
let passwordConfirmationField = $("#password-confirmation");

let subscribeCheckbox = $("#subscribe");

let optionsButton = $("#options-btn");
let backButton = $("#back-btn");
let registrationButton = $("#sign-up-btn");
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

//########## REGISTRATION HANDLING ##########//

let validationInstance = registrationForm.parsley();

registrationForm.submit(function (event) {
    event.preventDefault();
});

registrationButton.on("click", function () {
    if (validationInstance.isValid()) {
        registrationButton.find(signUpIcon).toggle();
        registrationButton.find(reloadIcons).toggle();
        let data = {
            user: {
                first_name: firstNameField.val(),
                last_name: lastNameField.val(),
                email: emailField.val(),
                orcid: orcidField.val(),
                password: passwordField.val(),
                password_confirmation: passwordConfirmationField.val(),
                subscribe: !!subscribeCheckbox.is(":checked")
            },
        };
        let successCallback = function (data, status, jqXHR) {
            registrationButton.find(reloadIcons).toggle();
            deleteToken().then(function () {
                chrome.storage.sync.set({message: data["message"]}, function () {
                    window.location.href = "login.html";
                });
            });
        };
        let errorCallback = function (jqXHR, status) {
            registrationButton.find(reloadIcons).toggle();
            registrationButton.find(signUpIcon).toggle();
            if (jqXHR.responseText == null) {
                registrationButton.hide();
                let button = registrationButton.parent().find(errorButton);
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
        // noinspection JSIgnoredPromiseFromCall
        ajax("POST", "users.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
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