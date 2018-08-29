var require = patchRequire(require);

var	utils = require('utils'),
    common = require('common'),
	config = require('config'),
	gen_text = require('gen_text');


exports.countComments = function (casper) {
	return casper.evaluate(function () {
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
	});
}

exports.showComments = function (casper, num) {
	if (num >= 1) {
		var posts = common.querySelectorAllinnerHTML(casper,
			'form#comments-form tbody#the-comment-list tr td[class="author column-author"] strong');	
		for (var i = 0; i < posts.length; i++)
			posts[i] = posts[i].replace(/<[^>]+>/g, '');
		casper.echo(utils.format('Comments:\n - %s', posts.join('\n - ')));
	} else {
		casper.echo("No comments.");
	}	
}

exports.spamComments = function (casper) {
	casper.echo('spam');
	var numOfComments = exports.countComments(casper);
	if (numOfComments >= 1) {
		var idx = common.getRandomInt(0, numOfComments);
		casper.echo(utils.format('%d(%d)', idx+1, numOfComments));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-comment-list tr')[i].getAttribute('id');
			return 'tr#'+id+' a[class="vim-s vim-destructive"]';
		}, idx);
		
		casper.thenClick(link)
			.waitForSelectorTextChange('span.displaying-num', null, function () {}, 6000);
	}
}

exports.aproveOrUnaproveComments = function (casper) {
	casper.echo('approve/unapprove');
	var numOfComments = exports.countComments(casper);
	if (numOfComments >= 1) {
		var idx = common.getRandomInt(0, numOfComments);
		casper.echo(utils.format('%d(%d)', idx+1, numOfComments));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-comment-list tr')[i].getAttribute('id');
			if (document.querySelectorAll('tr#'+ id +' a.vim-a')[0].offsetParent === null)
				return 'tr#'+id+' a[title="Unapprove this comment"]';
			else 
				return 'tr#'+id+' a[title="Approve this comment"]';
		}, idx);
		
		casper.thenClick(link)
			.waitForSelectorTextChange('li.moderated span.pending-count', null, function () {}, 6000);
	}
}

exports.quickEditComments = function (casper) {
	casper.echo('quik edit');
	var numOfComments = exports.countComments(casper);
	if (numOfComments >= 1) {
		var idx = common.getRandomInt(0, numOfComments);
		casper.echo(utils.format('%d(%d)', idx+1, numOfComments));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-comment-list tr')[i].getAttribute('id');
			return 'tr#'+id+' a.vim-q';
		}, idx);
		
		casper.thenClick(link).waitFor(function () {
			return this.evaluate(function () {
				return document.querySelector('tr#replyrow').offsetParent !== null;
			});
		});


		casper.then(function () {
			var text = gen_text.getRandomTextWords(10, 60),
				name = common.getRandomName(),
				email = common.getRandomEmail(),
				website = 'facebook.com';
			this.fill('tr#replyrow', {
				'newcomment_author': name,
				'newcomment_author_email': email,
				'newcomment_author_url': website,
				'replycontent': text
			}, false);
			this.click('tr#replyrow p.submit a[class="save button-primary alignright"]');
			this.waitFor(function () {
				return this.evaluate(function () {
					return document.querySelector('tr#replyrow').offsetParent === null;
				});
			});
		});
	}	
}


exports.editComments = function (casper) {
	casper.echo('edit');
	var numOfComments = exports.countComments(casper);
	if (numOfComments >= 1) {
		var idx = common.getRandomInt(0, numOfComments);
		casper.echo(utils.format('%d(%d)', idx+1, numOfComments));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-comment-list tr')[i].getAttribute('id');
			return 'tr#'+id+' a[title="Edit comment"]';
		}, idx);
		
		casper.echo(link);

		casper.thenClick(link, function () {
			var text = gen_text.getRandomTextWords(10, 60),
				name = common.getRandomName(),
				email = common.getRandomEmail(),
				website = 'facebook.com';
			this.fill('div.edit-form-section', {
				'newcomment_author': name,
				'newcomment_author_email': email,
				'newcomment_author_url': website,
				'content': text
			}, false);

// fill Status group
			this.evaluate(function (i) {
				document.querySelectorAll('div#comment-status-radio label')[i].click();
			}, common.getRandomInt(0, 3));

			this.click('input#save');
		});
	}	
}


exports.replyComments = function (casper) {
	casper.echo('reply');
	var numOfComments = exports.countComments(casper);
	if (numOfComments >= 1) {
		var idx = common.getRandomInt(0, numOfComments);
		casper.echo(utils.format('%d(%d)', idx+1, numOfComments));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-comment-list tr')[i].getAttribute('id');
			return 'tr#'+id+' a.vim-r';
		}, idx);
		
		casper.thenClick(link).waitFor(function () {
			return this.evaluate(function () {
				return document.querySelector('tr#replyrow').offsetParent !== null;
			});
		});

		casper.then(function () {
			var text = gen_text.getRandomTextWords(10,60);

			this.fill('tr#replyrow', {
				'replycontent': text
			}, false);

			this.click('tr#replyrow p.submit a[class="save button-primary alignright"]');
			this.waitFor(function () {
				return this.evaluate(function () {
					return document.querySelector('tr#replyrow').offsetParent === null;
				});
			})
		});
	}
}

exports.deleteComments = function (casper) {
	casper.echo('delete');
	var numOfComments = exports.countComments(casper);
	if (numOfComments >= 1) {
		var idx = common.getRandomInt(0, numOfComments);
		casper.echo(utils.format('%d(%d)', idx+1, numOfComments));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-comment-list tr')[i].getAttribute('id');
			return 'tr#'+id+' a[class="delete vim-d vim-destructive"]';
		}, idx);
		
		casper.thenClick(link)
			.waitForSelectorTextChange('span.displaying-num', null, function () {}, 6000);
	}
}


exports.notSpamComments = function (casper) {
	casper.echo('not spam');
	var numOfComments = exports.countComments(casper);
	if (numOfComments >= 1) {
		var idx = common.getRandomInt(0, numOfComments);
		casper.echo(utils.format('%d(%d)', idx+1, numOfComments));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-comment-list tr')[i].getAttribute('id');
			return 'tr#'+id+' a[class="vim-z vim-destructive"]';
		}, idx);
		
		casper.thenClick(link)
			.waitForSelectorTextChange('span.displaying-num', null, function () {}, 6000);
	}
}


exports.bulkComments = function (casper) {
	casper.echo('bulk');
	var numOfComments = exports.countComments(casper);
	if (numOfComments >= 1) {
		// lets choose elements
		if (common.getRandomInt(0, numOfComments*numOfComments) === 0) { // clcik on all records (prob = 1/(N^2) )
			casper.click('#cb-select-all-1');
			casper.echo("All elements selected.");
		} else { // clicking on each element (prob = 1/N for each element)
			for  (var i = 0; i < numOfComments; i++) {
				if (common.getRandomInt(0, numOfComments/2) === 0) {
					casper.evaluate(function (i) {
						document.querySelectorAll(
							'tbody#the-comment-list th.check-column input'
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
		casper.click('div[class="tablenav top"] input#doaction');
		casper.waitForSelectorTextChange('div.wrap', null, function () {}, 700);
		return op;
	}
}


exports.secAll = function (casper) {
	casper.echo('Section All');
	var act = common.getRandomInt(0, 7);
	switch (act) {
		case 0: // approve/unapprove		
			exports.aproveOrUnaproveComments(casper);
			break;
		case 1: // reply	
			exports.replyComments(casper);
			break;
		case 2: // quik edit
			exports.quickEditComments(casper);
			break;
		case 3: //  edit
			exports.editComments(casper);
			break;
		case 4: // spam
			exports.spamComments(casper);
			break;
		case 5: // trash
			exports.deleteComments(casper);
			break;
		case 6: // bulk
			exports.bulkComments(casper);	
			break;
	}	
}

exports.secPending = function (casper) {
	casper.echo('Section Pending');
	var act = common.getRandomInt(0, 7);
	switch (act) {
		case 0: // approve/unapprove
			exports.aproveOrUnaproveComments(casper);
			break;
		case 1: // reply
			exports.replyComments(casper);
			break;
		case 2: // quik edit
			exports.quickEditComments(casper);
			break;
		case 3: //  edit
			exports.editComments(casper);
			break;
		case 4: // spam
			exports.spamComments(casper);
			break;
		case 5: // trash
			exports.deleteComments(casper);
			break;
		case 6: // bulk
			exports.bulkComments(casper);	
			break;
	}	
}


exports.secApproved = function (casper) {
	casper.echo('Section Approved');
	var act = common.getRandomInt(0, 7);
	switch (act) {
		case 0: // approve/unapprove
			exports.aproveOrUnaproveComments(casper);
			break;
		case 1: // reply
			exports.replyComments(casper);
			break;
		case 2: // quik edit
			exports.quickEditComments(casper);
			break;
		case 3: //  edit
			exports.editComments(casper);
			break;
		case 4: // spam
			exports.spamComments(casper);
			break;
		case 5: // trash
			exports.deleteComments(casper);
			break;
		case 6: // bulk
			exports.bulkComments(casper);	
			break;
	}		
}

exports.secSpam = function (casper) {
	casper.echo('Section Spam');
	var act = common.getRandomInt(0, 3);
	switch (act) {
		case 0:
			exports.deleteComments(casper);
			break;
		case 1: 
			exports.notSpamComments(casper);
			break;
		case 2:
			exports.bulkComments(casper);
			break;
	}	
}

exports.secTrash = function (casper) {
	casper.echo('Section Trash');
	var act = common.getRandomInt(0, 3);
	switch (act) {
		case 0:
			exports.deleteComments(casper);
			break;
		case 1: 
			// restore is the same as unspam
			exports.notSpamComments(casper);
			break;
		case 2:
			exports.bulkComments(casper);
			break;
	}	
}

exports.performRandomCommentAction = function (casper) {
	var subsub = 0;
	casper.then(function () {
		subsub = common.getRandomInt(0, 5);
		switch (subsub) {
			case 0: // section All
				this.clickLabel('All', 'a');
				break;
			case 1: // section Pending
				this.click('li.moderated a');
				break;
			case 2: // section Approved
				this.clickLabel('Approved', 'a');
				break;
			case 3: // section Spam
				this.click('li.spam a');
				break;
			case 4: // section Trash
				this.click('li.trash a');
				break;
		}
	});

	casper.then(function () {
		common.changePage(this);
	});

	casper.then(function () {
		var numOfComments = exports.countComments(this);
		exports.showComments(this, numOfComments);

		switch (subsub) {
			case 0: // section All
				exports.secAll(this);
				break;
			case 1: // section Pending
				exports.secPending(this);
				break;
			case 2: // section Approved
				exports.secApproved(this);
				break;
			case 3: // section Spam
				exports.secSpam(this);
				break;
			case 4: // section Trash
				exports.secTrash(this);
				break;
		}
	});	
}

exports.openSecAll = function (casper) {
	casper.echo('Section All');
	casper.then(function () {
		this.clickLabel('All', 'a');
	});
	casper.then(function () {
		common.changePage(this);
	});
}

exports.openSecPending = function (casper) {
	casper.echo('Section Pending');
	casper.then(function () {
		this.click('li.moderated a');
	});
	casper.then(function () {
		common.changePage(this);
	});
}

exports.openSecApproved = function (casper) {
	casper.echo('Section Approved');
	casper.then(function () {
		this.clickLabel('Approved', 'a');
	});
	casper.then(function () {
		common.changePage(this);
	});
}

exports.openSecSpam = function (casper) {
	casper.echo('Section Spam');
	casper.then(function () {
		this.click('li.spam a');
	});
	casper.then(function () {
		common.changePage(this);
	});
}

exports.openSecTrash = function (casper) {
	casper.echo('Section Trash');
	casper.then(function () {
		this.click('li.trash a');
	});
	casper.then(function () {
		common.changePage(this);
	});
}

exports.openComments = function (casper) {
	casper.click('li#menu-comments > a');
}