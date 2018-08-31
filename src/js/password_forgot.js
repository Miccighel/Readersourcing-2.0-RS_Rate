////////// INIT  //////////

//######## IMPORTS ########//

import {deleteToken} from "./shared.js";
import {ajax} from "./shared.js";

//######## CONTENT SECTIONS ########//

let passwordForgotForm = $("#password-forgot-form");

let errorsSection = $("#errors-sect");

//######## UI COMPONENTS ########//

let emailField = $("#email");

let backButton = $("#back-btn");
let passwordForgotButton = $("#password-forgot-btn");
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
    window.location.href = "login.html";
});

////////// PASSWORD EDIT HANDLING //////////

let validationInstance = passwordForgotForm.parsley();

passwordForgotForm.submit(function (event) {
    event.preventDefault();
});

passwordForgotButton.on("click", function () {
    if (validationInstance.isValid()) {
        passwordForgotButton.find(checkIcon).toggle();
        passwordForgotButton.find(reloadIcons).toggle();
        let data = {
            email: emailField.val(),
        };
        let successCallback = function (data, status, jqXHR) {
            passwordForgotButton.find(reloadIcons).toggle();
            deleteToken().then(function () {
                localStorage.setItem("message", data["message"]);
                window.location.href = "login.html";
            });
        };
        let errorCallback = function (jqXHR, status) {
            passwordForgotButton.find(reloadIcons).toggle();
            if (jqXHR.responseText == null) {
                passwordForgotButton.hide();
                let button = passwordForgotButton.parent().find(errorButton);
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
        ajax("POST", "http://localhost:3000/password/forgot.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    }
});