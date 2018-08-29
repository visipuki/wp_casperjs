var casper = require('casper').create({
    verbose: true,
    logLevel: "debug"
}),
    common = require('common'),
	config = require('config'),
	gen_text = require('gen_text');


var host = config.setSpecificPostUrl(),
    mode = 0, // mode can be 0 (leave comment to post) or 1 (leave comment to another comment)
    comment_text = gen_text.getRandomText(1,20,200), // 1st arg means MODE (0-words, 1-letter), 2nd and 3rd args mean result length [arg2, arg3]
	name = common.getRandomName(),
	email = common.getRandomEmail(),
	website = 'facebook.com';

casper.start(host, function () {
// check that page is correct
    var check = this.evaluate(function () {
	    return document.querySelectorAll('div.comment-respond').length;
	});
	if (check === 0) {
		this.echo('No comment field!');
	    this.exit();
	}
// get current amount of comments
    var numOfComments = this.evaluate(function () {
	    return document.querySelectorAll('ol.comment-list li').length;
	});
// decide what we are going to comment
    if (numOfComments === 0) {
	    mode = 0;
	} else {
	    mode = common.getRandomInt(0,2);
	}
// decide put website (1) or not (0)
    if (common.getRandomInt(0,2) === 1) {
	    website = '';
	}
// posting comment
	this.echo('Chosen mode is '+mode+' (0-post; 1-comment)');

    if (mode === 0) { // to post
        this.fill('form.comment-form',{
		    'author': name,
			'email': email,
			'url': website,
			'comment': comment_text
		},false);

	} else { // to another comment
	    var i = common.getRandomInt(0,numOfComments); // choose random comment to comment it
		var link = this.evaluate(function (i) { // get reply link
			return document.querySelectorAll('a.comment-reply-link')[i].href;
		},i);
		link = this.getCurrentUrl().substr(0,this.getCurrentUrl().indexOf('/?')) + link;
		this.open(link).then(function () {
	        this.fill('form.comment-form',{
			    'author': name,
				'email': email,
				'url': website,
				'comment': comment_text
			},false);			
		});
	}
	this.wait(1000);
	
});

casper.thenClick('input#submit', function () {
	if (this.getCurrentUrl().indexOf('#') === -1) {
		this.echo('Comment failed');
	} else {
		this.echo('Comment succeeded');
	}

});

casper.run();
