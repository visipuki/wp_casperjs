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
var media_path = config.getMediaPath();
//var file = '/home/novi4ok/basic-scripts/21-06/media/post-quick-edit/12.png';

function uploadMultiFile(casper) {
	casper.then(function () {
		var file = media_path + common.getRandomMedia();
		this.fillSelectors('form#file-form', {
			'input[multiple="multiple"]': file
		}, false);
	});

	casper.then(function () {
		casper.waitForSelector('div[class="filename new"]', null, function () {}, 10000);
	});
	casper.then(function () {
		this.echo(this.getCurrentUrl());
	});
}

casper.start(host, function () {
	common.checkLoggedIn.call(this);
});

// go to wp-admin
casper.thenClick('li#wp-admin-bar-site-name > a');

// go to media (library)
casper.thenClick('li#menu-media a.wp-first-item');

// go to add media
casper.thenClick('a.add-new-h2');


casper.then(function () {
	uploadMultiFile(this);
});

casper.run();