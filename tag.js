var casper = require('casper').create({
    verbose: true,
    logLevel: "debug"
});
var common = require('common'),
    config = require('config');

var host = config.setUrl();

casper.start(host, function() {
// print list of categories    
 //   var query = 'a[rel="tag"]';
    var tags = common.querySelectorAllinnerHTML.call(this,'a[rel="tag"]');
 //   var tags = this.evaluate(common.querySelectorAllinnerHTML(query),query);

    if (tags.length === 0) {
        this.echo('There are no any tags yet.');
        this.exit();
    }
    this.echo('Tags:\n'+' - ' + tags.join('\n - '));
    
// get list of categories
    var len = this.evaluate(function () {
        return document.querySelectorAll('a[rel="tag"]').length;
    })
// get link to random category  
    var i = common.getRandomInt(0, len);
    var link = this.evaluate(function (i) {
        return document.querySelectorAll('a[rel="tag"]')[i].href;
    }, i);
    this.echo('Chosen tag is '+tags[i] + ' ('+link+')');
    this.open(link);
});

casper.then(function () {
    common.getShowOpenPosts.call(this);
});

casper.then(function () {
    this.echo(this.getCurrentUrl());
});

casper.run();
