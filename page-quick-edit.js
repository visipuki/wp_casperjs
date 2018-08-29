var casper = require('casper').create({
    verbose: true,
    logLevel: 'debug'
}),
	utils = require('utils'),
    common = require('common'),
	config = require('config'),
	gen_text = require('gen_text');

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

function makeCheck(casper, selector) {
	var act = common.getRandomInt(0,2);
	if (act === 1) {
		casper.evaluate(function () {
			document.querySelectorAll(selector)[0].click();
		});
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


function quickEditPages(casper, numOfPages) {
	if (numOfPages >= 1) {
		var idx = common.getRandomInt(0,numOfPages);
		casper.echo(utils.format('%d(%d)', idx+1, numOfPages));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-list tr')[i].getAttribute('id');
			return 'tr#'+id+' a.editinline';
		}, idx);
		
		casper.thenClick(link, function () {
// edit Title/slug column (whitout date and password)
			var name = common.getRandomWord();
			var slug = name.replace(/[^\w]+/g, '-');
			casper.fill('fieldset.inline-edit-col-left', {
				'post_title': name,
				'post_name': slug
			}, false);
// edit right column group
			fillSelect(casper, 'form#posts-filter select#post_parent');
			var order = common.getRandomInt(0, numOfPages+1);
			casper.fill('form#posts-filter', {'menu_order': order}, false);
			fillSelect(casper, 'form#posts-filter select[name="page_template"]');
			makeCheck(casper, 'form#posts-filter input[name="comment_status"]');
			fillSelect(casper, 'form#posts-filter select[name="_status"]');

// apply changings			
			casper.thenClick('a[class="button-primary save alignright"]');
// if ajax-response changes DOM this works			
			casper.waitForSelectorTextChange('html', null, null, 1500);
		});
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
	quickEditPages(this, numOfPages);
});

casper.then(function () {
	var numOfPages = this.evaluate(countPages);
	showPages(this,numOfPages);
});


casper.run();