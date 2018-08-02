////////// INIT //////////

//######## IMPORTS ##########

import {send} from "./shared.js";
import {deleteToken} from "./shared.js";

//######## CONTENT SECTIONS ##########

let registrationForm = $("#sign-up-form");
let errorsSection = $("#errors-sect");

//######## UI COMPONENTS ##########

let firstNameField = $("#first-name");
let lastNameField = $("#last-name");
let emailField = $("#email");
let orcidField = $("#orcid");
let passwordField = $("#password");
let passwordConfirmationField = $("#password-confirmation");

let backButton = $("#back-btn");
let registrationButton = $("#sign-up-btn");

let backIcon = $("#back-icon");
let signUpIcon = $("#sign-up-icon");
let reloadIcon = $(".reload-icon");

//######## UI INITIAL SETUP //////////

errorsSection.hide();
reloadIcon.hide();

////////// GO BACK HANDLING //////////

backButton.on("click", function () {
    backButton.find(reloadIcon).toggle();
    backButton.find(backIcon).toggle();
    window.history.back()
});

////////// REGISTRATION HANDLING //////////

let validationInstance = registrationForm.parsley();

registrationForm.submit(function (event) {
    event.preventDefault();
});

registrationButton.on("click", function () {
    if (validationInstance.isValid()) {
        registrationButton.find(signUpIcon).toggle();
        registrationButton.find(reloadIcon).toggle();
        let data = {
            user: {
                first_name: firstNameField.val(),
                last_name: lastNameField.val(),
                email: emailField.val(),
                orcid: orcidField.val(),
                password: passwordField.val(),
                password_confirmation: passwordConfirmationField.val()
            }
        };
        let successCallback = function (data, status, jqXHR) {
            registrationButton.find(reloadIcon).toggle();
            deleteToken().then(function () {
                window.location.href = "rating.html";
            });
        };
        let errorCallback = function (jqXHR, status) {
            registrationButton.find(reloadIcon).toggle();
            let errors = JSON.parse(jqXHR.responseText);
            for (let attribute in errors) {
                let array = errors[attribute];
            }
            errorsSection.show();
        };
        // noinspection JSIgnoredPromiseFromCall
        send("POST", "http://localhost:3000/users.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    }
});