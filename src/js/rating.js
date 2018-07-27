////////// INIT SECTION //////////

import {send} from "./networking.js";
import {fetchToken} from "./networking.js";

let loginSection = $("#login-sect");
let ratingSection = $("#rating-sect");

let ratingSlider = $("#rating-slider");

let voteButton = $("#vote-btn");
let saveButton = $("#save-btn");
let downloadButton = $("#download-btn");
let errorButton = $("#error-btn");

let reloadIcons = $(".reload-icon");

downloadButton.hide();
errorButton.hide();
reloadIcons.hide();

////////// LOGIN HANDLING //////////

let authToken = fetchToken(loginSection, ratingSection);

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
        let data = {publication: {pdf_url: tabs[0].url}};
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