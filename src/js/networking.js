export async function send(type, url, contentType, dataType, crossDomain, data, success, error) {
    $.ajax({
        type: type,
        url: url,
        contentType: contentType,
        dataType: dataType,
        crossDomain: crossDomain,
        data: JSON.stringify(data),
        success: success,
        error: error
    });
}

export async function fetchToken(loginSection, contentSection) {
    if (Cookies.get('authToken') != null) {
        loginSection.hide();
        contentSection.show();
    } else {
        loginSection.show();
        contentSection.hide();
    }
    return Cookies.get('authToken');
}

