export async function fetchToken() {
    return Cookies.get('authToken');
}

export async function deleteToken() {
    Cookies.remove('authToken');
}

export async function send(type, url, contentType, dataType, crossDomain, data, success, error) {
    fetchToken().then(function(authToken) {
        $.ajax({
            type: type,
            url: url,
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

