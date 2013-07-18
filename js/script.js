// Global gitEventCount is needed due to multiple commits coming through on
// the same push event.
var gitEventCount = 0;

$(document).ready(function() {
    // Allows for non-JS browsers to show all content
    $('.contentBody section').hide();

    // History State Change
    var path = window.location.pathname.split('/').pop();
    path = path || window.location.hash.replace('#!', '');
    if (path !== '') {
        // Page is being loaded directly from URL with section already selected
        document.title = 'Kevin Marsh - Web Developer - ' + path.charAt(0).toUpperCase() + path.slice(1);
        $('nav, li.' + path).addClass('selected');
        $('.contentBody .' + path).fadeIn();
    }
    if (typeof window.history.pushState === 'function') {
        window.onpopstate = onUrlChange;
    } else {
        // TODO: This hash change is triggering loading the content twice,
        //       first when user clicks on the icon and then when the hash changes
        //       Maybe need to add a global hist detector
        window.onhashchange = onUrlChange;
    }

    // Click Navigation
    $('nav li').click(function() {
        var clicked = $(this).attr("class");
        if (!isInitialized()) {
            // If this is the first time clicked
            updateHistory(clicked);
            $(this, 'nav').addClass('selected');
            $('.contentBody .' + clicked).fadeIn();
        } else if (!$(this).hasClass('selected')) {
            // If not already selected
            selectDiv(clicked, 0);
        }
    });
    // Keypress Navigation
    $(document).keydown(function (e) {
        // TODO: Add swipe functionality on smart phones
        if (!isInitialized()) {
            $('nav').addClass('selected');
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

    // Spans that act as internal links
    // TODO: just change these to anchors once .htaccess is updated
    $('.contentBody section span.link').click(function() {
        var link = $(this).attr('class').split(' ')[1];
        selectDiv(link, 0);
    });

    // Links to the Icon popup
    // TODO: just change this to anchors once .htaccess is updated
    $('span.icon span').click(function () {
        updateHistory('icons');
        $('nav li.selected').removeClass('selected');
        $('nav .contact').addClass('selected');
        $('.contentBody section').fadeOut().delay(400);
        $('.contentBody .icons').fadeIn();
    });

    $('#gitFeed button').click(function() {
        loadGitFeed();
    });
    $('#allGit').click(function() {
        window.open('https://github.com/kevinmarsh?tab=activity');
    });

    loadGitFeed();
    $('#gitFeed li[url]').live('click', function() {
        // Changes the url from API to public facing
        window.open($(this).attr('url').replace('api.github.com/repos', 'github.com').replace('commits', 'commit'));
    });
});

function isInitialized() {
    // Returns true if a content section is loaded
    return $('nav').hasClass('selected');
}
function resetPage() {
    $('nav, nav li').removeClass('selected');
    $('.contentBody section').fadeOut().delay(400);
    document.title = 'Kevin Marsh - Web Developer';
}

function onUrlChange() {
    var path = window.location.pathname.split('/').pop();
    path = path || window.location.hash.replace('#!', '');
    if (path) {
        document.title = 'Kevin Marsh - Web Developer - ' + path.charAt(0).toUpperCase() + path.slice(1);
        $('nav li.selected').removeClass('selected');
        $('nav .' + path).addClass('selected');
        $('.contentBody section').fadeOut().delay(400);
        $('.contentBody .' + path).fadeIn();
        if (!isInitialized()) {
            $('nav').addClass('selected');
        }
    } else {
        resetPage();
    }
}

function updateHistory(path) {
    // Updates the page title, adds the page to history and changes url
    document.title = 'Kevin Marsh - Web Developer - ' + path.charAt(0).toUpperCase() + path.slice(1);
    if (typeof window.history.pushState === 'function') {
        window.history.pushState(null, path, path);
    } else {
        window.location.hash = '#!' + path;
    }
}

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
    updateHistory(next);
    $('nav li.selected').removeClass('selected');
    $('nav .' + next).addClass('selected');
    $('.contentBody section').fadeOut().delay(400);
    $('.contentBody .' + next).fadeIn();
}
function loadGitFeed() {
    $.ajax({
        dataType: 'jsonp',
        url: 'https://api.github.com/users/kevinmarsh/events',
        success: function(data) {
            printGitEvents(data.data);
        },
        error: function() {
            $('#gitFeed').hide();
        }
    });
}

function printGitEvents(data) {
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
            var dateTime = new Date(data[gitEventCount].created_at);
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
