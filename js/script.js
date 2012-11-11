function select(highlighted) {
    $('.contentTitles div.selected').removeClass('selected');
    $('.contentTitles .' + highlighted).addClass('selected');
    $('.contentBody div').fadeOut().delay(400);
    $('.contentBody .' + highlighted).fadeIn();
}
$(document).ready( function() {
    $('.contentBody div').hide();
    $('.contentTitles div').click( function() {
        var $contentTitles = $(this).parent()
        var section = $(this).attr("class");
        if (!$contentTitles.hasClass('selected')) {
            $contentTitles.addClass('selected');
            $(this).addClass('selected');
            // $('.contentBody').css('border', '2px solid #222');
            $('.contentBody .' + section).fadeIn();
            $(document).keydown(function (e) {
                var selected = $('.contentTitles .selected').attr("class").split(' ')[0];
                var nextSection = {'contact': 'about', 'about': 'code', 'code': 'projects', 'projects': 'contact'};
                var prevSection = {'about': 'contact', 'code': 'about', 'projects': 'code', 'contact': 'projects'};
                var keyCode = e.keyCode || e.which;
                var arrow = {left: 37, up: 38, right: 39, down: 40 };

                if (keyCode == arrow.right || keyCode == arrow.up) {
                    select(nextSection[selected]);
                } else if (keyCode == arrow.left || keyCode == arrow.down) {
                    select(prevSection[selected]);
                }
            });
        }
        else if (!$(this).hasClass('selected')){
            select(section);
        /*
            $('.contentTitles div.selected').removeClass('selected');
            $(this).addClass('selected');
            $('.contentBody div').fadeOut().delay(400);
            $('.contentBody .' + section).fadeIn();
        */
        }
    });
    $('.contentTitles2 div').hover(
        function () {
            console.log($(this).children('p'));
            $(this).children('p').addClass('showText');
        },
        function () {
            console.log($(this).children('p'));
            $(this).children('p').removeClass('showText');
        }
    );
    $('.contentTitles div img').attr('src', 'img/test.png');
})
