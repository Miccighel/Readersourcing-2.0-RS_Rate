////////// INIT  //////////

//######## IMPORTS ########//

import {deleteToken} from "./shared.js";
import {ajax} from "./shared.js";
import {emptyAjax} from "./shared.js";
import {removePreloader} from "./shared.js";
import {buildErrors} from "./shared.js";
import {fetchToken} from "./shared.js";
import {buildUrl} from "./shared.js";

let body = $("body");

//######## SECTIONS ########//

let ratingSection = $("#rating-sect");
let ratingControls = $(".rating-controls");
let undetectedPublicationSection = $("#undetected-publication-sect");
let undetectedPublicationDetails = $(".undetected-publication-details");
let errorsSection = $(".errors-sect");
let loadingSection = $("#loading-sect");

//######## MODALS ########//

let modalConfigure = $("#modal-configuration");
let modalRefresh = $("#modal-refresh");
let modalAllow = $("#modal-allow");

//######## UI COMPONENTS ########//

let logoutButton = $("#logout-btn");
let optionsButton = $("#options-btn");

let loadRateButton = $("#load-rate-btn");
let doRateButton = $("#do-rate-btn");
let doRateSuccessButton = $("#do-rate-success-btn");
let editRateButton = $("#edit-rate-btn");
let updateRateButton = $("#update-rate-btn");
let configureButton = $("#configure-btn");
let configureSaveButton = $("#configuration-save-btn");
let loadSaveButton = $("#load-save-btn");
let downloadButton = $("#download-btn");
let openButton = $("#open-btn");
let refreshButton = $("#refresh-btn");
let reloadButton = $("#reload-btn");
let ratingButtons = $(".rating-button");
let goToRatingButton = $("#go-to-rating-btn");
let modalRefreshButton = $("#modal-refresh-btn");
let modalAllowButton = $("#modal-allow-btn");
let errorButtons = $(".error-btn");

let alert = $(".alert");

let annotatedPublicationDropzone = $("#annotated-publication-dropzone");
let annotatedPublicationDropzoneSuccess = $("#dropzone-success");
let annotatedPublicationDropzoneError = $("#dropzone-error");
let sourcePublicationDropzone = $("#source-publication-dropzone");
let sourceUploadSection = $("#source-upload-section");
let sourceUploadSuccess = $("#source-upload-success");
let sourceUploadError = $("#source-upload-error");
let showSourceUploadButton = $("#show-source-upload-btn");
let preparationStatus = $("#publication-preparation-status");
let preparationTitle = $("#publication-preparation-title");
let preparationMessage = $("#publication-preparation-message");
let currentPublicationUrl = null;

let ratingCaptionFirst = $("#rating-caption-first");
let ratingCaptionSecond = $("#rating-caption-second");
let ratingSlider = $("#rating-slider");

let ratingText = $("#rating-text");

let anonymizeCheckbox = $("#anonymize-check");

let saveForLaterSection = $("#save-for-later-section");

let saveForLaterCaptionFirst = $("#save-for-later-caption-first");
let saveForLaterCaptionSecond = $("#save-for-later-caption-second");

let extractCaptionFirst = $("#extract-caption-first");
let extractCaptionSecond = $("#extract-caption-second");

let firstNameValue = $("#first-name-val");
let lastNameValue = $("#last-name-val");
let emailValue = $("#email-val");
let orcidValue = $("#orcid-val");
let subscribeValue = $("#subscribe-val");
let userScoreRSMValue = $("#user-score-rsm-val");
let userScoreTRMValue = $("#user-score-trm-val");

let signOutIcon = $("#sign-out-icon");
let reloadIcons = $(".reload-icon");
let goToRatingIcon = $("#go-to-rating-icon");

//######## UI INITIAL SETUP ########//

loadingSection.hide();
undetectedPublicationSection.hide();

ratingCaptionSecond.hide();
ratingText.hide();
ratingControls.hide();
doRateSuccessButton.hide();
editRateButton.hide();
updateRateButton.hide();
loadRateButton.hide();
doRateButton.prop("disabled", true);
configureButton.prop("disabled", true);

refreshButton.hide();
loadSaveButton.hide();
openButton.hide();
downloadButton.prop("disabled", true);
saveForLaterCaptionSecond.hide();

extractCaptionSecond.hide();
annotatedPublicationDropzoneSuccess.hide();
annotatedPublicationDropzoneError.hide();
goToRatingButton.hide();
sourceUploadSection.hide();
sourceUploadSuccess.hide();
sourceUploadError.hide();

errorButtons.hide();
errorsSection.hide();

Dropzone.autoDiscover = false;

const preparationStates = {
    checking: ["Checking the current page", "Readersourcing is identifying the publication.", "info"],
    ready: ["Ready to prepare", "The PDF will be downloaded, opened, annotated, and verified when you continue.", "info"],
    preparing: ["Preparing the PDF", "The server is validating the source, adding the rating page, and verifying the result.", "info"],
    complete: ["PDF ready", "The prepared publication passed the final verification and is ready to open.", "success"],
    authentication_required: ["Browser access required", "The publication server requires your browser session. Upload the original PDF to continue.", "warning"],
    download_failed: ["Publication unavailable", "The server could not retrieve the publication. Try again or upload the original PDF.", "warning"],
    upload_missing: ["PDF not selected", "Choose the original PDF before continuing.", "warning"],
    too_large: ["PDF too large", "The publication exceeds the configured size limit.", "danger"],
    not_pdf: ["PDF not found", "The received file is not a PDF. Upload the original PDF if it is open in your browser.", "warning"],
    malformed_pdf: ["Invalid PDF", "The file contains a malformed PDF and cannot be prepared.", "danger"],
    encrypted_pdf: ["Encrypted PDF", "The PDF is encrypted and cannot be prepared.", "danger"],
    unsupported_pdf: ["Unsupported PDF", "This PDF uses a feature that the server cannot process safely.", "danger"],
    already_annotated: ["PDF already prepared", "This publication already contains a Readersourcing rating URL.", "warning"],
    annotation_failed: ["Rating page not added", "The PDF is valid, but the rating page could not be added. Please try again.", "danger"],
    verification_failed: ["Verification failed", "The prepared PDF was not published because it did not pass the final verification.", "danger"],
    invalid_url: ["Unsupported page address", "Open the publication from a complete HTTP or HTTPS address, then try again.", "danger"],
    unsafe_url: ["Publication URL refused", "The URL points to a private or reserved network and cannot be retrieved.", "danger"],
    failed: ["Preparation failed", "The publication could not be prepared. Please try again.", "danger"]
};

const uploadStates = ["authentication_required", "download_failed", "not_pdf"];

function showPreparationStatus(state, message) {
    let details = preparationStates[state] || preparationStates.failed;
    preparationStatus.removeClass("alert-info alert-success alert-warning alert-danger");
    preparationStatus.addClass(`alert-${details[2]}`);
    preparationStatus.attr("data-state", state);
    preparationTitle.text(details[0]);
    preparationMessage.text(message || details[1]);
    preparationStatus.show();
    if (uploadStates.includes(state)) sourceUploadSection.show();
}

function preparationResponse(jqXHR) {
    if (jqXHR.responseJSON) return jqXHR.responseJSON;
    try {
        return JSON.parse(jqXHR.responseText || "{}");
    } catch (error) {
        return {};
    }
}

function showPreparationError(jqXHR) {
    let response = preparationResponse(jqXHR);
    showPreparationStatus(response["status"] || "failed", response["message"]);
    downloadButton.find('span').text("Try again");
    downloadButton.prop("disabled", false);
    downloadButton.show();
}

function showPreparedPublication(data, openPublication) {
    saveForLaterCaptionFirst.hide();
    saveForLaterCaptionSecond.show();
    downloadButton.find(reloadIcons).hide();
    downloadButton.hide();
    openButton.show();
    openButton.attr("href", data["pdf_download_url_link"]);
    openButton.off("click.preparation").on("click.preparation", () => window.open(data["pdf_download_url_link"], '_blank'));
    openButton.prop("disabled", false);
    refreshButton.show();
    refreshButton.prop("disabled", false);
    sourceUploadSuccess.text("The PDF was prepared and verified successfully.").show();
    sourceUploadError.hide();
    showPreparationStatus("complete");
    if (openPublication) {
        let pdfWindow = window.open(data["pdf_download_url_link"], '_blank');
        if (pdfWindow) pdfWindow.focus(); else modalAllow.modal('show');
    }
}

reloadIcons.hide();

//#######  USER PROFILE SETUP #########//

let authToken = fetchToken();
if (authToken != null) {
    let successCallback = (data, status, jqXHR) => {
        firstNameValue.text(data["first_name"]);
        lastNameValue.text(data["last_name"]);
        emailValue.text(data["email"]);
        orcidValue.text(data["orcid"]);
        (data["subscribe"]) ? subscribeValue.text("Yes") : subscribeValue.text("No");
        userScoreRSMValue.text((data["score"] * 100).toFixed(2));
        userScoreTRMValue.text((data["bonus"] * 100).toFixed(2));
    };
    let errorCallback = (jqXHR, status) => {
        firstNameValue.text("...");
        firstNameValue.text("...");
        lastNameValue.text("...");
        emailValue.text("...");
        orcidValue.text("...");
        subscribeValue.text("...");
        userScoreRSMValue.text("...");
        userScoreTRMValue.text("...");
    };
    let promise = emptyAjax("POST", "users/info.json", "application/json; charset=utf-8", "json", true, successCallback, errorCallback);
}

//#######  PUBLICATION STATUS SETUP #########//

if (authToken != null) {
    chrome.tabs.query({currentWindow: true, active: true}, tabs => {
        loadingSection.show();
        showPreparationStatus("checking");
        // RATING SECTION
        ratingSection.hide();
        ratingControls.hide();
        ratingText.hide();
        ratingButtons.prop("disabled", true);
        // SAVE FOR LATER SECTION
        saveForLaterCaptionFirst.show();
        saveForLaterCaptionSecond.hide();
        downloadButton.find('span').text("Download");
        downloadButton.show();
        openButton.hide();
        refreshButton.hide();
        let currentUrl = tabs[0].url;
        currentPublicationUrl = currentUrl;
        let data = {
            publication: {
                pdf_url: currentUrl
            }
        };
        // data ---> secondData because of visibility clash with "lookup" call.
        let successCallback = (secondData, status, jqXHR) => {
            // 1.2 Publication exists, so it may be rated by the user
            let successCallback = (data, status, jqXHR) => {
                // 2.2 Publication has been rated by the user, so it is not necessary to check if it has been annotated
                let secondSuccessCallback = (data, status, jqXHR) => {
                    // RATING SECTION
                    loadingSection.hide();
                    loadRateButton.hide();
                    ratingSection.show();
                    doRateButton.hide();
                    configureButton.hide();
                    ratingControls.show();
                    doRateSuccessButton.show();
                    doRateSuccessButton.prop("disabled", true);
                    editRateButton.show();
                    editRateButton.prop("disabled", false);
                    updateRateButton.data('id', data["id"]);
                    updateRateButton.hide();
                    ratingText.parent().removeClass("mt-3");
                    ratingText.show();
                    ratingCaptionSecond.show();
                    ratingCaptionFirst.hide();
                    ratingSlider.hide();
                    ratingText.text(data["score"]);
                    // SAVE FOR LATER SECTION
                    saveForLaterSection.show();
                    downloadButton.show();
                    showPreparationStatus("ready");
                    removePreloader();
                };
                // 2.3 Publication has not been rated by the user
                let secondErrorCallback = (jqXHR, status) => {
                    // RATING SECTION
                    loadingSection.hide();
                    loadRateButton.hide();
                    doRateSuccessButton.hide();
                    editRateButton.hide();
                    updateRateButton.hide();
                    doRateButton.show();
                    doRateButton.prop("disabled", false);
                    configureButton.show();
                    configureButton.prop("disabled", false);
                    ratingSection.show();
                    ratingCaptionFirst.show();
                    ratingCaptionSecond.hide();
                    ratingControls.show();
                    ratingText.show();
                    ratingText.text("50");
                    ratingSlider.slider({});
                    ratingSlider.on("slide", slideEvt => ratingText.text(slideEvt.value));
                    // 3.1 The rated publication was also annotated
                    let thirdSuccessCallback = (data, status, jqXHR) => {
                        // SAVE FOR LATER SECTION
                        saveForLaterSection.show();
                        loadSaveButton.hide();
                        downloadButton.hide();
                        saveForLaterCaptionFirst.hide();
                        saveForLaterCaptionSecond.show();
                        openButton.show();
                        openButton.attr("href", data["pdf_download_url_link"]);
                        openButton.on("click", () => window.open(data["pdf_download_url_link"], '_blank'));
                        openButton.prop("disabled", false);
                        refreshButton.show();
                        refreshButton.prop("disabled", false);
                        showPreparationStatus("complete");
                        removePreloader();
                    };
                    // 3.2 The rated publication was not annotated
                    let thirdErrorCallback = (jqXHR, status) => {
                        // SAVE FOR LATER SECTION
                        saveForLaterSection.show();
                        saveForLaterCaptionFirst.show();
                        saveForLaterCaptionSecond.hide();
                        loadSaveButton.hide();
                        openButton.hide();
                        refreshButton.hide();
                        downloadButton.prop("disabled", false);
                        downloadButton.show();
                        showPreparationStatus("ready");
                        removePreloader();
                    };
                    // 3.1 Does the rated publication has been already annotated?
                    let thirdPromise = emptyAjax("GET", `publications/${data["id"]}/is_saved_for_later.json`, "application/json; charset=utf-8", "json", true, thirdSuccessCallback, thirdErrorCallback);
                };
                // 2.1 Does the publication has been rated by the logged user?
                let secondPromise = emptyAjax("GET", `publications/${data["id"]}/is_rated.json`, "application/json; charset=utf-8", "json", true, secondSuccessCallback, secondErrorCallback);
            };
            // 1.3 Publication was never rated, so it does not exists on the database
            let errorCallback = (jqXHR, status) => {
                // RATING SECTION
                loadingSection.hide();
                loadRateButton.hide();
                doRateSuccessButton.hide();
                editRateButton.hide();
                updateRateButton.hide();
                doRateButton.show();
                doRateButton.prop("disabled", false);
                configureButton.show();
                configureButton.prop("disabled", false);
                ratingSection.show();
                ratingControls.show();
                ratingText.show();
                ratingText.text("50");
                ratingSlider.slider({});
                ratingSlider.on("slide", slideEvt => ratingText.text(slideEvt.value));
                // SAVE FOR LATER SECTION
                saveForLaterCaptionFirst.show();
                saveForLaterCaptionSecond.hide();
                loadSaveButton.hide();
                downloadButton.prop("disabled", false);
                downloadButton.show();
                openButton.hide();
                openButton.prop("disabled", false);
                refreshButton.hide();
                refreshButton.prop("disabled", false);
                showPreparationStatus("ready");
                removePreloader();
            };
            // 1.1 Does the publication exists on the database?
            let promise = ajax("POST", "publications/lookup.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
        };
        showPreparationStatus("ready");
        successCallback({}, "success", null);
    });
}


//########## RELOAD HANDLING #########//

reloadButton.on("click", () => {
    undetectedPublicationSection.hide();
    // RATING SECTION
    ratingSection.show();
    ratingCaptionFirst.show();
    ratingCaptionSecond.hide();
    doRateButton.show();
    configureButton.show();
    // SAVE FOR LATER SECTION
    saveForLaterSection.show();
    saveForLaterCaptionFirst.show();
    saveForLaterCaptionSecond.hide();
    downloadButton.show();
});

//######### SAVE FOR LATER HANDLING #########//

if (authToken != null) {
    downloadButton.on("click", () => {
        chrome.tabs.query({currentWindow: true, active: true}, tabs => {
            let data = {
                publication: {
                    pdf_url: tabs[0].url
                }
            };
            downloadButton.find('span').text("Preparing...");
            downloadButton.find(reloadIcons).show();
            downloadButton.prop("disabled", true);
            showPreparationStatus("preparing");
            // 1.2 Publication fetched, hide save for later button and show the download one
            let successCallback = (data, status, jqXHR) => {
                showPreparedPublication(data, true);
            };
            // 1.3 Preserve the preparation state and offer a safe retry.
            let errorCallback = (jqXHR, status) => {
                saveForLaterCaptionFirst.show();
                saveForLaterCaptionSecond.hide();
                downloadButton.find(reloadIcons).hide();
                showPreparationError(jqXHR);
                let errorPromise = buildErrors(jqXHR.responseText).then(result => {
                    downloadButton.parent().find(errorsSection).find(alert).empty();
                    downloadButton.parent().find(errorsSection).find(alert).append(result);
                    downloadButton.parent().find(errorsSection).show();
                });
            };
            // 1.1 Fetch and annotate the publication
            let promise = ajax("POST", "publications/fetch.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
        });
    });
}

///######### REFRESH HANDLING #########//

modalRefreshButton.click(event => event.preventDefault());

refreshButton.on("click", () => {
    modalRefresh.modal("show");
});

modalRefreshButton.on("click", () => {
    chrome.tabs.query({currentWindow: true, active: true}, tabs => {
        modalRefresh.modal("hide");
        openButton.hide();
        refreshButton.hide();
        loadSaveButton.find('span').text("Preparing...");
        loadSaveButton.show();
        showPreparationStatus("preparing");
        let currentUrl = tabs[0].url;
        let data = {
            publication: {
                pdf_url: currentUrl
            }
        };
        // 1.2 Publication exists, so it is safe to refresh it
        let successCallback = (data, status, jqXHR) => {
            // 2.2 Publication refreshed, so it it safe to show the download button
            let secondSuccessCallback = (data, status, jqXHR) => {
                loadSaveButton.hide();
                showPreparedPublication(data, true);
            };
            // 2.3 Error during publication refresh, it is not safe to show the download button
            let secondErrorCallback = (jqXHR, status) => {
                loadSaveButton.hide();
                showPreparationError(jqXHR);
                let errorPromise = buildErrors(jqXHR.responseText).then(result => {
                    loadSaveButton.parent().find(errorsSection).find(alert).empty();
                    loadSaveButton.parent().find(errorsSection).find(alert).append(result);
                    loadSaveButton.parent().find(errorsSection).show();
                });
            };
            // 2.1 Refresh the publication
            let secondPromise = emptyAjax("POST", `publications/${data["id"]}/refresh.json`, "application/json; charset=utf-8", "json", true, secondSuccessCallback, secondErrorCallback);
        };
        // 1.3 Publication was never rated, so it does not exists on the database
        let errorCallback = function (jqXHR, status) {
            loadSaveButton.hide();
            showPreparationError(jqXHR);
            let errorPromise = buildErrors(jqXHR.responseText).then(result => {
                loadSaveButton.parent().find(errorsSection).find(alert).empty();
                loadSaveButton.parent().find(errorsSection).find(alert).append(result);
                loadSaveButton.parent().find(errorsSection).show();
            });
        };
        // 1.1 Does the publication exists on the database?
        let promise = ajax("POST", "publications/lookup.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    });
});

showSourceUploadButton.on("click", () => {
    sourceUploadSection.toggle();
    sourceUploadSuccess.hide();
    sourceUploadError.hide();
});

//######### EXTRACT HANDLING #########//

chrome.storage.sync.get(['host'], result => {
    let host = result.host;
    $('.dropzone').each(function () {
        let dropzoneControl = $(this)[0].dropzone;
        if (dropzoneControl) dropzoneControl.destroy();
    });
    Dropzone.options.annotatedPublicationDropzone = {
        url: buildUrl(host, "publications/extract.json"),
        paramName: "file", // The name that will be used to transfer the file
        acceptedFiles: "application/pdf",
        maxFiles: 1,
        headers: {
            "Authorization": authToken
        }
    };
    annotatedPublicationDropzone = new Dropzone("#annotated-publication-dropzone");
    if (authToken != null) {
        annotatedPublicationDropzone.on("sending", (file, xhr, formData) => xhr.setRequestHeader("Authorization", authToken));
        annotatedPublicationDropzone.on("success", (file, data) => {
            extractCaptionFirst.hide();
            extractCaptionSecond.show();
            annotatedPublicationDropzoneSuccess.show();
            annotatedPublicationDropzoneSuccess.text(data["message"]);
            goToRatingButton.show();
            goToRatingButton.prop("href", data["baseUrl"]);
            let ratingPageWindow = window.open(data["baseUrl"], '_blank');
            if (ratingPageWindow) {
                ratingPageWindow.focus();
            } else {
                modalAllow.modal('show');
            }
        });
        annotatedPublicationDropzone.on('error', (file, response, xhr) => {
            if (response.hasOwnProperty('errors')) annotatedPublicationDropzoneError.text(response["errors"][0]); else annotatedPublicationDropzoneError.text(response)
            annotatedPublicationDropzoneError.show();
        });
    }

    Dropzone.options.sourcePublicationDropzone = {
        url: buildUrl(host, "publications/fetch_upload.json"),
        paramName: "file",
        acceptedFiles: "application/pdf",
        maxFiles: 1,
        headers: {
            "Authorization": authToken
        }
    };
    sourcePublicationDropzone = new Dropzone("#source-publication-dropzone");
    if (authToken != null) {
        sourcePublicationDropzone.on("sending", (file, xhr, formData) => {
            xhr.setRequestHeader("Authorization", authToken);
            formData.append("publication[pdf_url]", currentPublicationUrl);
            showPreparationStatus("preparing");
            sourceUploadSuccess.hide();
            sourceUploadError.hide();
        });
        sourcePublicationDropzone.on("success", (file, data) => {
            showPreparedPublication(data, true);
        });
        sourcePublicationDropzone.on("error", (file, response, xhr) => {
            let details = typeof response === "object" ? response : preparationResponse(xhr || {});
            showPreparationStatus(details["status"] || "failed", details["message"] || response);
            sourceUploadSuccess.hide();
            sourceUploadError.text(details["message"] || response).show();
        });
    }
});

//######### GO TO RATING URL HANDLING #########//

goToRatingButton.on("click", () => {
    goToRatingButton.find(goToRatingIcon).toggle();
    goToRatingButton.find(reloadIcons).toggle();
});

////////// RATING //////////

//#######  ACTION HANDLING #########//

if (authToken != null) {
    doRateButton.on("click", () => {
        chrome.tabs.query({currentWindow: true, active: true}, tabs => {
            let currentUrl = tabs[0].url;
            doRateButton.find(reloadIcons).toggle();
            let score = ratingSlider.val();
            let data = {
                rating: {
                    score: score,
                    pdf_url: currentUrl,
                    anonymous: anonymizeCheckbox.is(':checked')
                }
            };
            // 1.2 Rating created successfully
            let successCallback = (data, status, jqXHR) => {
                let id = data["id"];
                let secondData = {
                    publication: {
                        pdf_url: currentUrl
                    }
                };
                let secondSuccessCallback = (data, status, jqXHR) => {
                    // RATING SECTION
                    doRateButton.find(reloadIcons).toggle();
                    doRateButton.hide();
                    configureButton.hide();
                    ratingCaptionSecond.hide();
                    ratingSlider.slider('destroy');
                    ratingSlider.hide();
                    ratingText.parent().removeClass("mt-3");
                    ratingCaptionSecond.show();
                    doRateSuccessButton.show();
                    doRateSuccessButton.prop("disabled", true);
                    editRateButton.show();
                    editRateButton.prop("disabled", false);
                    updateRateButton.data('id', id);
                    // SAVE FOR LATER SECTION
                    downloadButton.prop("disabled", true);
                    openButton.prop("disabled", true);
                    refreshButton.prop("disabled", true);
                };
                let secondErrorCallback = (jqXHR, status) => {
                    // RATING SECTION
                    doRateButton.find(reloadIcons).toggle();
                    doRateButton.hide();
                    configureButton.hide();
                    doRateSuccessButton.show();
                    doRateSuccessButton.prop("disabled", true);
                };
                let secondPromise = ajax("POST", "publications/lookup.json", "application/json; charset=utf-8", "json", true, secondData, secondSuccessCallback, secondErrorCallback);
            };
            // 1.3 Error during rating creation
            let errorCallback = (jqXHR, status) => {
                doRateButton.hide();
                configureButton.hide();
                let errorButton = doRateButton.parent().find(errorButtons);
                errorButton.show();
                errorButton.prop("disabled", true);
                let errorPromise = buildErrors(jqXHR.responseText).then(result => {
                    doRateButton.parent().find(errorsSection).find(alert).empty();
                    doRateButton.parent().find(errorsSection).find(alert).append(result);
                    doRateButton.parent().find(errorsSection).show();
                });
            };
            // 1.1 Create a new rating with the selected score
            let promise = ajax("POST", "ratings.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
        });
    });
}


//######### EDIT HANDLING #########//

if (authToken != null) {
    editRateButton.on("click", () => {
        ratingSlider.slider({});
        ratingSlider.on("slide", slideEvt => ratingText.text(slideEvt.value));
        doRateSuccessButton.hide();
        editRateButton.prop("disabled", true);
        updateRateButton.find("span").text("Confirm");
        updateRateButton.prop("disabled", false);
        updateRateButton.show();
    });
}

//######### UPDATE HANDLING #########//

if (authToken != null) {
    updateRateButton.on("click", () => {
        updateRateButton.find(reloadIcons).toggle();
        let score = ratingSlider.val();
        let id = updateRateButton.data('id');
        let data = {
            rating: {
                score: score,
            }
        };
        let successCallback = (data, status, jqXHR) => {
            ratingSlider.slider('destroy');
            ratingSlider.hide();
            updateRateButton.find(reloadIcons).toggle();
            updateRateButton.find("span").text("Rating Updated");
            updateRateButton.prop("disabled", true);
            editRateButton.prop("disabled", false);
            editRateButton.show();
        };
        let errorCallback = (jqXHR, status) => {

        };
        let promise = ajax("PUT", `ratings/${id}.json`, "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    });
}

//######### CONFIGURATION HANDLING #########//

configureSaveButton.on("click", () => modalConfigure.modal("hide"));

////////// GENERAL //////////

//####### LOGOUT HANDLING #########//

logoutButton.on("click", () => {
    let successCallback = (data, status, jqXHR) => {
        deleteToken();
        window.location.href = "login.html"
    };
    let errorCallback = (jqXHR, status) => {};
    let thirdPromise = emptyAjax("POST", "logout.json", "application/json; charset=utf-8", "json", true, successCallback, errorCallback);;
});

//######### OPTIONS HANDLING #########//

optionsButton.on("click", () => {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage(); else window.open(chrome.runtime.getURL('options.html'));
});
