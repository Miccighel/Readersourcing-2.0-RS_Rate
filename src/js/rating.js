////////// INIT  //////////

//######## IMPORTS ########//

import {fetchToken} from "./shared.js";
import {deleteToken} from "./shared.js";
import {ajax} from "./shared.js";
import {emptyAjax} from "./shared.js";

//######## CONTENT SECTIONS ########//

let buttonsSections = $("#buttons-sect");
let loginSection = $("#login-sect");
let ratingSection = $("#rating-sect");

let modalProfile = $("#modal-profile");
let modalDelete = $("#modal-delete");

//######## UI COMPONENTS ########//

let ratingSlider = $("#rating-slider");

let loginButton = $("#login-btn");
let logoutButton = $("#logout-btn");
let profileButton = $("#profile-btn");
let signUpButton = $("#sign-up-btn");
let loadButton = $("#load-btn");
let voteButton = $("#vote-btn");
let voteSuccessButton = $("#vote-success-btn");
let voteDeleteButton = $("#vote-delete-btn");
let saveButton = $("#save-btn");
let downloadButton = $("#download-btn");
let errorButtons = $(".error-btn");
let modalPasswordEditButton = $("#modal-password-edit-btn");
let modalDeleteButton = $("#modal-delete-btn");

let signInIcon = $("#sign-in-icon");
let signOutIcon = $("#sign-out-icon");
let signUpIcon = $("#sign-up-icon");
let profileIcon = $("#profile-icon");
let reloadIcons = $(".reload-icon");

//######## UI INITIAL SETUP ########//

downloadButton.hide();
loadButton.show();
voteButton.hide();
voteSuccessButton.hide();
voteDeleteButton.hide();
errorButtons.hide();
reloadIcons.hide();

fetchToken().then(function (authToken) {
    if (authToken != null) {
        loginSection.hide();
        buttonsSections.show();
        ratingSection.show();
    } else {
        loginSection.show();
        buttonsSections.hide();
        ratingSection.hide();
    }
});

////////// PUBLICATION STATUS HANDLING (EXISTS ON THE DB, RATED BY THE LOGGED IN USER, ...) //////////

fetchToken().then(function (authToken) {
    if (authToken != null) {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
            let data = {
                publication: {
                    pdf_url: tabs[0].url
                }
            };
            // 1.2 Publication exists, so it may be rated by the user
            let successCallback = function (data, status, jqXHR) {
                // 2.2 Publication has been rated by the user
                let secondSuccessCallback = function (data, status, jqXHR) {
                    loadButton.hide();
                    voteButton.hide();
                    voteSuccessButton.show();
                    voteSuccessButton.prop("disabled", true);
                    voteDeleteButton.show();
                };
                // 2.3 Publication has not been rated by the user
                let secondErrorCallback = function (jqXHR, status) {
                    loadButton.hide();
                    voteButton.show();
                    voteSuccessButton.hide();
                    voteDeleteButton.hide();
                };
                // 2.1 Does the publication has been rated by the logged user?
                let secondPromise = emptyAjax("GET", `http://localhost:3000/publications/${data["id"]}/is_rated.json`, "application/json; charset=utf-8", "json", true, secondSuccessCallback, secondErrorCallback);
            };
            // 1.3 Publication was never rated, so it does not exists on the database
            let errorCallback = function (jqXHR, status) {
                loadButton.hide();
                voteButton.show();
                voteSuccessButton.hide();
            };
            // 1.1 Does the publication exists on the database?
            let promise = ajax("POST", "http://localhost:3000/publications/lookup.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
        });
    }
});

////////// LOGIN HANDLING //////////

loginButton.on("click", function () {
    loginButton.find(reloadIcons).toggle();
    loginButton.find(signInIcon).toggle();
});

////////// LOGOUT HANDLING //////////

logoutButton.on("click", function () {
    logoutButton.find(reloadIcons).toggle();
    logoutButton.find(signOutIcon).toggle();
    deleteToken().then(function () {
        location.reload()
    });
});

/////////// PASSWORD EDIT HANDLING ///////////

modalPasswordEditButton.on("click", function () {
    modalProfile.modal("hide");
    profileButton.find(profileIcon).toggle();
    profileButton.find(reloadIcons).toggle();
    window.location = "password_update.html";
});


////////// REGISTRATION HANDLING //////////

signUpButton.on("click", function () {
    signUpButton.find(reloadIcons).toggle();
    signUpButton.find(signUpIcon).toggle();
});

////////// RATING HANDLING //////////

ratingSlider.slider({});
ratingSlider.on("slide", function (slideEvt) {
    $("#rating-text").text(slideEvt.value);
});

voteButton.on("click", function () {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        voteButton.find(reloadIcons).toggle();
        let score = ratingSlider.val();
        let data = {
            rating: {
                score: score,
                pdf_url: tabs[0].url
            }
        };
        // 1.2 Rating created successfully
        let successCallback = function (data, status, jqXHR) {
            voteButton.find(reloadIcons).toggle();
            voteButton.hide();
            voteSuccessButton.show();
            voteSuccessButton.prop("disabled", true);
            voteDeleteButton.show();
        };
        // 1.3 Error during rating creation
        let errorCallback = function (jqXHR, status) {
            voteButton.hide();
            let errorButton = voteButton.parent().find(errorButtons);
            errorButton.show();
            errorButton.prop("disabled", true)
        };
        // 1.1 Create a new rating with the selected score
        let promise = ajax("POST", "http://localhost:3000/ratings.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    });
});

/////////// RATING DELETE HANDLING ///////////

modalDeleteButton.on("click", function () {
    modalDelete.modal("hide");
    voteDeleteButton.find(reloadIcons).toggle();
    fetchToken().then(function (authToken) {
        if (authToken != null) {
            chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
                let data = {
                    publication: {
                        pdf_url: tabs[0].url
                    }
                };
                // 1.2 Publication exists, so it may be rated by the user
                let successCallback = function (data, status, jqXHR) {
                    // 2.2 Publication has been rated by the user
                    let secondSuccessCallback = function (data, status, jqXHR) {
                        // 3.2 The rating given by the logged user gets finally deleted
                        let thirdSuccessCallback = function (data, status, jqXHR) {
                            loadButton.hide();
                            voteDeleteButton.hide();
                            voteDeleteButton.find(reloadIcons).toggle();
                            voteSuccessButton.hide();
                            voteButton.show()
                        };
                        // 3.3 The rating given by the user could not be deleted
                        let thirdErrorCallback = function (jqXHR, status) {
                            voteDeleteButton.hide();
                            let errorButton = voteButton.parent().find(errorButtons);
                            errorButton.show();
                        };
                        // 3.1 The publication exists and a rating has been found for the logged user, so his rating may be deleted
                        let thirdPremise = emptyAjax("DELETE", `http://localhost:3000/ratings/${data["id"]}.json`, "application/json; charset=utf-8", "text", true, thirdSuccessCallback, thirdErrorCallback)
                    };
                    // 2.3 Publication has not been rated by the user
                    let secondErrorCallback = function (jqXHR, status) {
                        loadButton.hide();
                        voteSuccessButton.hide();
                        voteDeleteButton.hide();
                        voteDeleteButton.find(reloadIcons).toggle();
                        voteButton.show();
                    };
                    // 2.1 Does the publication has been rated by the logged user?
                    let secondPromise = emptyAjax("GET", `http://localhost:3000/publications/${data["id"]}/is_rated.json`, "application/json; charset=utf-8", "json", true, secondSuccessCallback, secondErrorCallback);
                };
                // 1.3 Publication was never rated, so it does not exists on the database
                let errorCallback = function (jqXHR, status) {
                    loadButton.hide();
                    voteSuccessButton.hide();
                    voteDeleteButton.hide();
                    voteDeleteButton.find(reloadIcons).toggle();
                    voteButton.show();
                };
                // 1.1 Does the publication exists on the database?
                let promise = ajax("POST", "http://localhost:3000/publications/lookup.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
            });
        }
    });
});

/////////// SAVE FOR LATER HANDLING //////////

saveButton.on("click", function () {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        let data = {
            publication: {
                pdf_url: tabs[0].url
            }
        };
        saveButton.find(reloadIcons).toggle();
        let successCallback = function (data, status, jqXHR) {
            saveButton.find(reloadIcons).toggle();
            saveButton.hide();
            if(voteDeleteButton.is(":visible")) {
                downloadButton.before("<br/>");
            }
            downloadButton.show();
            downloadButton.attr("href", `http://localhost:3000/${data["pdf_download_url_link"]}`);
        };
        let errorCallback = function (jqXHR, status) {
            saveButton.find(reloadIcons).toggle();
            saveButton.hide();
            let errorButton = saveButton.parent().find(errorButtons);
            errorButton.show();
            errorButton.prop("disabled", true)
        };
        let promise = ajax("POST", "http://localhost:3000/publications/fetch.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    });
});