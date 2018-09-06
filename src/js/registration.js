////////// INIT //////////

//######## IMPORTS ########//

import {ajax} from "./shared.js";
import {deleteToken} from "./shared.js";

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

let backButton = $("#back-btn");
let registrationButton = $("#sign-up-btn");
let errorButton = $(".error-btn");

let alert = $(".alert");

let backIcon = $("#back-icon");
let signUpIcon = $("#sign-up-icon");
let reloadIcon = $(".reload-icon");

//######## UI INITIAL SETUP ########//

errorsSection.hide();
errorButton.hide();
reloadIcon.hide();

//######## UTILITY FUNCTIONS ########//

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

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
                window.location.href = "login.html";
            });
        };
        let errorCallback = function (jqXHR, status) {
            registrationButton.find(reloadIcon).toggle();
            registrationButton.find(signUpIcon).toggle();
            if (jqXHR.responseText == null) {
                registrationButton.hide();
                let button = registrationButton.parent().find(errorButton);
                button.show();
                button.prop("disabled", true)
            } else {
                let errors = JSON.parse(jqXHR.responseText);
                let element = "";
                for (let attribute in errors) {
                    if (errors.hasOwnProperty(attribute)) {
                        let array = errors[attribute];
                        element = `${element}<br/>${attribute.capitalize()}: <ul>`;
                        for (let index in array) {
                            if (array.hasOwnProperty(index)) {
                                element = `${element}<li>${array[index].capitalize()}</li>`;
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
        ajax("POST", "http://localhost:3000/users.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    }
});