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
        } else if (!$(this).hasClass('selected')){ // If not already selected
            selectDiv(clicked, 0);
        }
    });
    $(document).keydown(function (e) {
        // TODO: Add swipe functionality on smart phones
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
    $('#gitFeed button').click(function() {
        loadGitFeed();
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
    $('#gitFeed li').live('click', function(){
        window.open($(this).attr('url'));
    });
});

function loadGitFeed() {
    $.ajax({
        dataType: "jsonp",  // TODO: switch back to JSONP after it's cross browser
        // dataType: "json",
        url: 'https://api.github.com/users/kevinmarsh/events',
        // url: 'https://api.github.com/users/django/events',
        // url: 'kevinmarsh-github-events.json',  // TODO: remove test data
        // url: 'django-github-events.json',  // TODO: remove test data
        // url: 'kevinmarsh-github.json',  // TODO: remove test data
        success: function(data){
            printGitEvents(data.data);
        },
        error: function(e) {
            console.log('error');
        }
    });
}

function printGitEvents(data){
    // This takes the JSON data from the AJAX request,
    // formats it and then appends it to the list.
    var count = 0;
    var gitActionVerbs = {
        PushEvent: 'Pushed',
        CreateEvent: 'Created',
        ForkEvent: 'Forked',
        IssueCommentEvent: 'Commented on',
        GollumEvent: '???',
        MemberEvent: '???'  // TODO: What other events?
    };
    var $ul = $('#gitFeed ul');
    var feedStart = $('#gitFeed ul li').length;
    for (var i = feedStart, len = data.length; i < len && i < feedStart + 10; i++) {
        var gitType = data[i].type;
        if (len < feedStart + 10) {
            $('#gitFeed button').hide();
        }
        if (gitType == 'PushEvent') {
            $ul = createPushEvents(data[i], $ul);
        } else {
            var $li = $('<li></li>').addClass(gitType).attr('url', $.trim(data[i]['url']));
            var dateTime = new Date(data[i]['created_at']);
            $('<span>').addClass('ghType').text(gitActionVerbs[gitType]).appendTo($li);
            $('<span>').addClass('ghRepo').text(data[i].repo.name).appendTo($li);
            $('<span>').addClass('ghDate').attr('title', dateTime).text(dateTime.toLocaleDateString() + ' - ' + dateTime.toLocaleTimeString()).appendTo($li);
            $li.appendTo($ul);
        }
    }
}

function createPushEvents(payload, $ul) {
    var repoName = payload.repo.name;
    var pushDate = new Date(payload.created_at);
    for (var event in payload.payload.commits) {
        var commit = payload.payload.commits[event];
        var $li = $('<li></li>').addClass('PushEvent').attr('url', commit.url);
        $('<span>').addClass('ghType').text('Pushed').appendTo($li);
        $('<span>').addClass('ghRepo').text(repoName).appendTo($li);
        $('<span>').addClass('ghDate').attr('title', pushDate.dateTime).text(pushDate.toLocaleDateString() + ' - ' + pushDate.toLocaleTimeString()).appendTo($li);
        $('<span>').addClass('ghMsg').html('&ldquo;' + commit.message + '&rdquo;').appendTo($li);
        $li.appendTo($ul);
    }
    return $ul;
}
