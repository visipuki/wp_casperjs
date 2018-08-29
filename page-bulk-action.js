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

//global variables
var host = config.setUrl();
var allTags = [];

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

function editPages(casper, numOfPages, allTags) {
// fill all select-option tags
	fillSelect(casper, 'form#posts-filter select.authors');
	fillSelect(casper, 'form#posts-filter select#post_parent');
	fillSelect(casper, 'form#posts-filter select[name="page_template"]');
	fillSelect(casper, 'form#posts-filter select[name="comment_status"]');
	fillSelect(casper, 'form#posts-filter select[name="_status"]');

// apply changings	
	casper.thenClick('input#bulk_edit');
// if ajax-response changes DOM this works			
	casper.waitForSelector('div#message', null, null, 1500);
}

function bulkActionPages(casper, numOfPages) {
	casper.echo('Bulk actions on pages...');
	if (numOfPages >= 1) {
// lets choose elements
		if (common.getRandomInt(0, numOfPages*numOfPages) === 0) { // clcik on all records (prob = 1/(N^2) )
			casper.click('#cb-select-all-1');
			casper.echo("All elements selected.");
		} else { // clicking on each element (prob = 1/N for each element)
			for  (var i = 0; i < numOfPages; i++) {
				if (common.getRandomInt(0, numOfPages/2) === 0) {
					casper.evaluate(function (i) {
						document.querySelectorAll(
							'tbody#the-list th.check-column input'
						)[i].click();
					},i);
					casper.echo(utils.format('#%d is clicked', i+1));
				}
			}
		}
// now lets choose bulk action
		var modes = common.querySelectorAllinnerHTML.call(
				casper, 'div[class="tablenav top"] select[name="action"] option'
			);
		casper.echo(utils.format('Modes:\n - %s', modes.join('\n - ')));
		var op = common.getRandomInt(0, modes.length);
		casper.echo(utils.format("Chosen operation: %d", op+1));
		casper.evaluate(function (i) {
			document.getElementsByName('action')[0].selectedIndex = i;
		}, op);
// click apply
		casper.thenClick('div[class="tablenav top"] input#doaction');
		casper.waitForSelectorTextChange('html', null, null, 1500);
		return op;
	}
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
	changePage(this);
});

casper.then(function () {
	var numOfPages = this.evaluate(countPages);
	showPages(this,numOfPages);
	var operation = bulkActionPages(this, numOfPages);
	this.then(function () {
		this.echo('operation: ' + operation);
		switch (operation) {
			case 0: // bulk action
				break;
			case 1: // edit
				editPages(this, numOfPages, allTags);
				break;
			case 2: // delete; already completed
				break;
			default:
				this.echo('Default branch!');
				break;
		}
	});
});

casper.then(function () {
	var numOfPages = this.evaluate(countPages);
	showPages(this,numOfPages);
});


casper.run();