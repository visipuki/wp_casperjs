var casper = require('casper').create({
    verbose: true,
    logLevel: "debug"
}),
    common = require('common'),
    config = require('config');

var host = config.setUrl();


casper.start(host, function() {
// print list of categories    
    var cats = common.querySelectorAllinnerHTML.call(this,'aside#categories-2 a');

    this.echo('Categories:\n'+' - ' + cats.join('\n - '));
    
// get list of categories
    var len = this.evaluate(function () {
        return document.querySelectorAll('aside#categories-2 a').length;
    })
// get link to random category  
    var i = common.getRandomInt(0, len);
    var link = this.evaluate(function (i) {
        return document.querySelectorAll('aside#categories-2 a')[i].href;
    }, i);
    this.echo('Chosen category is '+cats[i] + ' ('+link+')');
    this.open(link);
});

casper.then(function () {
    common.getShowOpenPosts.call(this);
});

casper.then(function () {
    this.echo(this.getCurrentUrl());
});

casper.run();
