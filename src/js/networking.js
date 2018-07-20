export async function send (type, url, contentType, dataType, crossDomain, data, success, error) {
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