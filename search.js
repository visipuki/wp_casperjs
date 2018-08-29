var casper = require('casper').create({
    verbose: true,
    logLevel: "debug"
});
var common = require('common'),
    config = require('config');

var host = config.setUrl();

var search_string, 
    search_res;

//take search_string from command line or from list of random values
if (casper.cli.has('query')) {
    search_string = casper.cli.raw.get('query');
} else {
    search_string = common.getRandomWord();
}

casper.start(host, function() {
    this.fill('form.search-form',{
        's': search_string
    },true);
});
casper.then(function() {
    this.echo('Query: '+search_string);
    common.getShowOpenPosts.call(this);
});
casper.then(function() {
    this.echo(this.getCurrentUrl());
});

casper.run();