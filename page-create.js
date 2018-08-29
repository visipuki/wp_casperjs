var casper = require('casper').create({
    verbose: true,
    logLevel: 'debug',
    viewportSize: {width: 800, height: 600}
}),
	utils = require('utils'),
    common = require('common'),
	config = require('config'),
	gen_text = require('gen_text');
/*
// This code makes a screenshot after each step - useful for debugging
var step_index = 10;
casper.on('step.complete', function(stepResult) {
    casper.capture('screenshots/post-quick-edit/'+step_index+'.png');
    step_index ++;
});
*/

// global variables
var host = config.setUrl();
var numOfPages = 0;


// randomly fills select
function fillSelect(casper, selector) {
// return number of options for provided select tag
// this is used to prevent counting invisible tags: 
// 		document.querySelectorAll(selector)[0]
	var len = casper.evaluate(function (selector) {
		return document.querySelectorAll(selector)[0].
			querySelectorAll('option').length;
	}, selector);
// choose random option with equal probability
	var idx = common.getRandomInt(0, len);
// match this option
	casper.evaluate(function (i, selector) {
		document.querySelectorAll(selector)[0].selectedIndex = i;
	}, idx, selector);	
}

function countPages() {
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

function showPages(casper, num) {
	if (num >= 1) {
		var pages = common.querySelectorAllinnerHTML.call(casper,
			'form#posts-filter tbody#the-list tr a.row-title');	
		casper.echo(utils.format('Pages:\n - %s', pages.join('\n - ')));
	} else {
		casper.echo("No pages.");
	}	
}

function createPages(casper) {
// edit Title/text column
	var name = common.getRandomWord();
	var text = gen_text.getRandomText(0,150,500);
	casper.fill('form#post', {
		'post_title': name,
		'content': text
	}, false);

// edit Publish group

// edit Featured Image group

// edit Page attributes
	fillSelect(casper, 'select#parent_id');
	fillSelect(casper, 'select#page_template');
	var order = common.getRandomInt(0, numOfPages+1);
	casper.fill('form#post', {'menu_order': order}, false);

// apply changings	
	casper.thenClick('input#publish', function () {
		this.waitForSelector('div#message');
	});	
	casper.then(function () {
		this.clickLabel('All Pages', 'a');
	});	

}

casper.start(host, function() {
	common.checkLoggedIn.call(this);
});

// go to wp-admin
casper.thenClick('li#wp-admin-bar-site-name > a');

casper.then(function () {
	this.clickLabel('All Pages', 'a');
});

casper.then(function () {
	numOfPages = this.evaluate(countPages);
	showPages(this,numOfPages);	
});

casper.thenClick('a.add-new-h2');

casper.then(function () {
	createPages(this, numOfPages);
});

casper.then(function () {
	numOfPages = this.evaluate(countPages);
	showPages(this,numOfPages);
});

casper.run();
