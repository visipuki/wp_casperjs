var require = patchRequire(require);

var utils = require('utils'),
    common = require('common'),
	config = require('config'),
	gen_text = require('gen_text');


exports.countTags = function (casper) {
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

exports.showTags = function (casper, num) {
	if (num >= 1) {
		var tags = common.querySelectorAllinnerHTML.call(casper,
			'form#posts-filter tbody#the-list tr a.row-title');	
		casper.echo(utils.format('Tags:\n - %s', tags.join('\n - ')));
	} else {
		casper.echo("No tags.");
	}	
}

exports.createTag = function (casper) {
	casper.echo('Creating new tag...');
	casper.then(function () {
		var name = common.getRandomWord();
		var slug = name.replace(/[^\w]+/g, '-');
		var desc = '';
		if (common.getRandomInt(0, 2)) {
			desc = gen_text.getRandomTextLetters(30, 150);
		}

		this.fill('form#addtag', {
			'tag-name': name,
			'slug': slug,
			'description': desc
		}, false);
	});
	casper.thenClick('input#submit', function () {
		this.waitForSelectorTextChange('table.wp-list-table', null, null, 3500);
	});
}

exports.deleteTag = function (casper) {
	casper.removeAllFilters('page.confirm');
	casper.setFilter('page.confirm', function (msg) {
			received = msg;
			return true;
	});
	casper.echo('Deleting tag...');
	var numOfTags = exports.countTags(casper);
	if (numOfTags >= 1) {
		var idx = common.getRandomInt(0,numOfTags);
		casper.echo(utils.format('%d(%d)', idx+1, numOfTags));
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

exports.editTag = function (casper) {
	casper.echo('Editing tag...');
	var numOfTags = exports.countTags(casper);
	if (numOfTags >= 1) {
// choose tag to edit
		var idx = common.getRandomInt(0,numOfTags);
		casper.echo(utils.format('%d(%d)', idx+1, numOfTags));	
		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-list tr')[i].getAttribute('id');
			return 'tr#'+id+' span.edit a';
		}, idx);
		casper.thenClick(link, function () {
			var name = common.getRandomWord();
			var slug = name.replace(/[^\w]+/g,'-');
			var desc = '';
			if (common.getRandomInt(0, 2)) {
				desc = gen_text.getRandomTextLetters(30, 150);
			}

			casper.fill('table.form-table',{
				'name': name,
				'slug': slug,
				'description': desc
			},false);

			casper.thenClick('p.submit input');
		});			
	}	
}

exports.quickEditTag = function (casper) {
	casper.echo('Quick editing tag...');
	var numOfTags = exports.countTags(casper);
	if (numOfTags >= 1) {
		var idx = common.getRandomInt(0,numOfTags);
		casper.echo(utils.format('%d(%d)', idx+1, numOfTags));
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

exports.bulkActionTags = function (casper) {
	casper.echo('Bulk actions on tags...');
	var numOfTags = exports.countTags(casper);
	if (numOfTags >= 1) {
		casper.then(function () {
			// lets choose elements
			if (common.getRandomInt(0, numOfTags*numOfTags) === 0) { // clcik on all records (prob = 1/(N^2) )
				this.click('#cb-select-all-1');
				this.echo("All elements selected.");
			} else { // clicking on each element (prob = 1/N for each element)
				for  (var i = 0; i < numOfTags; i++) {
					if (common.getRandomInt(0, numOfTags) === 0) {
						this.evaluate(function (i) {
							document.querySelectorAll('tbody#the-list th.check-column input')[i].click();
						},i);
						this.echo(utils.format('#%d is clicked', i+1));
					}
				}
			}
			// now lets choose bulk action
			var modes = common.querySelectorAllinnerHTML(this, 'div[class="tablenav top"] select option');
			this.echo(utils.format('Modes:\n - %s', modes.join('\n - ')));
			var op = common.getRandomInt(0, modes.length - 1) + 1;
			this.echo(utils.format("Chosen operation: " + modes[op]));
			this.evaluate(function (op) {
                document.querySelector('div[class="tablenav top"] select').selectedIndex = op;
			}, op);
		});
// click apply

		casper.thenClick('div[class="tablenav top"] input#doaction', function () {
			casper.waitForSelectorTextChange('html', null, null, 1500);
		});
	}
}

exports.openTags = function (casper) {
	casper.clickLabel('Tags', 'a');
}
