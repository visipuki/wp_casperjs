var casper = require('casper').create({
    verbose: true,
    logLevel: "debug"
}),
    common = require('common'),
	config = require('config');

var host = config.setUrl();

casper.start(host, function() {
	common.checkLoggedIn.call(this);
});
casper.thenClick('li#wp-admin-bar-logout a', function () {
	common.checkLoggedIn.call(this,1);
});

casper.run();