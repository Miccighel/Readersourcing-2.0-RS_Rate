import {send} from "./networking.js";

let ratingSlider = $("#rating-slider");
let voteButton = $("#vote-btn");
let saveButton = $("#save-btn");
let downloadButton = $("#download-btn");
let reloadIcons = $(".reload-icon");

downloadButton.hide();
reloadIcons.hide();

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

saveButton.on("click", function () {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        let data = {publication: {pdf_url: tabs[0].url}};
        saveButton.find(reloadIcons).toggle();
        let successCallback = function (data, status, jqXHR) {
            saveButton.find(reloadIcons).toggle();
            saveButton.hide();
            downloadButton.show();
            downloadButton.attr("href",  "http://localhost:3000/" + data["pdf_download_url"]);
        };
        let errorCallback = function (jqXHR, status) {
            alert(jqXHR)
        };
        let promise = send("POST", "http://localhost:3000/publications/14/fetch.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    });

});