////////// NETWORKING SECTION //////////

export function storeToken(authToken) {
    Cookies.set('authToken', authToken);
}

export function fetchToken() {
    return Cookies.get('authToken');
}

export function deleteToken() {
    Cookies.remove('authToken');
}

export async function ajax(type, url, contentType, dataType, crossDomain, data, success, error) {
    let authToken = fetchToken();
    chrome.storage.sync.get(['host'], result => {
        $.ajax({
            type: type,
            url: `${result.host}${url}`,
            contentType: contentType,
            dataType: dataType,
            crossDomain: crossDomain,
            data: JSON.stringify(data),
            success: success,
            error: error,
            headers: {
                "Authorization": authToken
            },
        });
    });
}

export async function emptyAjax(type, url, contentType, dataType, crossDomain, success, error) {
    let authToken = fetchToken();
    chrome.storage.sync.get(['host'], result => {
        $.ajax({
            type: type,
            url: `${result.host}${url}`,
            contentType: contentType,
            dataType: dataType,
            crossDomain: crossDomain,
            success: success,
            error: error,
            headers: {
                "Authorization": authToken
            },
        });
    });
}

////////// UTILITY SECTION //////////

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

export async function buildErrors(errors) {
    try {
        let parsedErrors = JSON.parse(errors);
        let element = "";
        Object.keys(parsedErrors).forEach((attribute, index) => {
            element = `<span class="color-red-dark">${element}${attribute.capitalize()}:</span><ul>`;
            let messages = parsedErrors[attribute];
            Object.values(messages).forEach((message, index) => {
                element = `${element}<li class="color-red-dark">${message}</li>`;
            });
            element = `${element}</ul>`;
        });
        return element;
    } catch (error) {
        let element = "";
        element = `<span class="color-red-dark">This is (probably) a server error (which could be dead now).</span>`;
        return element;
    }
}

export function removePreloader() {
    $('.preloader-wrapper').fadeOut(1500);
    $('body').removeClass('preloader');
    $('.preloader').css('overflow', 'visible');
}