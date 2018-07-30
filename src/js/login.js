////////// INIT SECTION //////////

import {send} from "./networking.js";

let loginForm = $("#login-form");

let emailField = $("#email");
let passwordField = $("#password");

let loginButton = $("#login-btn");

let signInIcon = $("#sign-in-icon");
let reloadIcon = $("#reload-icon");

reloadIcon.hide();

////////// LOGIN HANDLING //////////

loginForm.submit(function (event) {
    event.preventDefault();
});

loginButton.on("click", function () {
    signInIcon.toggle();
    reloadIcon.toggle();
    let data = {email: emailField.val(), password: passwordField.val()};
    let successCallback = function (data, status, jqXHR) {
        reloadIcon.toggle();
        Cookies.set("authToken", data["auth_token"]);
        window.history.back();
    };
    let errorCallback = function (jqXHR, status) {
        alert(jqXHR.status)
    };
    // noinspection JSIgnoredPromiseFromCall
    send("POST", "http://localhost:3000/authenticate", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
});