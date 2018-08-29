var casper = require('casper').create({
    verbose: true,
    logLevel: "debug"
}),
    common = require('common'),
	config = require('config');

var host = config.setUrl();

function logout() {
	var links = document.querySelectorAll('aside#meta-2 a');
	for (var i = 0; i < links.length; i++) {
		if (links[i].innerHTML === "Log out") {
			return links[i].href;
		}
	}
}

casper.start(host, function() {
	common.checkLoggedIn.call(this);
	this.open(this.evaluate(logout));
});
casper.then(function () {
	common.checkLoggedIn.call(this,1);
});

casper.run();