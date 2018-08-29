var casper = require('casper').create({
    verbose: true,
    logLevel: 'debug',
    viewportSize: {width: 800, height: 600}
}),
	utils = require('utils'),
    common = require('common'),
	config = require('config'),
	gen_text = require('gen_text');


// This code makes a screenshot after each step - useful for debugging
var step_index = 10;
casper.on('step.complete', function(stepResult) {
    casper.capture('screenshots/post-quick-edit/'+step_index+'.png');
    step_index ++;
});


var host = config.setUrl();

function changePage(casper) {
	var total_pages = casper.evaluate(function () {
		return document.querySelector('span.total-pages').innerHTML;
	});
	casper.echo(utils.format('Pages: %d', total_pages));
	var page = common.getRandomInt(0, total_pages) + 1;
	casper.echo(utils.format('Chosen page: %d', page));
	casper.evaluate(function (page) {
		document.querySelectorAll('input.current-page')[0].setAttribute('value', page);
	}, page);
	casper.thenClick('div[class="tablenav top"] input#doaction');
//	casper.waitForSelectorTextChange('html', null, null, 1500);
}

function countComments() {
	var tr_list = document.querySelectorAll('tbody#the-comment-list tr');
	var num = tr_list.length;
	if (num === 0 || num > 1)
		return num;
	if (num === 1) {
		if (tr_list[0].getAttribute('class') === 'no-items') { 
			return 0;
		} else {
			return 1;
		}
	}
}

function showComments(casper, num) {
	if (num >= 1) {
		var posts = common.querySelectorAllinnerHTML.call(casper,
			'form#comments-form tbody#the-comment-list tr td[class="author column-author"] strong');	
		for (var i = 0; i < posts.length; i++)
			posts[i] = posts[i].replace(/<[^>]+>/g, '');
		casper.echo(utils.format('Comments:\n - %s', posts.join('\n - ')));
	} else {
		casper.echo("No comments.");
	}	
}

function deleteComments(casper, numOfComments) {
	if (numOfComments >= 1) {
		var idx = common.getRandomInt(0, numOfComments);
		casper.echo(utils.format('%d(%d)', idx+1, numOfComments));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-comment-list tr')[i].getAttribute('id');
			return 'tr#'+id+' a[class="delete vim-d vim-destructive"]';
		}, idx);
		var sel_wait = link.substr(0, link.indexOf('a[')-1).replace('comment', 'undo');
		casper.thenClick(link)
			.waitForSelectorTextChange(sel_wait, null, function () {}, 6000);
	}
}

casper.start(host, function() {
	common.checkLoggedIn.call(this);
});

// go to wp-admin
casper.thenClick('li#wp-admin-bar-site-name > a');

casper.thenClick('li#menu-comments > a');

casper.then(function () {
	changePage(this);
});

casper.then(function () {
	var numOfComments = this.evaluate(countComments);
	showComments(this,numOfComments);
	deleteComments(this, numOfComments);
});

casper.then(function () {
	var numOfComments = this.evaluate(countComments);
	showComments(this,numOfComments);
});


casper.run();
