////////// INIT  //////////

//######## IMPORTS ##########

import {send} from "./networking.js";
import {fetchToken} from "./networking.js";
import {deleteToken} from "./networking.js";

//######## CONTENT SECTIONS ##########

let buttonsSections = $("#buttons-sect");
let loginSection = $("#login-sect");
let ratingSection = $("#rating-sect");

//######## UI COMPONENTS ##########

let ratingSlider = $("#rating-slider");

let logoutButton = $("#logout-btn");
let voteButton = $("#vote-btn");
let saveButton = $("#save-btn");
let downloadButton = $("#download-btn");
let errorButton = $("#error-btn");

let signOutIcons = $(".sign-out-icon");
let reloadIcons = $(".reload-icon");

//######## UI INITIAL SETUP ##########

downloadButton.hide();
errorButton.hide();
reloadIcons.hide();

////////// LOGIN HANDLING //////////

if (fetchToken() != null) {
    loginSection.hide();
    buttonsSections.show();
    ratingSection.show();
} else {
    loginSection.show();
    buttonsSections.hide();
    ratingSection.hide();
}

////////// LOGOUT HANDLING //////////

logoutButton.on("click", function () {
    logoutButton.find(reloadIcons).toggle();
    logoutButton.find(signOutIcons).toggle();
    let result = deleteToken();
    window.location.href= "login.html"
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