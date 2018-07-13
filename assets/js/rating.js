let voteSuccessful = $("#voteSuccessful-section");
let ratingSlider = $("#rating-slider");
let voteButton = $("#vote-btn");
let reloadIcon = $("#reload-icon");

voteSuccessful.hide();
reloadIcon.hide();

ratingSlider.slider({});
ratingSlider.on("slide", function(slideEvt) {
    $("#rating-text").text(slideEvt.value);
});

voteButton.on("click", function() {
    $(reloadIcon).toggle();
    jQuery.ajax({
        type: "GET",
        url: "https://jsonplaceholder.typicode.com/posts/1",
        contentType: "application/json; charset=utf-8",
        dataType:"json",
        success: function (data, status, jqXHR) {
            $(reloadIcon).toggle();
            voteButton.text("Voto Registrato!");
            voteButton.prop("disabled", true)
        },
        error: function (jqXHR, status) {
            $(reloadIcon).toggle();
        },
    });
});