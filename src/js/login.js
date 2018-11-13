////////// INIT //////////

//######## IMPORTS ########//

import {ajax} from "./shared.js";
import {buildErrors} from "./shared.js";

//######## CONTENT SECTIONS ########//

let loginForm = $("#login-form");
let successSection = $("#success-sect");
let errorsSection = $("#errors-sect");

//######## UI COMPONENTS ########//

let emailField = $("#email");
let passwordField = $("#password");

let optionsButton = $("#options-btn");
let backButton = $("#back-btn");
let loginButton = $("#login-btn");
let errorButton = $(".error-btn");

let alert = $(".alert");
let alertSuccess = $(".alert-success");

let backIcon = $("#back-icon");
let signInIcon = $("#sign-in-icon");
let reloadIcon = $(".reload-icon");

//######## UI INITIAL SETUP ########//

chrome.storage.sync.get(['message'], result => {
    if (result.message == null) {
        successSection.hide();
    } else {
        successSection.show();
        successSection.find(alertSuccess).append(result.message);
        chrome.storage.sync.remove(['message']);
    }
});

errorsSection.hide();
errorButton.hide();
reloadIcon.hide();

////////// GENERAL //////////

//######### OPTIONS HANDLING #########//

optionsButton.on("click", () => {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage(); else window.open(chrome.runtime.getURL('options.html'));
});

//########## GO BACK HANDLING #########//

backButton.on("click", () => {
    backButton.find(reloadIcon).toggle();
    backButton.find(backIcon).toggle();
    window.location.href = "rating.html";
});

//########## LOGIN HANDLING ##########//

let validationInstance = loginForm.parsley();

loginButton.on("click", () => {
    if (validationInstance.isValid()) {
        loginButton.find(signInIcon).toggle();
        loginButton.find(reloadIcon).toggle();
        let data = {email: emailField.val(), password: passwordField.val()};
        let successCallback = (data, status, jqXHR) => {
            loginButton.find(signInIcon).toggle();
            loginButton.find(reloadIcon).toggle();
            chrome.storage.sync.set({authToken: data["auth_token"]}, () => window.location.href = "rating.html");
        };
        let errorCallback = (jqXHR, status) => {
            loginButton.find(signInIcon).toggle();
            loginButton.find(reloadIcon).toggle();
            if (jqXHR.responseText == null) {
                loginButton.hide();
                let button = loginButton.parent().find(errorButton);
                button.show();
                button.prop("disabled", true)
            } else {
                let errorPromise = buildErrors(jqXHR.responseText).then(result => {
                    errorsSection.find(alert).empty();
                    errorsSection.find(alert).append(result);
                    errorsSection.show();
                });
            }
        };
        // noinspection JSIgnoredPromiseFromCall
        ajax("POST", "authenticate", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    }
});

loginForm.submit(event => event.preventDefault());