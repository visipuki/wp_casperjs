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

//global variables
var host = config.setUrl();
var media_path = config.getMediaPath();
//var file = '/home/novi4ok/basic-scripts/21-06/media/post-quick-edit/12.png';

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

function countMedia() {
	var tr_list = document.querySelectorAll('tbody#the-list tr');
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

function showMedia(casper, num) {
	if (num >= 1) {
		var posts = common.querySelectorAllinnerHTML.call(casper,
			'form#posts-filter tbody#the-list tr td[class="title column-title"] strong a');	
		for (var i = 0; i < posts.length; i++)
			posts[i] = posts[i].replace(/<[^>]+>/g, '');
		casper.echo(utils.format('Comments:\n - %s', posts.join('\n - ')));
	} else {
		casper.echo("No comments.");
	}	
}

function editMedia(casper, numOfMedias) {
	if (numOfMedias >= 1) {
		var idx = common.getRandomInt(0, numOfMedias);
		casper.echo(utils.format('%d(%d)', idx+1, numOfMedias));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-list tr')[i].getAttribute('id');
			return 'tr#'+id+' span.edit a';
		}, idx);
		
		casper.echo(link);

		casper.thenClick(link, function () {
			var post_title = gen_text.getRandomText(0, 25, 90),
				caption = gen_text.getRandomText(0, 25, 90),
				alternative_text = gen_text.getRandomText(0, 25, 90),
				description = gen_text.getRandomText(0, 70, 200);
			this.fill('form#post', {
				'post_title': post_title,
				'excerpt': caption,
				'_wp_attachment_image_alt': alternative_text,
				'content': description
			}, false);

			this.click('input#publish');
		});
	}	
}

casper.start(host, function () {
	common.checkLoggedIn.call(this);
});

// go to wp-admin
casper.thenClick('li#wp-admin-bar-site-name > a');

// go to media (library)
casper.thenClick('li#menu-media a.wp-first-item');

casper.then(function () {
	changePage(this);
});

casper.then(function () {
	var numOfMedias = this.evaluate(countMedia);
	showMedia(this, numOfMedias);
	editMedia(this, numOfMedias);
});

casper.run();