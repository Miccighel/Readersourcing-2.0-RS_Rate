////////// NETWORKING SECTION //////////

export async function fetchToken() {
    return Cookies.get('authToken');
}

export async function deleteToken() {
    Cookies.remove('authToken');
}

export async function ajax(type, url, contentType, dataType, crossDomain, data, success, error) {
    fetchToken().then(function (authToken) {
        chrome.storage.sync.get(['host'], function (result) {
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
    fetchToken().then(function (authToken) {
        chrome.storage.sync.get(['host'], function (result) {
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