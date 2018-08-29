var require = patchRequire(require);

var common = require('common'),
    utils = require('utils');
    config = require('config');

/*
 from main page (/) gets a list of tags
 chooses one randomly, gets list of appropriate posts
 and opens one randomly
 gets casper instance
*/
exports.listPostsByTag = function (casper) {
    casper.then(function () {
        // print list of categories    
        var tags = common.querySelectorAllinnerHTML(this,'a[rel="tag"]');

        if (tags.length === 0) {
            this.echo('There are no any tags yet.');
            return;
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
        common.getShowOpenPosts(casper);
    });
}


/*
 from main page (/) gets a list of categories
 chooses one randomly, gets list of appropriate posts
 and opens one randomly
 gets casper instance
*/
exports.listPostsByCategory = function (casper) {
    casper.then(function () {
    //  print list of categories    
        var cats = common.querySelectorAllinnerHTML(this,'section#categories-2 a');

        this.echo('Categories:\n'+' - ' + cats.join('\n - '));
        
    //  get list of categories
        var len = this.evaluate(function () {
            return document.querySelectorAll('section#categories-2 a').length;
        })
    //  get link to random category  
        var i = common.getRandomInt(0, len);
        var link = this.evaluate(function (i) {
            return document.querySelectorAll('section#categories-2 a')[i].href;
        }, i);
        this.echo('Chosen category is '+cats[i] + ' ('+link+')');
        this.open(link);       
    });
    casper.then(function () {
        common.getShowOpenPosts(casper);
    });
}

/*
 from main page (/) gets a list of pages
 chooses one randomly, gets list of appropriate posts
 and opens one randomly
 gets casper instance
*/
exports.listPostsByFrontPage = function (casper) {
    casper.then(function () {
        //print list of categories    
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
        
    //  get link to random category  
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
        common.getShowOpenPosts(casper);
    });
}

/*
 from main page (/) gets a list of archieves
 chooses one randomly, gets list of appropriate posts
 and opens one randomly
 gets casper instance
*/
exports.listPostsByArchive = function (casper) {
    casper.then(function () {
        // print list of categories    
        var archs = common.querySelectorAllinnerHTML(this,'section#archives-2 a');

        this.echo('Archives:\n'+' - ' + archs.join('\n - '));
        
        // get list of categories
        var len = this.evaluate(function () {
            return document.querySelectorAll('section#archives-2 a').length;
        })
        // get link to random category  
        var i = common.getRandomInt(0, len);
        var link = this.evaluate(function (i) {
            return document.querySelectorAll('section#archives-2 a')[i].href;
        }, i);
        this.echo('Chosen archive is '+archs[i] + ' ('+link+')');
        this.open(link);    
    });
    casper.then(function () {
        common.getShowOpenPosts(casper);
    });
}


/*
 sends search request from main page (/) 
 gets casper instance
 current web-page must be main
 searching request is chosen randomly
*/
exports.search = function (casper) {
    var search_string = common.getRandomWord();
    casper.then(function () {
        this.fill('form.search-form', {
            's': search_string
        }, true);
    });

    casper.then(function() {
        this.echo('Query: ' + search_string);
        common.getShowOpenPosts(this);
    });
}

/*
 leaves comment to the current post or comments of the current post
 gets casper instance
 current webpage must content single post
 all comment fields filled with random values
*/
exports.comment = function (casper) {
    var mode = 0, // mode can be 0 (leave comment to post) or 1 (leave comment to another comment)
        comment_text = gen_text.getRandomTextLetters(20, 200), 
        name = common.getRandomName(),
        email = common.getRandomEmail(),
        website = common.getRandomWebsite();

    casper.then(function () {
        // check that page is correct
        var check = this.evaluate(function () {
            return document.querySelectorAll('div.comment-respond').length;
        });
        if (check === 0) {
            this.echo('No comment field!');
            return;
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
        this.echo(utils.format('Chosen mode is %d (0: commenting post; 1:commenting comment)', mode));

        if (mode === 0) { // to post
            this.fill('form.comment-form',{
                'author': name,
                'email': email,
                'url': website,
                'comment': comment_text
            }, true);

        } else { // to another comment
            var i = common.getRandomInt(0,numOfComments); // choose random comment to comment it
            var link = this.evaluate(function (i) { // get reply link
                return document.querySelectorAll('a.comment-reply-link')[i].click();
            },i);
//            link = this.getCurrentUrl().substr(0,this.getCurrentUrl().indexOf('/?')) + link;
  //          this.open(link);
            this.wait(100);
            this.then(function () {
                this.fill('form.comment-form',{
                    'author': name,
                    'email': email,
                    'url': website,
                    'comment': comment_text
                }, true);           
            });
        }
        
    });
    
    casper.then(function () {
    	this.wait(3000);
    });

    casper.then(function () {
	if (this.getCurrentUrl().indexOf('#') === -1) {
            this.echo('Comment failed');
        } else {
            this.echo('Comment succeeded');
        }

    });    

    casper.then(function () {
	exports.openHome(this);    
    });
}

exports.openHome = function (casper) {
    casper.click('a[rel="home"]');
//  casper.click('p.site-title a');
}

exports.openHomeFromAdmin = function () {
    casper.click('li#wp-admin-bar-site-name > a');
}
