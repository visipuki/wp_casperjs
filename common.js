// Module with common functions and solutions

var require = patchRequire(require);

// special constants
var list_of_names = ["Jacob", "Emily", "Michael", "Emma", "Joshua", "Madison", "Matthew", "Olivia", "Ethan", "Hannah", "Andrew", "Abigail", "Daniel", "Isabella", "William", "Ashley", "Joseph", "Samantha", "Christopher", "Elizabeth", "Anthony", "Alexis", "Ryan", "Sarah", "Nicholas", "Grace", "David", "Alyssa", "Alexander", "Sophia", "Tyler", "Lauren", "James", "Brianna", "John", "Kayla", "Dylan", "Natalie", "Nathan", "Anna", "Jonathan", "Jessica", "Brandon", "Taylor", "Samuel", "Chloe", "Christian", "Hailey", "Benjamin", "Ava", "Zachary", "Jasmine", "Logan", "Sydney", "Jose", "Victoria", "Noah", "Ella", "Justin", "Mia", "Elijah", "Morgan", "Gabriel", "Julia", "Caleb", "Kaitlyn", "Kevin", "Rachel", "Austin", "Katherine", "Robert", "Megan", "Thomas", "Alexandra", "Connor", "Jennifer", "Evan", "Destiny", "Aidan", "Allison", "Jack", "Savannah", "Luke", "Haley", "Jordan", "Mackenzie", "Angel", "Brooke", "Isaiah", "Maria", "Isaac", "Nicole", "Jason", "Makayla", "Jackson", "Trinity", "Hunter", "Kylie", "Cameron", "Kaylee", "Gavin", "Paige", "Mason", "Lily", "Aaron", "Faith", "Juan", "Zoe", "Kyle", "Stephanie", "Charles", "Jenna", "Luis", "Irea", "Adam", "Riley", "Brian", "Katelyn", "Aiden", "Angelina", "Eric", "Kimberly", "Jayden", "Madeline", "Alex", "Mary", "Bryan", "Leah", "Sean", "Lillian", "Owen", "Michelle", "Lucas", "Amia", "Nathaniel", "Sara", "Ian", "Sofia", "Jesus", "Jordan", "Carlos", "Alexa", "Adrian", "Rebecca", "Diego", "Gabrielle", "Julian", "Caroline", "Cole", "Vanessa", "Ashton", "Gabriella", "Steven", "Avery", "Jeremiah", "Marissa", "Timothy", "Ariana", "Chase", "Audrey", "Devin", "Jada", "Seth", "Autumn", "Jaden", "Evelyn", "Colin", "Jocelyn", "Cody", "Maya", "Landon", "Arianna", "Carter", "Isabel", "Hayden", "Amber", "Xavier", "Melanie", "Wyatt", "Diana", "Dominic", "Danielle", "Richard", "Sierra", "Antonio", "Leslie", "Jesse", "Aaliyah", "Blake", "Erin", "Sebastian", "Amelia", "Miguel", "Molly", "Jake", "Claire", "Alejandro", "Bailey", "Patrick", "Melissa"];
var list_of_emails = ["0165offad@att.net", "a.c.department@hotmail.co.za", "a939020011@yahoo.com", "aa05547@gmail.com", "aarifaebue@hotmail.com", "abaldossou@ymail.com", "abdelsalamsanusi@rediffmail.com", "abdul_ahmedramzi@yahoo.com", "abdulahmedramzi@yahoo.com", "abigail.edwards10@yahoo.com", "abujoseph44@gmail.com", "abusalif77@voila.fr", "accdetailsss@yahoo.co.jp", "ad.keita96@msn.com", "adamakeita@voila.fr", "adamson.g@myself.com", "adnicaptain@blumail.org", "affendighani@one.co.il", "ahhmedkairo0190@msn.com", "ahhmedkairo0206@msn.com", "ahmedkairo@voila.fr", "akitobakulaje1@yahoo.com", "akitobakulaje4@yahoo.com", "albetaoure@gmail.com", "alexhopkins33@yahoo.com", "alhassanemohamedi@gmail.com", "ali.buba@yahoo.com", "alimata01@gmail.com", "aliyiageorge2012@yahoo.com", "allexpeters@yahoo.com.ph", "allji.muhm@msn.com", "almuhammedagencyltd@msn.com", "ambassadorhamzatahmadu491@googlemail.com", "ambolugashiru@yahoo.co.jp", "ambssodorterencemcculley@hotmail.com", "amos_utuama@yahoo.com", "amoussou.drbruno@yahoo.com", "andersondarrelc@yahoo.com", "angela_mayer4281@msn.com", "anicontact@yeah.net", "animationtech@163.com", "anmariekone1@yahoo.fr", "anna.ibite@yahoo.com", "anna_ibite1011141@msn.com", "anthonyhill1965@hotmail.co.uk", "astralainlot01@aol.com", "atm_paymat_department11@yahoo.dk", "attorneyteddytucker@gmail.com", "attorneytucker3@gmail.com", "au.seafa@yahoo.com", "aziz_mohamed12@hotmail.com", "azizissa181@voila.fr", "baby4love31@yahoo.com", "baileydaugherty@gmail.com", "barrister_victor.otu68@yahoo.com", "barristerfelix04@gmail.com", "barristergeorgd222@mail.kz", "barristergeorgdchambergh25@gmail.com", "barristergeorge100@gmail.com", "barristergeorgeudumachamber01@yahoo.com", "barrmosesedward1980@gmail.com", "barrvictor08@hotmail.co.uk", "bbcpayslive12@live.co.uk"];
var voc_list = ["BMW", "Sport", "little monkey", "Украин", "fclm", "history", "planet", "Тема", "развитие"];
var voc_list_new = ["time", "year", "people", "way", "day", "man", "thing", "woman", "life", "child", "world", "school", "state", "family", "student", "group", "country", "problem", "hand", "part", "place", "case", "week", "company", "system", "program", "question", "work", "government", "number", "night", "point", "home", "water", "room", "mother", "area", "money", "story", "fact", "month", "lot", "right", "study", "book", "eye", "job", "word", "business", "issue", "side", "kind", "head", "house", "service", "friend", "father", "power", "hour", "game", "line", "end", "member", "law", "car", "city", "community", "name", "president", "team", "minute", "idea", "kid", "body", "information", "back", "parent", "face", "others", "level", "office", "door", "health", "person", "art", "war", "history", "party", "result", "change", "morning", "reason", "research", "girl", "guy", "moment", "air", "teacher", "force", "education"];
var list_of_media_files = ["pict_0001.jpg", "pict_0002.jpg", "pict_0003.jpg", "pict_0004.jpg", "pict_0005.jpg", "pict_0006.jpg", "pict_0007.jpg"];
var list_of_websites = ['google.com', 'facebook.com', 'youtube.com', 'yahoo.com', 'wikipedia.org', 'qq.com', 'taobao.com', 'twitter.com', 'live.com', 'amazon.com', 'linkedin.com', 'google.co', 'sina.com.cn14', 'hao123.com', 'weibo.com', 'blogspot.com', 'tmall.com', 'sohu.com', 'yahoo.co', 'vk.com', 'yandex.ru', 'wordpress.com', 'bing.com', 'ebay.com', 'google.de', 'pinterest.com', '360360.cn', 'google.co', 'google.fr', 'instagram.com', 'google.co', '163.com', 'soso.com', 'ask.com', 'msn.com', 'tumblr.com', 'mail.ru', 'xvideos.com', 'microsoft.com', 'google.ru', 'PayPal.com', 'google.it', 'google.es', 'apple.com', 'imdb.com', 'adcash.com', 'imgur.com', 'craigslist.org', 'neobux.com', 'amazon.co', 't.co', 'reddit.com', 'xhamster.com', 'stackoverflow.com', 'fc2.com', 'google.ca', 'go.com', 'bbc.co.uk', 'cnn.com', 'ifeng.com', 'aliexpress.com', 'people.com.cn', 'xinhuanet.com', 'blogger.com', 'adobe.com', 'vube.com', 'alibaba.com', 'google.com', 'odnoklassniki.ru', 'godaddy.com', 'googleusercontent.com', 'huffingtonpost.com', 'pornhub.com', 'wordpress.org', 'kickass.to', 'thepiratebay.se', 'amazon.de', 'youku.com', 'Chinadaily.cn', 'netflix.com', 'ebay.de', 'google.pl', 'gmw.cn', 'dailymotion.com', 'Akamaihd.net', 'Clkmon.com', 'alipay.com', 'about.com', 'bp.blogspot.com', 'dailymail.co.uk', 'rakuten.co.jp', 'xnxx.com', 'indiatimes.com'];

// returns random int number in range [min,max)
exports.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};

// returns random name from list_of_names
exports.getRandomName = function () {
    return list_of_names[exports.getRandomInt(0, list_of_names.length)];
};

// returns random website from list_of_websites
exports.getRandomWebsite = function () {
    return list_of_websites[exports.getRandomInt(0, list_of_websites.length)];
}

// returns random name of media file from list_of_media_files 
// files must be stored in ./media/ subdirectory 
exports.getRandomMedia = function () {
    return list_of_media_files[exports.getRandomInt(0, list_of_media_files.length)];
}

// returns random email from list_of_emails
exports.getRandomEmail = function () {
    return list_of_emails[exports.getRandomInt(0, list_of_emails.length)];
};

// return random word
exports.getRandomWord = function () {
	return voc_list_new[exports.getRandomInt(0, voc_list_new.length)];
}

// refresh current page without get parameters
exports.refresh = function (casper) {
    casper.then(function () {
        var u = this.getCurrentUrl();
        this.open(u.substr(0, u.indexOf('?')));
    });
}

// returns list document.querySelectorAll (sel) presented by innerHTML value
exports.querySelectorAllinnerHTML = function(casper, sel) {
	return casper.evaluate(function (sel) {
	    var res = document.querySelectorAll(sel);
	    return Array.prototype.map.call(res, function(e) {
	        return e.innerHTML;
	    });
    }, sel);
};

// current page has list of posts, function shows list of posts, choose random post and open it
exports.getShowOpenPosts = function (casper) {
    // get list of found headers
    var posts = exports.querySelectorAllinnerHTML(casper,'h2.entry-title a');
    casper.echo('Posts:\n'+' - ' + posts.join('\n - '));
    if ((posts.length === 0) || (typeof(posts.length) !== "number")) {
    	casper.echo('There are no any posts.');
        return ;
    }
    // get list of links to found posts
    var len = casper.evaluate(function () {
        return document.querySelectorAll('h2.entry-title a').length;
    });
    len = exports.getRandomInt(0,len);
    
    // choose random link
    var link = casper.evaluate(function (i) {
        return document.querySelectorAll('h2.entry-title a')[i].href;
    }, len);
    casper.echo('Chosen post is ' + posts[len] + ' ('+link+')');
    config.setSpecificPostUrl(link);
    casper.open(link);
};

// check if session is logged, if not - exit
// mode = 0 - exit if logged out
//		= 1 - not exit
// 		= 2 - exit if logged in

exports.checkLoggedIn = function (casper, mode) {
	if(typeof(mode)==='undefined') mode = 1;
    var res = casper.evaluate(function() {
        var res, log = document.querySelector('span.display-name'); // find username info
        if (log !== null) {
            res = log.innerHTML;
        } else {
            res = 0;
        }
        return res;
    });
    if (res === 0) {
    	casper.echo('You are not logged in.');
    	if (mode === 0)
    		casper.exit();
        return false;
    } else {
    	casper.echo('You are logged in as '+res+'.');
    	if (mode === 2)
    		casper.exit();
        return true;
    }
}

/*
 if there are several pages insome table (of posts, comments, etc)
 function chooses onerandomly and opens it
 gets casper instance
*/ 
exports.changePage = function (casper) {
    var total_pages = casper.evaluate(function () {
        return document.querySelector('span.total-pages').innerHTML;
    });
    casper.echo(utils.format('Pages: %d', total_pages));
    var page = common.getRandomInt(0, total_pages) + 1;
    casper.echo(utils.format('Chosen page: %d', page));
    casper.evaluate(function (page) {
        document.querySelectorAll('input.current-page')[0].setAttribute('value', page);
    }, page);
    casper.thenClick('div[class="tablenav top"] input#doaction');
}

// randomly fills select
exports.fillSelect = function (casper, selector) {
// return number of options for provided select tag
// this is used to prevent counting invisible tags: 
//      document.querySelectorAll(selector)[0]
    var len = casper.evaluate(function (selector) {
        return document.querySelectorAll(selector)[0].
            querySelectorAll('option').length;
    }, selector);
// choose random option with equal probability
    var idx = common.getRandomInt(0, len);
// match this option
    casper.evaluate(function (i, selector) {
        document.querySelectorAll(selector)[0].selectedIndex = i;
    }, idx, selector);  
}

exports.makeCheck = function (casper, selector) {
    var act = common.getRandomInt(0,2);
    if (act === 1) {
        casper.evaluate(function () {
            document.querySelectorAll(selector)[0].click();
        });
    }
}

exports.openHost = function (casper, host) {
    casper.open(host);
}
