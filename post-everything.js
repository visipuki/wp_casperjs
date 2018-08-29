var require = patchRequire(require);

var utils = require('utils'),
    common = require('common'),
	config = require('config'),
	gen_text = require('gen_text');

exports.countPosts = function (casper) {
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

exports.showPosts = function (casper) {
	var num = exports.countPosts(casper);
	if (num >= 1) {
		var posts = common.querySelectorAllinnerHTML(casper,
			'form#posts-filter tbody#the-list tr a.row-title');	
		casper.echo(utils.format('Posts:\n - %s', posts.join('\n - ')));
	} else {
		casper.echo("No posts.");
	}	
}

function getOnePageTags(casper) {
	return casper.evaluate(function () {
		var res = [];
		var tags = document.querySelectorAll('tbody#the-list tr');
		for (var j = 0; j < tags.length; j++) {
			res.push(tags[j].getElementsByClassName('row-title')[0].innerHTML);
		}
		return res;
	});
}

exports.getAllTags = function (casper, allTags) {
	var total_pages = casper.evaluate(function () {
		return parseInt(document.getElementsByClassName('total-pages')[0].innerHTML);
	});
	for (var i = 0; i < total_pages; i++) {
		casper.then(function () {
			var res = getOnePageTags(this);
			Array.prototype.push.apply(allTags, res);
		});
		if (i < total_pages-1) {
			casper.thenClick('a[class="next-page"]');		
		}
	}
}

function newTags(allTags, tags) {
	var res = [], flg_unic = true;
	for (var i = 0; i < allTags.length; i++) {
		flg_unic = true;
		for (var j = 0; j < tags.length; j++) {
			if (allTags[i] === tags[j])
				flg_unic = false;
		}
		if (flg_unic)
			res.push(allTags[i]);
	}
	return res;
}

function addNewTags(casper, allTags, tags, selector) {
	var unicTags = newTags(allTags, tags);
	for (var j = 0; j < Math.min(2,unicTags.length); j++) {

		var idx = common.getRandomInt(0, unicTags.length);
		// too short tag name
		if (unicTags[idx].length < 2) {
			continue;
		}
		// this tag is already used
		if (tags.indexOf(unicTags[idx]) >= 0) {
			continue;
		}
		tags.push(unicTags[idx]);
		casper.echo(utils.format('Chosen tag is %s', unicTags[idx]));
        var cur_new_tag = unicTags[idx];
        casper.then(function () {
            casper.sendKeys(
                selector,
                casper.page.event.key.End,
                {reset: false, keepFocus: true, modifiers: "ctrl"}
            );
        });
		if (j == 0 && tags.length > 1) { // Not the first tag, add comma
            casper.then(function () {
                casper.sendKeys(
                    selector, 
                    ', ',
                    {reset: false, keepFocus: true}
                );
            });
        }
        for(var chunk_index = 0; chunk_index < cur_new_tag.length / 5 + 1; chunk_index++){
            console.log(cur_new_tag);
            var chunk = cur_new_tag.substring(chunk_index*5, (chunk_index+1)*5);
            var is_first = chunk_index === 0;
            casper.then( // use closure to pass chunk_name inside casper.then()
                function(tag_part, wait_visible){
                    return function(){
                        console.log("CHUNK: "+tag_part)
                        // input a chunk of a tag
                        casper.sendKeys(
                            selector, 
                            tag_part,
                            {reset: false, keepFocus: true}
                        );
                        if (wait_visible) {
                            // Wait for popup to show up
                            casper.waitUntilVisible('ul.ac_results', null, function () {
                            		casper.log('waitUntilVisible');
                            	}, 7000
                            );
                        } else {
                            casper.wait(100); // 100 ms user typing delay
                        }
                    }
                }(chunk, is_first)
            );
//					casper.wait(2000);
        }
        casper.then(function(){
            var item_num = casper.evaluate(function(){
                results = document.querySelectorAll('ul.ac_results li');
                for (var i = 0; i < results.length; i++){
                    if(cur_new_tag == results[i].innerText){
                        return i;
                    }
                }
                return -1;
            });
            casper.sendKeys(
                selector,
                ', ',
                {reset: false}
            )
            casper.waitWhileVisible('ul.ac_results', null, function () {
            		casper.log('waitWhileVisible');
            	}, 7000
            );
        });
	}	
}



function editPosts(casper, numOfPosts, allTags) {
// edit Categories column
	var total_cats = casper.evaluate(function () {
		return document.
			querySelectorAll(
				'ul[class="cat-checklist category-checklist"]'
			)[0].
			querySelectorAll('input').length;
	});

	for (var i = 0; i < total_cats; i++) {
		casper.evaluate(function (i, prob) {
			if (prob === 0) {
				document.
					querySelectorAll(
						'ul[class="cat-checklist category-checklist"]'
					)[0].
					querySelectorAll('input')[i].click();
			}
		}, i, common.getRandomInt(0, 5)); // prob to choose cat = 1/5						
	}

// edit Tags column
	var tags = [];
	casper.echo(utils.format('Current tags:\n - %s', tags.join('\n - ')));

	// work with tags
	addNewTags(casper, allTags, tags, 'form#posts-filter textarea.tax_input_post_tag');
// fill all select-option tags
	common.fillSelect(casper, 'select.authors');
	common.fillSelect(casper, 'select[name="comment_status"]');
	common.fillSelect(casper, 'select[name="_status"]');
	common.fillSelect(casper, 'select[name="post_format"]');
	common.fillSelect(casper, 'select[name="ping_status"]');
	common.fillSelect(casper, 'select[name="sticky"]');
// apply changings	

	casper.thenClick('input#bulk_edit');
// if ajax-response changes DOM this works			
	casper.waitForSelector('div#message', null, null, 1500);
}

exports.createPosts = function (casper, allTags) {
	casper.echo('Create post...');
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

	// edit Format group

		var format_idx = common.getRandomInt(
			0, 
			casper.evaluate(function () {
				return document.querySelectorAll(
					'#formatdiv input'
				).length;
			})
		);
		casper.echo(format_idx);
		var format_link = casper.evaluate(function (i) {
			var id = document.querySelectorAll(
					'#formatdiv input'
				)[i].getAttribute('id');
			return '#formatdiv input#'+id;				
		}, format_idx);

		casper.echo(format_link);
		casper.click(format_link);

	// edit Category group
		var total_cats = casper.evaluate(function () {
			return document.
				querySelectorAll(
					'ul#categorychecklist input'
				).length;
		});
		for (var i = 0; i < total_cats; i++) {
			casper.evaluate(function (i, prob) {
				if (prob === 0) {
					document.
						querySelectorAll(
							'ul[class="cat-checklist category-checklist"]'
						)[0].
						querySelectorAll('input')[i].click();
				}
			}, i, common.getRandomInt(0, 5)); // prob to choose cat = 1/5						
		}
	// edit Tags column
		// get tags of current post
		var tags = casper.evaluate(function () {
			var res = [];
			var ctags = document.querySelectorAll('div.tagchecklist span');
			for (var i = 0; i < ctags.length; i++) {
				res.push(
					ctags[i].innerHTML.substring(
						ctags[i].innerHTML.lastIndexOf(';')+1,ctags[i].innerHTML.length
					)
				);
			}
			return res;
		});
		casper.echo(utils.format('Current tags:\n - %s', tags.join('\n - ')));
	//			casper.echo(utils.format('All tags:\n - %s', allTags.join('\n - ')));
		// work with tags
		addNewTags(casper, allTags, tags, 'form#post input#new-tag-post_tag');


	// apply changings	
		casper.thenClick('input#publish', function () {
			this.waitForSelector('div#message');
		});	
		casper.thenClick('a[class="wp-first-item current"]');	
	});
}

exports.fullEditPosts = function (casper, allTags) {
	casper.echo('Full edit posts...');
	var numOfPosts = exports.countPosts(casper);
	if (numOfPosts >= 1) {
		var idx = common.getRandomInt(0, numOfPosts);
		casper.echo(utils.format('%d(%d)', idx+1, numOfPosts));

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

// edit Publish group

// edit Format group

			var format_idx = common.getRandomInt(
				0, 
				casper.evaluate(function () {
					return document.querySelectorAll(
						'#formatdiv input'
					).length;
				})
			);
			casper.echo(format_idx);
			var format_link = casper.evaluate(function (i) {
				var id = document.
					querySelectorAll(
						'#formatdiv input'
					)[i].getAttribute('id');
				return '#formatdiv input#'+id;				
			}, format_idx);

			casper.echo(format_link);
			casper.click(format_link);

// edit Category group
			var total_cats = casper.evaluate(function () {
				return document.
					querySelectorAll(
						'ul#categorychecklist input'
					).length;
			});
			for (var i = 0; i < total_cats; i++) {
				casper.evaluate(function (i, prob) {
					if (prob === 0) {
						document.
							querySelectorAll(
								'ul[class="cat-checklist category-checklist"]'
							)[0].
							querySelectorAll('input')[i].click();
					}
				}, i, common.getRandomInt(0, 5)); // prob to choose cat = 1/5						
			}
// edit Tags column
			// get tags of current post
			var tags = casper.evaluate(function () {
				var res = [];
				var ctags = document.querySelectorAll('div.tagchecklist span');
				for (var i = 0; i < ctags.length; i++) {
					res.push(
						ctags[i].innerHTML.substring(
							ctags[i].innerHTML.lastIndexOf(';')+1,ctags[i].innerHTML.length
						)
					);
				}
				return res;
			});
			casper.echo(utils.format('Current tags:\n - %s', tags.join('\n - ')));

			// work with tags
			addNewTags(casper, allTags, tags, 'input#new-tag-post_tag');


// apply changings	
			casper.thenClick('input#publish', function () {
				this.waitForSelector('div#message');
			});	
			casper.thenClick('a[class="wp-first-item current"]');	
		});
	}
}

exports.quickEditPosts = function (casper, allTags) {
	casper.echo('Quick edit posts...');
	var numOfPosts = exports.countPosts(casper);
	if (numOfPosts >= 1) {
		var idx = common.getRandomInt(0,numOfPosts);
		casper.echo(utils.format('%d(%d)', idx+1, numOfPosts));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-list tr')[i].getAttribute('id');
			return 'tr#'+id+' a.editinline';
		}, idx);
		
		casper.thenClick(link, function () {

// edit Title/slug column
			var name = common.getRandomWord();
			var slug = name.replace(/[^\w]+/g, '-');
			casper.fill('fieldset.inline-edit-col-left', {
				'post_title': name,
				'post_name': slug
			}, false);

// edit Categories column
			var total_cats = casper.evaluate(function () {
				return document.
					querySelectorAll(
						'ul[class="cat-checklist category-checklist"]'
					)[0].
					querySelectorAll('input').length;
			});
			for (var i = 0; i < total_cats; i++) {
				casper.evaluate(function (i, prob) {
					if (prob === 0) {
						document.
							querySelectorAll(
								'ul[class="cat-checklist category-checklist"]'
							)[0].
							querySelectorAll('input')[i].click();
					}
				}, i, common.getRandomInt(0, 5)); // prob to choose cat = 1/5						
			}
// edit Tags column
			// get tags of current post
			var tags = casper.evaluate(function (i, link) {
				var res = [];
				var pref = link.substr(0,link.lastIndexOf(' '));
				var tags = document.
					querySelectorAll(pref+' td[class="tags column-tags"] a');
				for (var i = 0; i < tags.length; i++) {
					res.push(tags[i].innerHTML)
				}
				return res;
			}, idx, link);
			casper.echo(utils.format('Current tags:\n - %s', tags.join('\n - ')));
//			casper.echo(utils.format('All tags:\n - %s', allTags.join('\n - ')));

			// disable allow comments with prob 1/20
			if (common.getRandomInt(0,20) === 15) {
				casper.evaluate(function () {
					document.querySelector('input[name="comment_status"]').click();
				});
			}
			// disable allow pings with prob 1/20
			if (common.getRandomInt(0,20) === 15) {
				casper.evaluate(function () {
					document.querySelector('input[name="ping_status"]').click()
				});
			}
			// work with tags
			addNewTags(casper, allTags, tags, 'form#posts-filter textarea.tax_input_post_tag');


// apply changings	

			casper.thenClick('button[class="button button-primary save alignright"]');
// if ajax-response changes DOM this works			
			casper.waitForSelectorTextChange(
				link.substr(0,link.lastIndexOf(' ')), null, null, 1500
			);
			casper.then(function () {
				var tags = casper.evaluate(function (i, link) {
					var res = [];
					var pref = link.substr(0,link.lastIndexOf(' '));
					var tags = document.
						querySelectorAll(pref+' td[class="tags column-tags"] a');
					for (var i = 0; i < tags.length; i++) {
						res.push(tags[i].innerHTML)
					}
					return res;
				}, idx, link);
				casper.echo(utils.format('Current tags:\n - %s', tags.join('\n - ')));
			});
		});
	}
}

exports.bulkActionPosts = function (casper, allTags) {
	casper.echo('Bulk actions on posts...');
	var numOfPosts = exports.countPosts(casper);
	if (numOfPosts >= 1) {
// lets choose elements
		if (common.getRandomInt(0, numOfPosts*numOfPosts) === 0) { // clcik on all records (prob = 1/(N^2) )
			casper.click('#cb-select-all-1');
			casper.echo("All elements selected.");
		} else { // clicking on each element (prob = 1/N for each element)
			for  (var i = 0; i < numOfPosts; i++) {
				if (common.getRandomInt(0, numOfPosts/2) === 0) {
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
		casper.thenClick('div[class="tablenav top"] input#doaction');
		casper.waitForSelectorTextChange('html', null, null, 1500);
		if (op === 1) {
			casper.then(function () {
				editPosts(this, numOfPosts, allTags);
			});
		}
	}
}

exports.deletePosts = function (casper) {
	var numOfPosts = exports.countPosts(casper);
	if (numOfPosts >= 1) {
		var idx = common.getRandomInt(0,numOfPosts);
		casper.echo(utils.format('%d(%d)', idx+1, numOfPosts));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-list tr')[i].getAttribute('id');
			return 'tr#'+id+' a.submitdelete';
		}, idx);
		
		casper.thenClick(link);
	}
}

exports.openPosts = function (casper) {
	casper.clickLabel('All Posts', 'a');
}
