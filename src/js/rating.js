////////// INIT  //////////

//######## IMPORTS ##########

import {send} from "./shared.js";
import {fetchToken} from "./shared.js";
import {deleteToken} from "./shared.js";

//######## CONTENT SECTIONS ##########

let buttonsSections = $("#buttons-sect");
let loginSection = $("#login-sect");
let ratingSection = $("#rating-sect");

//######## UI COMPONENTS ##########

let ratingSlider = $("#rating-slider");

let loginButton = $("#login-btn");
let logoutButton = $("#logout-btn");
let signUpButton = $("#sign-up-btn");
let voteButton = $("#vote-btn");
let saveButton = $("#save-btn");
let downloadButton = $("#download-btn");
let errorButton = $("#error-btn");

let signInIcons = $("#sign-in-icon");
let signOutIcons = $("#sign-out-icon");
let signUpIcons = $("#sign-up-icon");
let reloadIcons = $(".reload-icon");

//######## UI INITIAL SETUP //////////

downloadButton.hide();
errorButton.hide();
reloadIcons.hide();

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
    let score = ratingSlider.val();
    let data = {rating: {score: score}};
    voteButton.find(reloadIcons).toggle();
    // TODO Aggiungere richiesta RESTful per il voto
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
            downloadButton.attr("href", "http://localhost:3000/" + data["pdf_download_url_link"]);
        };
        let errorCallback = function (jqXHR, status) {
            saveButton.find(reloadIcons).toggle();
            saveButton.hide();
            errorButton.show();
            errorButton.prop("disabled", true)
        };
        let promise = send("POST", "http://localhost:3000/publications/fetch.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    });

});