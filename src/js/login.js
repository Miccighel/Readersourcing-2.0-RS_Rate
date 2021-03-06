////////// INIT //////////

//######## IMPORTS ########//

import {storeToken} from "./shared.js";

import {ajax} from "./shared.js";
import {buildErrors} from "./shared.js";
import {removePreloader} from "./shared.js";
//######## CONTENT SECTIONS ########//

let successSection = $("#success-sect");
let errorsSection = $(".errors-sect");

//######## UI COMPONENTS ########//

let loginForm = $("#login-form");

let emailField = $("#email");
let passwordField = $("#password");

let loginButton = $("#login-btn");
let optionsButton = $("#options-btn");
let backButton = $("#back-btn");
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

removePreloader();

////////// GENERAL //////////

//######### OPTIONS HANDLING #########//

optionsButton.on("click", () => {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage(); else window.open(chrome.runtime.getURL('options.html'));
});

//########## GO BACK HANDLING #########//

backButton.on("click", () => {
    backButton.find(reloadIcon).toggle();
    backButton.find(backIcon).toggle();
    window.location.href = "home.html";
});

//########## LOGIN HANDLING ##########//

loginButton.on("click", () => {
    let validationInstance = loginForm.parsley();
    if (validationInstance.isValid()) {
        loginButton.find(signInIcon).toggle();
        loginButton.find(reloadIcon).toggle();
        let data = {email: emailField.val(), password: passwordField.val()};
        let successCallback = (data, status, jqXHR) => {
            loginButton.find(signInIcon).toggle();
            loginButton.find(reloadIcon).toggle();
            storeToken(data["auth_token"]);
            window.location.href = "rating_web.html"
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
                    loginButton.parent().find(errorsSection).find(alert).empty();
                    loginButton.parent().find(errorsSection).find(alert).append(result);
                    loginButton.parent().find(errorsSection).show();
                });
            }
        };
        // noinspection JSIgnoredPromiseFromCall
        ajax("POST", "authenticate", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    }
});

loginForm.submit(event => event.preventDefault());