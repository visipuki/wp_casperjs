var casper = require('casper').create({
    verbose: true,
    logLevel: 'debug'
}),
	utils = require('utils'),
    common = require('common'),
	config = require('config'),
	gen_text = require('gen_text');

var host = config.setUrl();


function countCategories() {
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

function showCategories(casper, num) {
	if (num >= 1) {
		var cats = common.querySelectorAllinnerHTML.call(casper,
			'form#posts-filter tbody#the-list tr a.row-title');	
		casper.echo(utils.format('Categories:\n - %s', cats.join('\n - ')));
	} else {
		casper.echo("No categories.");
	}	
}
casper.start(host, function() {
	common.checkLoggedIn.call(this);
});

function chooseParent(casper) {
	var parent = 'None';
	if (common.getRandomInt(0, 2) === 0) { 
		casper.evaluate(function () {
			document.getElementById('parent').selectedIndex = 0;
		});
	} else {
		var numOfCategories = casper.evaluate(function () {
			return document.querySelectorAll('select#parent option').length;
		});
		parent = casper.evaluate(function (i) {
			document.getElementById('parent').selectedIndex = i;
			return document.querySelectorAll('#parent option')[i].innerHTML;
		}, common.getRandomInt(0, numOfCategories));
	}
	casper.echo(utils.format('Chosen parent: %s.', parent));
}

function createCategories(casper) {
	casper.echo('Creating new category...');
	var name = common.getRandomWord();
	var slug = name.replace(/[^\w]+/g, '-');
	var desc = '';
	if (common.getRandomInt(0, 2)) {
		desc = gen_text.getRandomText(1, 30, 150);
	}
	chooseParent(casper);

	casper.fill('form#addtag', {
		'tag-name': name,
		'slug': slug,
		'description': desc
	}, true);

	casper.waitForSelectorTextChange('html', null, null, 1500);
}

function deleteCategories(casper, numOfCategories) {
	casper.echo('Deleting category...');
	
	if (numOfCategories >= 1) {
		var idx = common.getRandomInt(0,numOfCategories);
		casper.echo(utils.format('%d(%d)', idx+1, numOfCategories));
// get link to delete i-th tag
		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-list tr')[i].getAttribute('id');
			return 'tr#'+id+' a.delete-tag';
		}, idx);
// delete tag and confirm
		casper.echo(utils.format('Selector: %s', link));
		casper.thenClick(link);
// html selector works
		casper.waitForSelectorTextChange('html', null, null, 1500); 
	}	
}

function editCategories(casper, numOfCategories) {
	casper.echo('Editing category...');
	if (numOfCategories >= 1) {
// choose tag to edit
		var idx = common.getRandomInt(0,numOfCategories);
		casper.echo(utils.format('%d(%d)', idx+1, numOfCategories));	
		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-list tr')[i].getAttribute('id');
			return 'tr#'+id+' span.edit a';
		}, idx);
		casper.thenClick(link, function () {
			var name = common.getRandomWord();
			var slug = name.replace(/[^\w]+/g,'-');
			var desc = '';
			if (common.getRandomInt(0,2)) {
				desc = gen_text.getRandomText(1,30,150);
			}
			chooseParent(casper);
			casper.fill('table.form-table',{
				'name': name,
				'slug': slug,
				'description': desc
			},false);
			casper.thenClick('p.submit input');
		});			
	}	
}

function quickEditCategories(casper, numOfCategories) {
	casper.echo('Quick editing category...');
	if (numOfCategories >= 1) {
		var idx = common.getRandomInt(0,numOfCategories);
		casper.echo(utils.format('%d(%d)', idx+1, numOfCategories));
// get link to delete i-th tag
		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-list tr')[i].getAttribute('id');
			return 'tr#'+id+' a.editinline';
		}, idx);
// delete tag and confirm
		casper.echo('Selector: '+link);
		casper.thenClick(link, function () {
			var name = common.getRandomWord();
			var slug = name.replace(/[^\w]+/g,'-');
			casper.fill('tbody#the-list td.colspanchange',{
				'name': name,
				'slug': slug
			},false);
			casper.thenClick('a[class="save button-primary alignright"]');
// if ajax-response changes DOM this works			
			casper.waitForSelectorTextChange('html', null, null, 1500);
		});
	}
}

function bulkAction(casper, numOfCategories) {
	casper.echo('Bulk actions on categories...');
	if (numOfCategories >= 1) {
// lets choose elements
		if (common.getRandomInt(0, numOfCategories*numOfCategories) === 0) { // clcik on all records (prob = 1/(N^2) )
			casper.click('#cb-select-all-1');
			casper.echo("All elements selected.");
		} else { // clicking on each element (prob = 1/N for each element)
			for  (var i = 0; i < numOfCategories; i++) {
				if (common.getRandomInt(0, numOfCategories) === 0) {
					casper.evaluate(function (i) {
						document.querySelectorAll('tbody#the-list th.check-column input')[i].click();
					},i);
					casper.echo(utils.format('#%d is clicked', i+1));
				}
			}
		}
// now lets choose bulk action
		var modes = common.querySelectorAllinnerHTML.call(casper, 'div[class="tablenav top"] select option');
		casper.echo(utils.format('Modes:\n - %s', modes.join('\n - ')));
		var op = common.getRandomInt(0,modes.length);
		casper.echo(utils.format("Chosen operation: %d", op+1));
		casper.thenEvaluate(function (i, len) {
			for (var j = 0; j < len; j++) {
				document.querySelectorAll('div[class="tablenav top"] select option')[j].removeAttribute('selected')
			}
			document.querySelectorAll('div[class="tablenav top"] select option')[i].setAttribute('selected','selected')
		}, op, modes.length);
// click apply
		casper.thenClick('div[class="tablenav top"] input#doaction');
		casper.waitForSelectorTextChange('html', null, null, 1500);
	}
}

// clear and set filters
casper.removeAllFilters('page.confirm');
casper.setFilter('page.confirm', function (msg) {
		received = msg;
		return true;
});

// go to wp-admin
casper.thenClick('li#wp-admin-bar-site-name > a', function () {
	this.clickLabel('Categories', 'a');
});

// choose random page
casper.then(function () { 
	changePage(casper);
});

// choose and perform action
casper.then(function () {
//	changePage(this);
	var numOfCategories = this.evaluate(countCategories);
	showCategories(this, numOfCategories);

	switch (common.getRandomInt(0, 5)) {
		case 0: // create new
			createCategories(this);
			break; 
		case 1: // delete
			deleteCategories(this, numOfCategories);
			break;
		case 2: // edit
			editCategories(this, numOfCategories);
			break;
		case 3: // quick edit
			quickEditCategories(this, numOfCategories);
			break;
		case 4: // bulk
			bulkAction(this, numOfCategories);
			break;
	}
});

casper.then(function () {
	var numOfCategories = this.evaluate(countCategories);
	showCategories(this, numOfCategories);
});

casper.run();