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
                'form#posts-filter textarea.tax_input_post_tag',
                casper.page.event.key.End,
                {reset: false, keepFocus: true, modifiers: "ctrl"}
            );
        });
		if (j == 0 && tags.length > 1) { // Not the first tag, add comma
            casper.then(function () {
                casper.sendKeys(
                    'form#posts-filter textarea.tax_input_post_tag', 
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
                            'form#posts-filter textarea.tax_input_post_tag', 
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
                'form#posts-filter textarea.tax_input_post_tag',
                ', ',
                {reset: false}
            )
            casper.waitWhileVisible('ul.ac_results', null, null, 1500);
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
	// get tags of current post
/*
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
*/
	var tags = [];
	casper.echo(utils.format('Current tags:\n - %s', tags.join('\n - ')));

	// work with tags
	addNewTags(casper, allTags, tags);
// fill all select-option tags
	fillSelect(casper, 'select.authors');
	fillSelect(casper, 'select[name="comment_status"]');
	fillSelect(casper, 'select[name="_status"]');
	fillSelect(casper, 'select[name="post_format"]');
	fillSelect(casper, 'select[name="ping_status"]');
	fillSelect(casper, 'select[name="sticky"]');
// apply changings	

	casper.thenClick('input#bulk_edit');
// if ajax-response changes DOM this works			
	casper.waitForSelector('div#message', null, null, 1500);
}

function bulkActionPosts(casper, numOfPosts) {
	casper.echo('Bulk actions on posts...');
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
		var modes = common.querySelectorAllinnerHTML.call(
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
		return op;
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
	var operation = bulkActionPosts(this, numOfPosts);
	this.then(function () {
		this.echo('operation: ' + operation);
		switch (operation) {
			case 0: // bulk action
				break;
			case 1: // edit
				editPosts(this, numOfPosts, allTags);
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
	var numOfPosts = this.evaluate(countPosts);
	showPosts(this,numOfPosts);
});


casper.run();