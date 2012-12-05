$(document).ready( function() {
    $('.contentBody section').hide();
    $('nav li').click( function() {
        var $nav = $('nav')
        var clicked = $(this).attr("class");
        if (!$nav.hasClass('selected')) { // If this is the first time clicked
            $nav.addClass('selected');
            $('footer').slideDown();
            $(this).addClass('selected');
            $('.contentBody .' + clicked).fadeIn();
        }
        else if (!$(this).hasClass('selected')){ // If not already selected
            selectDiv(clicked, 0);
        }
    });
    $(document).keydown(function (e) {
        var $nav = $('nav')
        if (!$nav.hasClass('selected')) {
            $nav.addClass('selected');
            $('footer').slideDown();
            selectDiv('about', 0);
        } else {
            var selected = $('nav .selected').attr("class").split(' ')[0];
            var keyCode = e.keyCode || e.which;
            if (keyCode == 39) { // right
                selectDiv(selected, 1);
            } else if (keyCode == 37) { //left
                selectDiv(selected, -1);
            }
        }
    });
    $('.contentBody section span.link').click(function (){
        var link = $(this).attr('class').split(' ')[1]
        selectDiv(link, 0);
    });
    $('span.icon span').click(function () {
        $('nav li.selected').removeClass('selected');
        $('.contentBody section').fadeOut().delay(400);
        $('nav .contact').addClass('selected');
        $('.contentBody .iconAttributes').fadeIn();
    })
    function selectDiv(clicked, dir) {
        var next;
        if (clicked == 'about' && dir == -1) {
            next = 'contact';
        } else if (clicked == 'contact' && dir == 1) {
            next = 'about';
        } else {
            var divs = ['about', 'code', 'projects', 'contact'];
            next = divs[$.inArray(clicked, divs) + dir]
        };
        $('nav li.selected').removeClass('selected');
        $('nav .' + next).addClass('selected');
        $('.contentBody section').fadeOut().delay(400);
        $('.contentBody .' + next).fadeIn();
    }
})
