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

function countPosts() {
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

function showPosts(casper, num) {
	if (num >= 1) {
		var posts = common.querySelectorAllinnerHTML.call(casper,
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

function getAllTags(casper) {
	var total_pages = casper.evaluate(function () {
		return parseInt(document.getElementsByClassName('total-pages')[0].innerHTML);
	});
	for (var i = 0; i < total_pages; i++) {
		casper.then(function () {
			var res = getOnePageTags(this);
			allTags = allTags.concat(res);
		});
		if (i < total_pages-1) {
			casper.thenClick('a[class="next-page"]');		
		}
	}

	return allTags;
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

function addNewTags(casper, allTags, tags) {
	var unicTags = newTags(allTags, tags);
	for (var j = 0; j < Math.min(2,unicTags.length); j++) {
//				casper.wait(2000);
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
                'form#post input#new-tag-post_tag',
                casper.page.event.key.End,
                {reset: false, keepFocus: true, modifiers: "ctrl"}
            );
        });
		if (j == 0 && tags.length > 1) { // Not the first tag, add comma
            casper.then(function () {
                casper.sendKeys(
                    'form#post input#new-tag-post_tag', 
                    ', ',
                    {reset: false, keepFocus: true}
                );
            });
        }
        for(var chunk_index = 0; chunk_index < cur_new_tag.length / 5 + 1; chunk_index++){
            console.log(cur_new_tag);
            var chunk = cur_new_tag.substring(chunk_index*5,(chunk_index+1)*5);
            var is_first = chunk_index === 0;
            casper.then( // use closure to pass chunk_name inside casper.then()
                function(tag_part, wait_visible){
                    return function(){
                        console.log("CHUNK: "+tag_part)
                        // input a chunk of a tag
                        casper.sendKeys(
                            'form#post input#new-tag-post_tag', 
                            tag_part,
                            {reset: false, keepFocus: true}
                        );
                        if (wait_visible){
                            // Wait for popup to show up
                            casper.waitUntilVisible('ul.ac_results', null, null, 1500);
                        }else{
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
                'form#post input#new-tag-post_tag',
                ', ',
                {reset: false}
            )
            casper.waitWhileVisible('ul.ac_results', null, null, 1500);
        });
	}	
}

function fullEditPosts(casper, numOfPosts, allTags) {
	if (numOfPosts >= 1) {
		var idx = common.getRandomInt(0,numOfPosts);
		casper.echo(utils.format('%d(%d)', idx+1, numOfPosts));

		var link = casper.evaluate(function (i) {
			var id = document.querySelectorAll('tbody#the-list tr')[i].getAttribute('id');
			return 'tr#'+id+' a[title="Edit this item"]';
		}, idx);
		
		casper.thenClick(link, function () {

// edit Title/text column
			var name = common.getRandomWord();
			var text = gen_text.getRandomText(0,50,250);
			casper.fill('form#post', {
				'post_title': name,
				'content': text
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
//			casper.echo(utils.format('All tags:\n - %s', allTags.join('\n - ')));
			// work with tags
			addNewTags(casper, allTags, tags);


// apply changings	
			casper.thenClick('input#publish', function () {
				this.waitForSelector('div#message');
			});	
			casper.thenClick('a[class="wp-first-item current"]');	
/*			
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
*/
		});
	}
}

casper.start(host, function() {
	common.checkLoggedIn.call(this);
});

// go to wp-admin
casper.thenClick('li#wp-admin-bar-site-name > a');

casper.then(function () {
	this.clickLabel('Tags', 'a');
});

casper.then(function () {
	this.echo(this.getCurrentUrl());
	allTags = getAllTags(this);
});

casper.thenOpen(host);

casper.thenClick('li#wp-admin-bar-site-name > a');

casper.then(function () {
	this.clickLabel('All Posts', 'a');
});

casper.then(function () {
	changePage(this);
});

casper.then(function () {
	var numOfPosts = this.evaluate(countPosts);
	showPosts(this,numOfPosts);
	fullEditPosts(this, numOfPosts, allTags);
});

casper.then(function () {
	var numOfPosts = this.evaluate(countPosts);
	showPosts(this,numOfPosts);
});


casper.run();
