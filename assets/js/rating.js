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
    let score = ratingSlider.val();
    let data = {rating:{score:score}};
    $(reloadIcon).toggle();
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/ratings.json",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        crossDomain: true,
        data: JSON.stringify(data),
        success: function (data, status, jqXHR) {
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