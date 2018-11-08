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

export async function buildErrors(errors) {
    let parsedErrors = JSON.parse(errors);
    let element = "";
    Object.keys(parsedErrors).forEach((attribute, index) => {
        element = `<span>${element}${attribute.capitalize()}:</span><ul>`;
        let messages = parsedErrors[attribute];
        Object.values(messages).forEach((message, index) => {
            element = `${element}<li>${message.capitalize()}</li>`;
        });
        element = `${element}</ul>`;
    });
    return element;
}