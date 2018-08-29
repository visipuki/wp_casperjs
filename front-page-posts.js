var casper = require('casper').create({
    verbose: true,
    logLevel: "debug"
});
var common = require('common'),
    config = require('config');

var host = config.setUrl();


casper.start(host, function() {
// print list of categories    
    var pages = this.evaluate(function(){
        var res = document.querySelectorAll('a[class="page-numbers"]');
        return Array.prototype.map.call(res, function(e) {
            return e.href;
        });
    });

    this.echo('Pages:\n'+' - 1 (' + this.getCurrentUrl()+')');//+' - ' +  + pages.join('\n - '));
    for (var i = 0; i < pages.length; i++) {
        this.echo(' - '+(i+2)+' ('+pages[i]+')');
    }
    
// get link to random category  
    var i = common.getRandomInt(0, pages.length+1);
    var link = this.evaluate(function (i) {
        return document.querySelectorAll('a[class="page-numbers"]')[i].href;
    }, i);
    if (i === pages.length) {
        link = this.getCurrentUrl();
        this.echo('Chosen page is 1 ('+link+')');
    } else {
        this.echo('Chosen page is '+(i+2) + ' ('+link+')');
    }
    this.open(link);
});

casper.then(function () {
    common.getShowOpenPosts.call(this);
});

casper.then(function () {
    this.echo(this.getCurrentUrl());
});

casper.run();
