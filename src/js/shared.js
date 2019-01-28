////////// NETWORKING SECTION //////////

export async function deleteToken() {
    chrome.storage.sync.remove(['authToken']);
}

export async function ajax(type, url, contentType, dataType, crossDomain, data, success, error) {
    chrome.storage.sync.get(['authToken'], result => {
        let authToken = result.authToken;
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
    });
}

export async function emptyAjax(type, url, contentType, dataType, crossDomain, success, error) {
    chrome.storage.sync.get(['authToken'], result => {
        let authToken = result.authToken;
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
    });
}

////////// UTILITY SECTION //////////

export async function buildErrors(errors) {
    try {
        let parsedErrors = JSON.parse(errors);
        let element = "";
        Object.keys(parsedErrors).forEach((attribute, index) => {
            element = `<span class="color-red-dark">${element}${attribute}:</span><ul>`;
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
    $('.preloader').css('overflow','visible');
}