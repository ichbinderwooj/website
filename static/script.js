if ($(window).width() <= 500) {
    $(".head-icon").click(function() {
        $(".navbar ul").slideToggle();
    });
}

$("#token_btn").click(function() {
    $("#token").toggle();
});