////////// INIT  //////////

//######## IMPORTS ########//

import {deleteToken} from "./shared.js";
import {ajax} from "./shared.js";

//######## CONTENT SECTIONS ########//

let passwordEditForm = $("#password-edit-form");

let errorsSection = $("#errors-sect");

//######## UI COMPONENTS ########//

let passwordField = $("#password");
let passwordConfirmationField = $("#password-confirmation");

let backButton = $("#back-btn");
let passwordEditButton = $("#password-edit-btn");
let errorButton = $(".error-btn");

let alert = $(".alert");

let backIcon = $("#back-icon");
let checkIcon = $("#check-icon");
let reloadIcons = $(".reload-icon");

//######## UI INITIAL SETUP ########//

errorsSection.hide();
errorButton.hide();
reloadIcons.hide();

////////// GO BACK HANDLING //////////

backButton.on("click", function () {
    backButton.find(reloadIcons).toggle();
    backButton.find(backIcon).toggle();
    window.history.back()
});

//######## UTILITY FUNCTIONS ########//

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

////////// PASSWORD EDIT HANDLING //////////

let validationInstance = passwordEditForm.parsley();

passwordEditForm.submit(function (event) {
    event.preventDefault();
});

passwordEditButton.on("click", function () {
    if (validationInstance.isValid()) {
        passwordEditButton.find(checkIcon).toggle();
        passwordEditButton.find(reloadIcons).toggle();
        let data = {
            password: passwordField.val(),
            password_confirmation: passwordConfirmationField.val()
        };
        let successCallback = function (data, status, jqXHR) {
            passwordEditButton.find(reloadIcons).toggle();
            deleteToken().then(function () {
                localStorage.setItem("message", data["message"]);
                window.location.href = "login.html";
            });
        };
        let errorCallback = function (jqXHR, status) {
            passwordEditButton.find(checkIcon).toggle();
            passwordEditButton.find(reloadIcons).toggle();
            if (jqXHR.responseText == null) {
                passwordEditButton.hide();
                let button = passwordEditButton.parent().find(errorButton);
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
        ajax("POST", "http://localhost:3000/password/update.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    }
});