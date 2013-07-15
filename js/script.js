// Global gitEventCount is needed due to multiple commits coming through on
// the same push event.
var gitEventCount = 0;

$(document).ready( function() {
    $('.contentBody section').hide();
    $('nav li').click( function() {
        var $nav = $('nav');
        var clicked = $(this).attr("class");
        if (!$nav.hasClass('selected')) {           // If this is the first time clicked
            $nav.addClass('selected');
            $('footer').slideDown();
            $(this).addClass('selected');
            $('.contentBody .' + clicked).fadeIn();
        } else if (!$(this).hasClass('selected')){  // If not already selected
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
            if (keyCode === 39) {            // Right Key
                selectDiv(selected, 1);
            } else if (keyCode === 37) {     // Left Key
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
        if (clicked === 'about' && dir === -1) {
            next = 'contact';
        } else if (clicked === 'contact' && dir === 1) {
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
    loadGitFeed();
    $('#gitFeed li[url]').live('click', function(){
        window.open($(this).attr('url'));
    });
});

function loadGitFeed() {
    $.ajax({
        // dataType: 'jsonp',                   // TODO: Switch back to JSONP when data is live
        dataType: "json",
        // url: 'https://api.github.com/users/kevinmarsh/events',
        // url: 'django-github-events.json',    // TODO: Switch to live data
        url: 'kevinmarsh-github-events.json',   // TODO: Switch to live data
        success: function(data){
            // printGitEvents(data.data);       // TODO: Switch to this when data is JSONP
            printGitEvents(data);
        },
        error: function(e) {
            console.log('Error: Something went wrong.');
            $('#gitFeed').hide();
        }
    });
}

function printGitEvents(data){
    // This takes the JSON data from the AJAX request,
    // formats it and then appends it to the list.
    var $ul = $('#gitFeed ul');
    for (var i = 0, len = data.length; i < len && i < 10; i++, gitEventCount++) {
        var gitType = data[gitEventCount].type;
        if (len < gitEventCount + 10) {
            $('#gitFeed button').toggle();
            $('#allGit').css('display', 'block');
        }
        if (gitType === 'PushEvent') {
            $ul = createPushEvents(data[gitEventCount], $ul);
        } else {
            var $li = $('<li></li>').addClass(gitType).attr('gitid', data[i].id);
            var dateTime = new Date(data[gitEventCount]['created_at']);
            if (gitType === 'PullRequestEvent') {
                $li.attr('url', data[gitEventCount].payload.pull_request.html_url);
            }
            $('<span>').addClass('ghType').text(getGitVerb(gitType)).appendTo($li);
            $('<span>').addClass('ghRepo').text(data[gitEventCount].repo.name).appendTo($li);
            $('<span>').addClass('ghDate').attr('title', dateTime).text(dateTime.toLocaleDateString() + ' - ' + dateTime.toLocaleTimeString()).appendTo($li);
            $li.appendTo($ul);
        }
    }
}

function createPushEvents(payload, $ul) {
    var pushDate = new Date(payload.created_at);
    for (var i = payload.payload.commits.length - 1; i >= 0; i--) {
        // This needs to count down so that multiple pushes appear in the correct order
        var commit = payload.payload.commits[i];
        // TODO: Check that this URL is correct or if 'api' needs to be stripped
        var $li = $('<li></li>').addClass('PushEvent').attr('url', commit.url);
        $('<span>').addClass('ghType').text('Pushed').appendTo($li);
        $('<span>').addClass('ghRepo').text(payload.repo.name).appendTo($li);
        $('<span>').addClass('ghDate').attr('title', pushDate.dateTime).text(pushDate.toLocaleDateString() + ' - ' + pushDate.toLocaleTimeString()).appendTo($li);
        $('<span>').addClass('ghMsg').html('&ldquo;' + commit.message + '&rdquo;').appendTo($li);
        $li.appendTo($ul);
    }
    return $ul;
}

function getGitVerb(event) {
    switch(event) {
        case 'CommitCommentEvent':
        case 'IssueCommentEvent':
        case 'PullRequestReviewCommentEvent':
            return 'Commented';
        case 'CreateEvent':
            return 'Created';
        case 'DeleteEvent':
            return 'Deleted';
        case 'DownloadEvent':
            return 'Downloaded';
        case 'FollowEvent':
            return 'Followed';
        case 'ForkEvent':
        case 'ForkApplyEvent':
            return 'Forked';
        case 'GistEvent':
            return 'Gist';
        case 'GollumEvent':
            return 'Gollum';
        case 'IssuesEvent':
            return 'Issue';
        case 'MemberEvent':
            return 'Member';
        case 'PublicEvent':
            return 'Public';
        case 'PullRequestEvent':
            return 'Pull';
        case 'PushEvent':
            return 'Pushed';
        case 'TeamAddEvent':
            return 'Added';
        case 'WatchEvent':
            return 'Watched';
        default:
            return '';
    }
}
