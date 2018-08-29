var casper = require('casper').create({
    verbose: true,
    logLevel: 'debug',
    viewportSize: {width: 800, height: 600}
}),
	utils = require('utils'),
    common = require('common'),
	config = require('config'),
	gen_text = require('gen_text');

// This code makes a screenshot after each step - useful for debugging
var step_index = 10;
casper.on('step.complete', function(stepResult) {
    casper.capture('screenshots/post-quick-edit/'+step_index+'.png');
    step_index ++;
});


// global variables
var host = config.setUrl(),
	host2 = config.setSpecialTableUrl();

function anySort(casper) {
	var sorts = casper.evaluate(function () {
		return document.querySelectorAll('table thead th > a').length;
	});
	if (sorts > 0) {
		var idx = common.getRandomInt(0, sorts);
		var link = casper.evaluate(function (i) {
			return document.querySelectorAll('table thead th > a')[i].href;
		}, idx);
		casper.echo(utils.format('%d(%d)', idx+1, sorts));
		casper.thenOpen(link);
	} else {
		casper.log('No columns to sort.', 'warning');
	}
}

casper.start(host, function() {
	common.checkLoggedIn.call(this);
});

// go to wp-admin
casper.thenOpen(host2);

// ADD HERE PROCONDITION

casper.then(function () {
	anySort(this);
});

casper.then(function () {
	this.echo('now sorted');
});

// ADD HERE POSTCONDITION

casper.run();
