var require = patchRequire(require);

var utils = require('utils'),
    common = require('common'),
	config = require('config'),
	gen_text = require('gen_text');


exports.countCategories = function (casper) {
	return casper.evaluate(function () {
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
	});
}

exports.showCategories = function (casper, num) {
	if (num >= 1) {
		var tags = common.querySelectorAllinnerHTML(casper,
			'form#posts-filter tbody#the-list tr a.row-title');	
		casper.echo(utils.format('Categories:\n - %s', tags.join('\n - ')));
	} else {
		casper.echo("No categories.");
	}	
}

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

exports.createCategories = function (casper) {
	casper.echo('Creating new category...');
	casper.then(function () {
		var name = common.getRandomWord();
		var slug = name.replace(/[^\w]+/g, '-');
		var desc = '';
		if (common.getRandomInt(0, 2)) {
			desc = gen_text.getRandomTextLetters(30, 150);
		}
		chooseParent(casper);

		casper.fill('form#addtag', {
			'tag-name': name,
			'slug': slug,
			'description': desc
		}, false);
	});
	casper.thenClick('input#submit', function () {
		this.waitForSelectorTextChange('table.wp-list-table', null, null, 3500);
	});
}

exports.deleteCategories = function (casper) {
	casper.echo('Deleting categories...');
	casper.removeAllFilters('page.confirm');
	casper.setFilter('page.confirm', function (msg) {
			received = msg;
			return true;
	});
	var numOfCategories = exports.countCategories(casper);
	if (numOfCategories >= 2) {
		var idx = common.getRandomInt(0,numOfCategories);
		casper.echo(utils.format('%d(%d)', idx+1, numOfCategories));
// get link to delete i-th tag
		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-list tr')[i].getAttribute('id');
			return 'tr#'+id+' a.delete-tag';
		}, idx);
// delete tag and confirm
		casper.echo(utils.format('Selector: %s', link));
		var basic_cat = casper.evaluate(function (selector) {
			return document.querySelectorAll(selector).length;
		}, link);
		if (basic_cat > 0) {
			casper.thenClick(link);
			// html selector works
			casper.waitForSelectorTextChange('html', null, null, 1500);
		}		 
	}	
}

exports.editCategories = function (casper) {
	casper.echo('Editing categories...');
	var numOfCategories = exports.countCategories(casper);
	if (numOfCategories >= 1) {
// choose tag to edit
		var idx = common.getRandomInt(0, numOfCategories);
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
				desc = gen_text.getRandomTextLetters(30, 150);
			}
			chooseParent(casper);
			casper.fill('table.form-table',{
				'name': name,
				'slug': slug,
				'description': desc
			}, false);
			casper.thenClick('div.edit-tag-actions input');
		});			
	} else {
        casper.echo('There are no categories');
    }
}

exports.quickEditCategories = function (casper) {
	casper.echo('Quick editing categories...');
	var numOfCategories = exports.countCategories(casper);
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
			casper.thenClick('button[class="save button button-primary alignright"]');
// if ajax-response changes DOM this works			
			casper.waitForSelectorTextChange('html', null, null, 1500);
		});
	}
}

exports.bulkActionCategories = function (casper) {
	casper.echo('Bulk actions on categories...');
	var numOfCategories = exports.countCategories(casper);
	if (numOfCategories >= 2) {
		casper.then(function () {
			// lets choose elements
			if (common.getRandomInt(0, numOfCategories*numOfCategories) === 0) { // clcik on all records (prob = 1/(N^2) )
				this.click('#cb-select-all-1');
				this.echo("All elements selected.");
			} else { // clicking on each element (prob = 1/N for each element)
				for  (var i = 0; i < numOfCategories - 1; i++) {
					if (common.getRandomInt(0, numOfCategories) === 0) {
						this.evaluate(function (i) {
							document.querySelectorAll('tbody#the-list th.check-column input')[i].click();
						}, i);
						this.echo(utils.format('#%d is clicked', i+1));
					}
				}
			}
			// now lets choose bulk action
			var modes = common.querySelectorAllinnerHTML(this, 'div[class="tablenav top"] select option');
			this.echo(utils.format('Modes:\n - %s', modes.join('\n - ')));
			var op = common.getRandomInt(0, modes.length - 1) + 1;
			this.echo(utils.format("Chosen operation: %d", op+1));
			this.evaluate(function (op) {
				document.querySelector('div[class="tablenav top"] select').selectedIndex = op;
			}, op);
		});
// click apply
		casper.thenClick('div[class="tablenav top"] input#doaction', function () {
			this.waitForSelectorTextChange('table.wp-list-table', null, function () {}, 3500);
		});
	}
}

exports.openCategories = function (casper) {
	casper.clickLabel('Categories', 'a');
}
