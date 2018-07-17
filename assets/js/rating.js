let voteSuccessful = $("#voteSuccessful-section");
let ratingSlider = $("#rating-slider");
let voteButton = $("#vote-btn");
let reloadIcon = $("#reload-icon");

voteSuccessful.hide();
reloadIcon.hide();

ratingSlider.slider({});
ratingSlider.on("slide", function (slideEvt) {
    $("#rating-text").text(slideEvt.value);
});

voteButton.on("click", function () {
    $(reloadIcon).toggle();
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/publications.json",
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        success: function (data, status, jqXHR) {
            alert(data);
            $(reloadIcon).toggle();
            voteButton.text("Voto Registrato!");
            voteButton.prop("disabled", true)
        },
        error: function (jqXHR, status) {
            alert(jqXHR.status);
            $(reloadIcon).toggle();
        },
    });
});