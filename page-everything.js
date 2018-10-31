var require = patchRequire(require);

var utils = require('utils'),
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

exports.countPages = function (casper) {
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

exports.showPages = function (casper, num) {
	if (num >= 1) {
		var pages = common.querySelectorAllinnerHTML(casper,
			'form#posts-filter tbody#the-list tr a.row-title');	
		casper.echo(utils.format('Pages:\n - %s', pages.join('\n - ')));
	} else {
		casper.echo("No pages.");
	}	
}

function bulkEditPages (casper, numOfPages) {
// fill all select-option tags
	common.fillSelect(casper, 'form#posts-filter select.authors');
	common.fillSelect(casper, 'form#posts-filter select#post_parent');
	common.fillSelect(casper, 'form#posts-filter select[name="page_template"]');
	common.fillSelect(casper, 'form#posts-filter select[name="comment_status"]');
	common.fillSelect(casper, 'form#posts-filter select[name="_status"]');

// apply changings	
	casper.thenClick('input#bulk_edit');
// if ajax-response changes DOM this works			
	casper.waitForSelector('div#message', null, function () {}, 2500);
}

exports.createPages = function (casper) {
	casper.echo('Create pages...');
	casper.click('a.page-title-action');
	casper.then(function () {
		// edit Title/text column
		var name = common.getRandomWord();
		var text = gen_text.getRandomTextWords(150, 500);
        casper.waitForSelector('iframe', function() {
            casper.withFrame(0, function() {
                this.sendKeys('#tinymce', text)});
        });
		casper.fill('form#post', {
			'post_title': name
		}, false);
		// edit Publish group

		// edit Featured Image group

		// edit Page attributes
		common.fillSelect(this, 'select#parent_id');
		var numOfPages = exports.countPages(this);
		var order = common.getRandomInt(0, numOfPages+1);
		casper.fill('form#post', {
            'menu_order': order
        }, false);

		// apply changes
		this.thenClick('input#publish', function () {
			this.waitForSelector('div#message');
		});	
	});
}

exports.deletePages = function (casper) {
	casper.echo('Delete pages...');
	var numOfPages = exports.countPages(casper);
	exports.showPages(casper, numOfPages);
	if (numOfPages >= 1) {
		var idx = common.getRandomInt(0,numOfPages);
		casper.echo(utils.format('%d(%d)', idx+1, numOfPages));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-list tr')[i].getAttribute('id');
			return 'tr#'+id+' a.submitdelete';
		}, idx);
		
		casper.thenClick(link);
	}
}

exports.fullEditPages = function (casper) {
	casper.echo('Full edit pages...');
	var numOfPages = exports.countPages(casper);
	exports.showPages(casper, numOfPages);
	if (numOfPages >= 1) {
		var idx = common.getRandomInt(0, numOfPages);
		casper.echo(utils.format('%d(%d)', idx+1, numOfPages));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-list tr')[i].getAttribute('id');
			return 'tr#'+id+' .edit a';
		}, idx);
		
		casper.thenClick(link, function () {
// edit Title/text column
			var name = common.getRandomWord();
            var text = gen_text.getRandomTextWords(150, 500);
            casper.waitForSelector('iframe', function() {
                casper.withFrame(0, function() {
                    this.sendKeys(
                        '#tinymce',
                        text,
                        {reset: true, keepFocus: true}
                    )
                });
            });
			casper.fill('form#post', {
				'post_title': name
			}, false);
// edit Page attributes
			common.fillSelect(casper, 'select#parent_id');
			var order = common.getRandomInt(0, numOfPages+1);
			casper.fill('form#post', {'menu_order': order}, false);

// apply changings	
			casper.thenClick('input#publish', function () {
				this.waitForSelector('div#message');
			});	
			casper.then(function () {
                this.clickLabel('All Pages', 'a');
			});	
		});
	}
}

exports.quickEditPages = function (casper) {
	casper.echo('Quick edit pages...');
	var numOfPages = exports.countPages(casper);
	exports.showPages(casper, numOfPages);
	if (numOfPages >= 1) {
		var idx = common.getRandomInt(0, numOfPages);
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
			common.fillSelect(casper, 'form#posts-filter select#post_parent');
			var order = common.getRandomInt(0, numOfPages+1);
			casper.fill('form#posts-filter', {'menu_order': order}, false);
			common.fillSelect(casper, 'form#posts-filter select[name="page_template"]');
			common.makeCheck(casper, 'form#posts-filter input[name="comment_status"]');
			common.fillSelect(casper, 'form#posts-filter select[name="_status"]');

// apply changings			
			casper.thenClick('button[class="button button-primary save alignright"]');
// if ajax-response changes DOM this works			
			casper.waitForSelectorTextChange('html', null, null, 1500);
		});
	}
}

exports.bulkActionPages = function (casper) {
	casper.echo('Bulk actions on pages...');
	var numOfPages = exports.countPages(casper);
	exports.showPages(casper, numOfPages);
	var operation = 0;
	casper.then(function () {
		if (numOfPages >= 1) {
	// lets choose elements
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
	// now lets choose bulk action
			var modes = common.querySelectorAllinnerHTML(
					casper, 'div[class="tablenav top"] select[name="action"] option'
				);
			casper.echo(utils.format('Modes:\n - %s', modes.join('\n - ')));
			operation = common.getRandomInt(0, modes.length);
			casper.echo(utils.format("Chosen operation: %d", operation+1));
			casper.evaluate(function (i) {
				document.getElementsByName('action')[0].selectedIndex = i;
			}, operation);
	// click apply
			casper.thenClick('div[class="tablenav top"] input#doaction');
			casper.waitForSelectorTextChange('html', null, null, 1500);
		}
	});
	casper.then(function () {
		this.echo('operation: ' + operation);
		switch (operation) {
			case 0: // bulk action
				break;
			case 1: // edit
				bulkEditPages(this, numOfPages);
				break;
			case 2: // delete; already completed
				break;
			default:
				this.echo('Default branch!');
				break;
		}
	});
}

exports.openPages = function (casper) {
	casper.clickLabel('All Pages', 'a');
}
