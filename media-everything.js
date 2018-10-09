var require = patchRequire(require);

var utils = require('utils'),
    common = require('common'),
	config = require('config'),
	gen_text = require('gen_text');

exports.countMedia = function (casper) {
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

exports.showMedia = function (casper, num) {
	if (num >= 1) {
		var posts = common.querySelectorAllinnerHTML(casper,
			'form#posts-filter tbody#the-list tr td[class="title column-title"] strong a');	
		for (var i = 0; i < posts.length; i++)
			posts[i] = posts[i].replace(/<[^>]+>/g, '');
		casper.echo(utils.format('Comments:\n - %s', posts.join('\n - ')));
	} else {
		casper.echo("No comments.");
	}	
}

exports.uploadBrowser = function (casper) {
	// go to add media
    casper.echo('Uploading media...');
	casper.click('a.page-title-action');
	casper.then(function () {
		var res = this.evaluate(function () {
			if (document.querySelectorAll('p.upload-flash-bypass a')[0].innerHTML === 'browser uploader') {
				return true;
			}
			return false;
		});
		if (res) {
			this.clickLabel('browser uploader', 'a');
		}
	});
	casper.then(function () {
		var file = config.getMediaPath() + common.getRandomMedia();
		this.fill('form#file-form', {
			'async-upload': file
		}, false);
		this.click('input#html-upload');
	});
	casper.then(function () {
		this.echo(this.getCurrentUrl());
	});
}

exports.uploadMultiFile = function (casper) {
	// go to add media
	casper.click('a.page-title-action');
	casper.then(function () {
		var res = this.evaluate(function () {
			if (document.querySelectorAll('p[class="upload-html-bypass hide-if-no-js"] a')[0].innerHTML === "Switch to the multi-file uploader") {
				return true;
			}
			return false;
		});
		if (res) {
			this.clickLabel('Switch to the multi-file uploader', 'a');
		}
	});
	casper.then(function () {
		var file = config.getMediaPath() + common.getRandomMedia();
		this.fillSelectors('div.moxie-shim', {
			'input[type="file"]': file
		}, false);
	});

	casper.then(function () {
		// works if only one item uploaded
		casper.waitForSelector('div[class="filename new"]', null, function () {}, 10000);
	});
	casper.then(function () {
		this.echo(this.getCurrentUrl());
	});
}

exports.editMedia = function (casper) {
	var numOfMedias = exports.countMedia(casper);
	if (numOfMedias >= 1) {
		var idx = common.getRandomInt(0, numOfMedias);
		casper.echo(utils.format('%d(%d)', idx+1, numOfMedias));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-list tr')[i].getAttribute('id');
			return 'tr#'+id+' span.edit a';
		}, idx);
		
		casper.echo(link);

		casper.thenClick(link, function () {
			var post_title = gen_text.getRandomTextLetters(25, 90),
				caption = gen_text.getRandomTextWords(25, 90),
				alternative_text = gen_text.getRandomTextWords(25, 90);
			gen_text.getRandomTextWordsTags(this, 'form#post textarea.wp-editor-area', 70, 200);
			this.fill('form#post', {
				'post_title': post_title,
				'excerpt': caption,
				'_wp_attachment_image_alt': alternative_text
			}, false);

			this.click('input#publish');
		});
	}	
}

exports.bulkMedia = function (casper) {
	var numOfMedias = exports.countMedia(casper);
	if (numOfMedias >= 1) {
// lets choose elements
		if (common.getRandomInt(0, numOfMedias*numOfMedias) === 0) { // clcik on all records (prob = 1/(N^2) )
			casper.click('#cb-select-all-1');
			casper.echo("All elements selected.");
		} else { // clicking on each element (prob = 1/N for each element)
			for  (var i = 0; i < numOfMedias; i++) {
				if (common.getRandomInt(0, numOfMedias/2) === 0) {
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
		var modes = common.querySelectorAllinnerHTML(
				casper, 'div[class="tablenav top"] select[name="action"] option'
			);
		casper.echo(utils.format('Modes:\n - %s', modes.join('\n - ')));
		var op = common.getRandomInt(0,modes.length);
		casper.echo(utils.format("Chosen operation: %d", op+1));
		casper.evaluate(function (i) {
			document.getElementsByName('action')[0].selectedIndex = i;
		}, op);
// click apply
		casper.thenClick('div.tablenav.top input#doaction');
		casper.waitForSelectorTextChange('html', null, null, 5000);
		return op;
	}
}

exports.deleteMedia = function (casper, numOfMedias) {
	var numOfMedias = exports.countMedia(casper);
	if (numOfMedias >= 1) {
		var idx = common.getRandomInt(0, numOfMedias);
		casper.echo(utils.format('%d(%d)', idx+1, numOfMedias));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-list tr')[i].getAttribute('id');
			return 'tr#'+id+' a.submitdelete';
		}, idx);
		
		casper.thenClick(link)
			.waitForSelectorTextChange('span.displaying-num', null, function () {}, 6000);
	}
}

exports.openLibrary = function (casper) {
	casper.thenClick('li#menu-media a.wp-first-item');
    if (! casper.exists('a.view-list.current')) {
        casper.thenClick('a.view-list'); 
    }
}
