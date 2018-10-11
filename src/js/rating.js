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
let publicationScoreSection = $("#publication-score-sect");
let userScoreSection = $("#user-score-sect");

//######## MODALS ########//

let modalProfile = $("#modal-profile");
let modalConfigure = $("#modal-configuration");
let modalDelete = $("#modal-delete");
let modalRefresh = $("#modal-refresh");

//######## UI COMPONENTS ########//

let loginButton = $("#login-btn");
let logoutButton = $("#logout-btn");
let profileButton = $("#profile-btn");
let signUpButton = $("#sign-up-btn");
let loadButton = $("#load-btn");
let voteButton = $("#vote-btn");
let voteSuccessButton = $("#vote-success-btn");
// let voteDeleteButton = $("#vote-delete-btn");
let configureButton = $("#configure-btn");
let configureSaveButton = $("#configuration-save-btn");
let saveButton = $("#save-btn");
let downloadButton = $("#download-btn");
let refreshButton = $("#refresh-btn");
let errorButtons = $(".error-btn");
let modalPasswordEditButton = $("#modal-password-edit-btn");
let modalDeleteButton = $("#modal-delete-btn");
let modalRefreshButton = $("#modal-refresh-btn");

let ratingCaption = $("#rating-caption");
let ratingSubCaption = $("#rating-subcaption");
let ratingSlider = $("#rating-slider");
let ratingText = $("#rating-text");
let buttonsCaption = $("#buttons-caption");
let userScoreSMValue = $("#user-score-sm-val");
let userScoreTRValue = $("#user-score-tr-val");

let publicationScoreSMValue = $("#publication-score-sm-val");
let publicationScoreTRValue = $("#publication-score-tr-val");

let anonymizeCheckbox = $("#anonymize-check");

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
// voteDeleteButton.hide();
errorButtons.hide();
reloadIcons.hide();
ratingCaption.hide();
ratingSubCaption.hide();
ratingSlider.hide();
ratingText.show();

fetchToken().then(function (authToken) {
    if (authToken != null) {
        loginSection.hide();
        buttonsSections.show();
        ratingSection.show();
        publicationScoreSection.show();
    } else {
        loginSection.show();
        buttonsSections.hide();
        ratingSection.hide();
        publicationScoreSection.hide();
    }
});

ratingSlider.slider({});
ratingSlider.on("slide", function (slideEvt) {
    ratingText.text(slideEvt.value);
});

////////// USER STATUS HANDLING (SCORES, ...) //////////

fetchToken().then(function (authToken) {
    if (authToken != null) {
        let successCallback = function (data, status, jqXHR) {
            userScoreSMValue.text((data["score"] * 100).toFixed(2));
            userScoreTRValue.text((data["bonus"] * 100).toFixed(2));
        };
        let errorCallback = function (jqXHR, status) {
            userScoreSMValue.text("...");
            userScoreTRValue.text("...");
        };
        let promise = emptyAjax("POST", "http://localhost:3000/users/info.json", "application/json; charset=utf-8", "json", true, successCallback, errorCallback);
    }
});

////////// SAVE FOR LATER STATUS HANDLING //////////

fetchToken().then(function (authToken) {
    if (authToken != null) {
        if (localStorage.getItem("downloadUrl") === null) {
            downloadButton.hide();
            refreshButton.hide();
            saveButton.show();
        } else {
            saveButton.hide();
            downloadButton.show();
            downloadButton.attr("href", localStorage.getItem("downloadUrl"));
            refreshButton.show();
        }
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
                publicationScoreSMValue.text((data["score_sm"] * 100).toFixed(2));
                publicationScoreTRValue.text((data["score_tr"] * 100).toFixed(2));
                // 2.2 Publication has been rated by the user
                let secondSuccessCallback = function (data, status, jqXHR) {
                    buttonsCaption.hide();
                    loadButton.hide();
                    voteButton.hide();
                    configureButton.hide();
                    downloadButton.hide();
                    refreshButton.hide();
                    saveButton.hide();
                    voteSuccessButton.show();
                    voteSuccessButton.prop("disabled", true);
                    ratingCaption.hide();
                    ratingSubCaption.show();
                    ratingSlider.slider('destroy');
                    ratingSlider.hide();
                    ratingText.removeClass("mt-3");
                    ratingText.text(data["score"]);
                    // voteDeleteButton.show();
                };
                // 2.3 Publication has not been rated by the user
                let secondErrorCallback = function (jqXHR, status) {
                    loadButton.hide();
                    voteSuccessButton.hide();
                    ratingSubCaption.hide();
                    buttonsCaption.show();
                    ratingCaption.show();
                    ratingSlider.slider({});
                    ratingText.text("50");
                    ratingText.prop("class", "mt-3");
                    voteButton.show();
                    configureButton.show();
                    // voteDeleteButton.hide();
                };
                // 2.1 Does the publication has been rated by the logged user?
                let secondPromise = emptyAjax("GET", `http://localhost:3000/publications/${data["id"]}/is_rated.json`, "application/json; charset=utf-8", "json", true, secondSuccessCallback, secondErrorCallback);
            };
            // 1.3 Publication was never rated, so it does not exists on the database
            let errorCallback = function (jqXHR, status) {
                loadButton.hide();
                voteSuccessButton.hide();
                configureButton.show();
                voteButton.show();
                ratingCaption.show();
                ratingSubCaption.hide();
                ratingSlider.slider({});
                ratingText.text("50");
                ratingText.prop("class", "mt-3");
                publicationScoreSMValue.text("...");
                publicationScoreTRValue.text("...");
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

fetchToken().then(function (authToken) {
    if (authToken != null) {
        voteButton.on("click", function () {
            chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
                voteButton.find(reloadIcons).toggle();
                let score = ratingSlider.val();
                let data = {
                    rating: {
                        score: score,
                        pdf_url: tabs[0].url,
                        anonymous: anonymizeCheckbox.is(':checked')
                    }
                };
                // 1.2 Rating created successfully
                let successCallback = function (data, status, jqXHR) {
                    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
                        let secondData = {
                            publication: {
                                pdf_url: tabs[0].url
                            }
                        };
                        let secondSuccessCallback = function (data, status, jqXHR) {
                            voteButton.find(reloadIcons).toggle();
                            voteButton.hide();
                            configureButton.hide();
                            buttonsCaption.hide();
                            downloadButton.hide();
                            saveButton.hide();
                            refreshButton.hide();
                            ratingCaption.hide();
                            ratingSlider.slider('destroy');
                            ratingSlider.hide();
                            ratingText.removeClass("mt-3");
                            ratingSubCaption.show();
                            voteSuccessButton.show();
                            voteSuccessButton.prop("disabled", true);
                            publicationScoreSMValue.text((data["score_sm"] * 100).toFixed(2));
                            publicationScoreTRValue.text((data["score_tr"] * 100).toFixed(2));
                            // voteDeleteButton.show();
                        };
                        let secondErrorCallback = function (jqXHR, status) {
                            voteButton.find(reloadIcons).toggle();
                            voteButton.hide();
                            configureButton.hide();
                            voteSuccessButton.show();
                            voteSuccessButton.prop("disabled", true);
                            publicationScoreSMValue.text("...");
                            publicationScoreTRValue.text("...");
                        };
                        let secondPromise = ajax("POST", "http://localhost:3000/publications/lookup.json", "application/json; charset=utf-8", "json", true, secondData, secondSuccessCallback, secondErrorCallback);
                    });
                    let thirdSuccessCallback = function (data, status, jqXHR) {
                        userScoreSMValue.text((data["score"] * 100).toFixed(2));
                        userScoreTRValue.text((data["bonus"] * 100).toFixed(2));
                    };
                    let thirdErrorCallback = function (jqXHR, status) {
                        userScoreSMValue.text("...");
                        userScoreTRValue.text("...");
                    };
                    let promise = emptyAjax("POST", "http://localhost:3000/users/info.json", "application/json; charset=utf-8", "json", true, thirdSuccessCallback, thirdErrorCallback);
                };
                // 1.3 Error during rating creation
                let errorCallback = function (jqXHR, status) {
                    voteButton.hide();
                    configureButton.hide();
                    let errorButton = voteButton.parent().find(errorButtons);
                    errorButton.show();
                    errorButton.prop("disabled", true)
                };
                // 1.1 Create a new rating with the selected score
                let promise = ajax("POST", "http://localhost:3000/ratings.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
            });
        });
    }
});

////////// RATING CONFIGURATION HANDLING //////////

configureSaveButton.on("click", function () {
    modalConfigure.modal("hide");
});

/////////// RATING DELETE HANDLING ///////////

modalDeleteButton.on("click", function () {
    modalDelete.modal("hide");
    // voteDeleteButton.find(reloadIcons).toggle();
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
                            // voteDeleteButton.hide();
                            // voteDeleteButton.find(reloadIcons).toggle();
                            voteSuccessButton.hide();
                            voteButton.show();
                            configureButton.show();
                        };
                        // 3.3 The rating given by the user could not be deleted
                        let thirdErrorCallback = function (jqXHR, status) {
                            // voteDeleteButton.hide();
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
                        // voteDeleteButton.hide();
                        // voteDeleteButton.find(reloadIcons).toggle();
                        voteButton.show();
                        configureButton.show();
                    };
                    // 2.1 Does the publication has been rated by the logged user?
                    let secondPromise = emptyAjax("GET", `http://localhost:3000/publications/${data["id"]}/is_rated.json`, "application/json; charset=utf-8", "json", true, secondSuccessCallback, secondErrorCallback);
                };
                // 1.3 Publication was never rated, so it does not exists on the database
                let errorCallback = function (jqXHR, status) {
                    loadButton.hide();
                    voteSuccessButton.hide();
                    // voteDeleteButton.hide();
                    // voteDeleteButton.find(reloadIcons).toggle();
                    voteButton.show();
                    configureButton.show();
                };
                // 1.1 Does the publication exists on the database?
                let promise = ajax("POST", "http://localhost:3000/publications/lookup.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
            });
        }
    });
});

/////////// SAVE FOR LATER HANDLING //////////

fetchToken().then(function (authToken) {
    if (authToken != null) {
        saveButton.on("click", function () {
            chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
                let data = {
                    publication: {
                        pdf_url: tabs[0].url
                    }
                };
                saveButton.find(reloadIcons).toggle();
                let successCallback = function (data, status, jqXHR) {
                    localStorage.setItem("downloadUrl", data["pdf_download_url_link"]);
                    saveButton.find(reloadIcons).toggle();
                    saveButton.hide();
                    //if(voteDeleteButton.is(":visible")) {
                    //    downloadButton.before("<br/>");
                    //}
                    downloadButton.show();
                    downloadButton.attr("href", data["pdf_download_url_link"]);
                    refreshButton.show();
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
    }
});

/////////// REFRESH HANDLING //////////

modalRefreshButton.on("click", function () {
    localStorage.removeItem("downloadUrl");
    modalRefresh.modal("hide");
    downloadButton.removeAttr("href");
    downloadButton.hide();
    refreshButton.hide();
    saveButton.show();
});