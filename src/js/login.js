////////// INIT //////////

//######## IMPORTS ########//

import {send} from "./shared.js";

//######## CONTENT SECTIONS ########//

let loginForm = $("#login-form");
let errorsSection = $("#errors-sect");

//######## UI COMPONENTS ########//

let emailField = $("#email");
let passwordField = $("#password");

let backButton = $("#back-btn");
let loginButton = $("#login-btn");

let alert = $(".alert");

let backIcon = $("#back-icon");
let signInIcon = $("#sign-in-icon");
let reloadIcon = $(".reload-icon");

//######## UI INITIAL SETUP ########//

errorsSection.hide();
reloadIcon.hide();

//######## UTILITY FUNCTIONS ########//

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

////////// GO BACK HANDLING //////////

backButton.on("click", function () {
    backButton.find(reloadIcon).toggle();
    backButton.find(backIcon).toggle();
    window.history.back()
});

////////// LOGIN HANDLING //////////

let validationInstance = loginForm.parsley();

loginForm.submit(function (event) {
    event.preventDefault();
});

loginButton.on("click", function () {
    if (validationInstance.isValid()) {
        loginButton.find(signInIcon).toggle();
        loginButton.find(reloadIcon).toggle();
        let data = {email: emailField.val(), password: passwordField.val()};
        let successCallback = function (data, status, jqXHR) {
            loginButton.find(reloadIcon).toggle();
            Cookies.set("authToken", data["auth_token"]);
            window.location.href = "rating.html";
        };
        let errorCallback = function (jqXHR, status) {
            loginButton.find(reloadIcon).toggle();
            let errors = JSON.parse(jqXHR.responseText);
            let element = "";
            for (let attribute in errors['error']) {
                let array = errors['error'][attribute];
                element = `${element}<br/>${attribute.capitalize()}: <ul>`;
                for (let index in array) {
                    element = `${element}<li>${array[index].capitalize()}</li>`;
                }
                element = `${element}</ul>`;
            }
            if(errorsSection.find(alert).children().length < 1) {
                errorsSection.find(alert).append(element);
            }
            errorsSection.show();
        };
        // noinspection JSIgnoredPromiseFromCall
        send("POST", "http://localhost:3000/authenticate", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    }
});