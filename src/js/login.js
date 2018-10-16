////////// INIT //////////

//######## IMPORTS ########//

import {ajax} from "./shared.js";

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

if (localStorage.getItem("message") === null) {
    successSection.hide();
} else {
    successSection.show();
    successSection.find(alertSuccess).append(localStorage.getItem("message"));
    localStorage.removeItem("message");
}
errorsSection.hide();
errorButton.hide();
reloadIcon.hide();

////////// GENERAL //////////

//######### OPTIONS HANDLING #########//

optionsButton.on("click", function () {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage(); else window.open(chrome.runtime.getURL('options.html'));
});

////////// UTILITY FUNCTIONS //////////

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

//########## GO BACK HANDLING #########//

backButton.on("click", function () {
    backButton.find(reloadIcon).toggle();
    backButton.find(backIcon).toggle();
    window.location.href = "rating.html";
});

//########## LOGIN HANDLING ##########//

let validationInstance = loginForm.parsley();

loginButton.on("click", function () {
    if (validationInstance.isValid()) {
        loginButton.find(signInIcon).toggle();
        loginButton.find(reloadIcon).toggle();
        let data = {email: emailField.val(), password: passwordField.val()};
        let successCallback = function (data, status, jqXHR) {
            loginButton.find(signInIcon).toggle();
            loginButton.find(reloadIcon).toggle();
            Cookies.set("authToken", data["auth_token"]);
            window.location.href = "rating.html";
        };
        let errorCallback = function (jqXHR, status) {
            loginButton.find(signInIcon).toggle();
            loginButton.find(reloadIcon).toggle();
            if (jqXHR.responseText == null) {
                loginButton.hide();
                let button = loginButton.parent().find(errorButton);
                button.show();
                button.prop("disabled", true)
            } else {
                let errors = JSON.parse(jqXHR.responseText);
                let element = "";
                for (let attribute in errors) {
                    if (errors.hasOwnProperty(attribute)) {
                        let array = errors[attribute];
                        element = `<ul>`;
                        for (let index in array) {
                            if (array.hasOwnProperty(index)) {
                                element = `${element}<li>${array[index].message.capitalize()}</li>`;
                            }
                        }
                        element = `${element}</ul>`;
                    }
                }
                if (errorsSection.find(alert).children().length < 1) {
                    errorsSection.find(alert).append(element);
                }
                errorsSection.show();
            }
        };
        // noinspection JSIgnoredPromiseFromCall
        ajax("POST", "authenticate", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    }
});

loginForm.submit(function (event) {
    event.preventDefault();
});