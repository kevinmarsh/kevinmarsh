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
    loadGitFeed();
    // $('#gitFeed').hide();
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
    // This takes the JSON data from the AJAX request,
    // formats it and then appends it to the list.
    // TODO: this would make more sense if it was templated
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

    for (var i = 0, len = data.length; i < len && i < 10; i++) {
        var gitAction = {
            type: data[i]['type'],
            repoName: '',
            dateTime: new Date(data[i]['created_at']),
            commitMsg: '',
            url: $.trim(data[i]['url'])
        };
        var $li = $('<li></li>').attr('url', gitAction.url);

        try {
            gitAction.commitMsg = data[i]['payload']['shas'][0][2];
        } catch(e) {
            gitAction.commitMsg = '';
        }
        try {
            gitAction.repoName = data[i]['repository']['name'];
        } catch(e) {
            gitAction.repoName = data[i]['url'].split('/')[4];
        } finally {
            // TODO: add a link to URL to entire LI or jQuery
            $('<span>').addClass('ghType').text(gitActionVerb[gitAction.type]).appendTo($li);
            $('<span>').addClass('ghRepo').text(gitAction.repoName).appendTo($li);
            $('<span>').addClass('ghDate').attr('title', gitAction.dateTime).text(gitAction.dateTime.toLocaleDateString() + ' - ' + gitAction.dateTime.toLocaleTimeString()).appendTo($li);
            $('<span>').addClass('ghMsg').text(gitAction.commitMsg).appendTo($li);
            $li.appendTo($ul);
        }
    }
}
