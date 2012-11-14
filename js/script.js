$(document).ready( function() {
    $('.contentBody div').hide();
    $('.contentTitles div').click( function() {
        var $contentTitles = $(this).parent()
        var clicked = $(this).attr("class");
        if (!$contentTitles.hasClass('selected')) { // If this is the first time clicked
            $contentTitles.addClass('selected');
            $('footer').slideDown();
            $(this).addClass('selected');
            $('.contentBody .' + clicked).fadeIn();
        }
        else if (!$(this).hasClass('selected')){ // If not already selected
            selectDiv(clicked, 0);
        }
    });
    $(document).keydown(function (e) {
        var $contentTitles = $('.contentTitles')
        if (!$contentTitles.hasClass('selected')) {
            $contentTitles.addClass('selected');
            $('footer').slideDown();
            selectDiv('about', 0);
        } else {
            var selected = $('.contentTitles .selected').attr("class").split(' ')[0];
            var keyCode = e.keyCode || e.which;
            if (keyCode == 39) { // right
                selectDiv(selected, 1);
            } else if (keyCode == 37) { //left
                selectDiv(selected, -1);
            }
        }
    });
    $('.contentBody div span.link').click(function (){
        var link = $(this).attr('class').split(' ')[1]
        selectDiv(link, 0);
    });
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
        $('.contentTitles div.selected').removeClass('selected');
        $('.contentTitles .' + next).addClass('selected');
        $('.contentBody div').fadeOut().delay(400);
        $('.contentBody .' + next).fadeIn();
    }
})
