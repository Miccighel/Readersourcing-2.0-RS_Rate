////////// INIT SECTION //////////

//######## IMPORTS ##########

import {send} from "./shared.js";

//######## CONTENT SECTIONS ##########

let loginForm = $("#login-form");

//######## UI COMPONENTS ##########

let emailField = $("#email");
let passwordField = $("#password");

let backButton = $("#back-btn");
let loginButton = $("#login-btn");

let backIcon = $("#back-icon");
let signInIcon = $("#sign-in-icon");
let reloadIcon = $(".reload-icon");

//######## UI INITIAL SETUP //////////

reloadIcon.hide();

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
            reloadIcon.toggle();
            Cookies.set("authToken", data["auth_token"]);
            window.location.href = "rating.html";
        };
        let errorCallback = function (jqXHR, status) {
            alert(jqXHR.status)
        };
        // noinspection JSIgnoredPromiseFromCall
        send("POST", "http://localhost:3000/authenticate", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    }
});