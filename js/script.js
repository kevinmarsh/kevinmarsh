$(document).ready( function() {
    $('.contentBody section').hide();
    $('nav li').click( function() {
        var $nav = $('nav');
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
        var $nav = $('nav');
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
        var link = $(this).attr('class').split(' ')[1];
        selectDiv(link, 0);
    });
    $('span.icon span').click(function () {
        $('nav li.selected').removeClass('selected');
        $('.contentBody section').fadeOut().delay(400);
        $('nav .contact').addClass('selected');
        $('.contentBody .iconAttributes').fadeIn();
    });
    function selectDiv(clicked, dir) {
        var next;
        if (clicked == 'about' && dir == -1) {
            next = 'contact';
        } else if (clicked == 'contact' && dir == 1) {
            next = 'about';
        } else {
            var divs = ['about', 'code', 'projects', 'contact'];
            next = divs[$.inArray(clicked, divs) + dir];
        }
        $('nav li.selected').removeClass('selected');
        $('nav .' + next).addClass('selected');
        $('.contentBody section').fadeOut().delay(400);
        $('.contentBody .' + next).fadeIn();
    }
    // TODO: test with live data once I've got internet access
    // loadGitFeed();
    $('#gitFeed').hide();
});

function loadGitFeed() {
    $.ajax({
        // dataType: "jsonp",  // TODO: switch back to JSONP after it's cross browser
        dataType: "json",
        // url: 'https://github.com/kevinmarsh.json',
        url: 'kevinmarsh-github.json',  // TODO: remove test data
        success: function(data){
            printOutput(data);
        },
        error: function(e) {
            console.log('error');
        }
    });
}

function printOutput(data){
    var count = 0;
    var gitActionVerb = {
        PushEvent: 'Pushed',
        CreateEvent: 'Created',
        ForkEvent: 'Forked',
        IssueCommentEvent: 'Commented on',
        GollumEvent: '???',
        MemberEvent: '???'  // TODO: What other events?
    };
    var $ul = $('#gitFeed ul');

    // TODO: just replace this with a basic counter
    for (var action in data) {
        var gitAction = {
            type: data[action]['type'],
            repoName: '',
            dateTime: new Date(data[action]['created_at']),
            commitMsg: '',
            url: $.trim(data[action]['url'])
        };
        var $el = $('<li></li>');
        var msg = '';

        if (count++ == 10) {
            break;
        }
        try {
            gitAction.commitMsg = data[action]['payload']['shas'][0][2];
        } catch(e) {
            // Do nothing
        }
        try {
            gitAction.repoName = data[action]['repository']['name'];
        } catch(e) {
            gitAction.repoName = data[action]['url'].split('/')[4];
        } finally {
            msg = [gitActionVerb[gitAction.type], '<strong>', gitAction.repoName, '</strong> at <a href="', gitAction.url, '" title="' + gitAction.dateTime + '">', gitAction.dateTime.toLocaleDateString(), gitAction.dateTime.toLocaleTimeString(), '</a>'];
            if (gitAction.commitMsg) {
                msg.push('<br> "' + gitAction.commitMsg + '"');
            }
            $el.html(msg.join(' ')).appendTo($ul);
        }
    }
}
