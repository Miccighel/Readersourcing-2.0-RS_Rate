////////// INIT  //////////

//######## IMPORTS ########//

import {removePreloader} from "./shared.js";

//######## UI COMPONENTS ########//

let loginButton = $("#login-btn");
let signUpButton = $("#sign-up-btn");
let optionsButton = $("#options-btn");

let signInIcon = $("#sign-in-icon");
let signUpIcon = $("#sign-up-icon");
let reloadIcons = $(".reload-icon");

//######## UI INITIAL SETUP ########//

reloadIcons.hide();

//######### USER ALREADY LOGGED? HANDLING #########//

chrome.storage.sync.get(['authToken'], result => {
    let authToken = result.authToken;
    if (authToken != null) {
        window.location.href = "rating_web.html";
    } else removePreloader()
});

//######### GO TO LOGIN HANDLING #########//

loginButton.on("click", () => {
    loginButton.find(signInIcon).toggle();
    loginButton.find(reloadIcons).toggle();
});

//######### GO TO SIGN UP HANDLING #########//

signUpButton.on("click", () => {
    signUpButton.find(signUpIcon.toggle());
    signUpButton.find(reloadIcons).toggle();
});

////////// GENERAL //////////

//######### OPTIONS HANDLING #########//

optionsButton.on("click", () => {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage(); else window.open(chrome.runtime.getURL('options.html'));
});
