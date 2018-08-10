////////// INIT  //////////

//######## IMPORTS ########//

import {send} from "./shared.js";
import {fetchToken} from "./shared.js";
import {deleteToken} from "./shared.js";

//######## CONTENT SECTIONS ########//

let buttonsSections = $("#buttons-sect");
let loginSection = $("#login-sect");
let ratingSection = $("#rating-sect");

//######## UI COMPONENTS ########//

let ratingSlider = $("#rating-slider");

let loginButton = $("#login-btn");
let logoutButton = $("#logout-btn");
let signUpButton = $("#sign-up-btn");
let loadButton = $("#load-btn");
let voteButton = $("#vote-btn");
let voteSuccessButton = $("#vote-success-btn");
let saveButton = $("#save-btn");
let downloadButton = $("#download-btn");
let errorButtons = $(".error-btn");

let signInIcons = $("#sign-in-icon");
let signOutIcons = $("#sign-out-icon");
let signUpIcons = $("#sign-up-icon");
let reloadIcons = $(".reload-icon");

//######## UI INITIAL SETUP ########//

downloadButton.hide();
loadButton.show();
voteButton.hide();
voteSuccessButton.hide();
errorButtons.hide();
reloadIcons.hide();

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
                    voteSuccessButton.prop("disabled", true)
                };
                // 2.3 Publication has not been rated by the user
                let secondErrorCallback = function (jqXHR, status) {
                    loadButton.hide();
                    voteButton.show();
                    voteSuccessButton.hide();
                };
                // 2.1 Does the publication has been rated by the logged user?
                let secondPromise = send("GET", `http://localhost:3000/publications/${data["id"]}/is_rated.json`, "application/json; charset=utf-8", "json", true, data, secondSuccessCallback, secondErrorCallback);
            };
            // 1.3 Publication was never rated, so it does not exists on the database
            let errorCallback = function (jqXHR, status) {
                console.log("here");
                loadButton.hide();
                voteButton.show();
            };
            // 1.1 Does the publication exists on the database?
            let promise = send("POST", "http://localhost:3000/publications/lookup.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
        });
    }
});

////////// LOGIN HANDLING //////////

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

////////// LOGIN HANDLING //////////

loginButton.on("click", function () {
    loginButton.find(reloadIcons).toggle();
    loginButton.find(signInIcons).toggle();
});

////////// LOGOUT HANDLING //////////

logoutButton.on("click", function () {
    logoutButton.find(reloadIcons).toggle();
    logoutButton.find(signOutIcons).toggle();
    deleteToken().then(function () {
        location.reload()
    });
});

////////// REGISTRATION HANDLING //////////

signUpButton.on("click", function () {
    signUpButton.find(reloadIcons).toggle();
    signUpButton.find(signUpIcons).toggle();
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
            voteSuccessButton.prop("disabled", true)
        };
        // 1.3 Error during rating creation
        let errorCallback = function (jqXHR, status) {
            let errorButton = voteButton.parent().find(errorButtons);
            errorButton.show();
            errorButton.prop("disabled", true)
        };
        // 1.1 Create a new rating with the selected score
        let promise = send("POST", "http://localhost:3000/ratings.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
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
        let promise = send("POST", "http://localhost:3000/publications/fetch.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    });
});