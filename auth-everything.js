var require = patchRequire(require);

var common = require('common'),
    utils = require('utils');
    config = require('config');


function auth() {
    var link,links = document.querySelectorAll('#meta-2 a');
    for (var i = 0; i < links.length; i++){
        if (links[i].innerHTML === 'Войти' || links[i].innerHTML === 'Log in') {
            link = links[i].href;
        }
    }
    return link;
}

exports.login = function (casper, username, passw) {
    if (typeof(username) === 'undefined') username = config.getUsername();
    if (typeof(passw) === 'undefined') passw = config.getPassword();

    casper.then(function () {
        if (common.checkLoggedIn(this) === true) {
            this.echo('You are already logged in.');
            this.exit();
        }
        var link = this.evaluate(auth); 
        this.open(link);
    });
    casper.then(function () {
        this.echo(this.getTitle());
        this.click('#rememberme');
        this.fill('form#loginform',{
            'log': username,
            'pwd': passw
        }, true);
    });
    casper.then(function () {
        this.waitFor( function check_auth() {
                return this.evaluate(function () {
                    return document.querySelectorAll('div.wp-menu-name').length !== 0 || 
                        document.querySelectorAll('div#login_error').length !== 0;
                });
            }); 
    });
}

exports.logoutUpBar = function (casper) {
    common.checkLoggedIn(casper, 0);
    casper.mouse.move('li#wp-admin-bar-my-account');
    casper.waitUntilVisible('li#wp-admin-bar-logout a', function() {
        casper.thenClick('li#wp-admin-bar-logout a');
    });
}

exports.logoutMetaLeft = function (casper) {
    common.checkLoggedIn(casper, 0);
    casper.thenOpen(casper.evaluate(function () {
        var links = document.querySelectorAll('aside#meta-2 a');
        for (var i = 0; i < links.length; i++) {
            if (links[i].innerHTML === "Log out") {
                return links[i].href;
            }
        }
    }));
}

exports.anySort = function (casper) {
    var sorts = casper.evaluate(function () {
        return document.querySelectorAll('table thead th > a').length;
    });
    if (sorts > 0) {
        var idx = common.getRandomInt(0, sorts); // choose random sorting column
        var link = casper.evaluate(function (i) {
            return document.querySelectorAll('table thead th > a')[i].href;
        }, idx);
        casper.echo(utils.format('%d(%d)', idx+1, sorts));
        casper.thenOpen(link);
    } else {
        casper.log('No columns to sort.', 'warning');
    }
}

// opens admin page randomly by different ways from unauth page
exports.openAdminPage = function (casper) {
    // click top bar link to dashboard
    act = common.getRandomInt(0, 2);
    switch (act) {
        case 0: 
            casper.thenClick('li#wp-admin-bar-site-name > a');
            break;
        case 1:
            casper.then(function () {
                this.clickLabel('Site Admin', 'a');
            });
            break;
    }
}


// opens dashboard admin page from any auth page
exports.openDashboard = function (casper) {
    casper.click('li#menu-dashboard > ul.wp-submenu a');
    casper.waitFor(function check_dash() {
        return this.evaluate(function () {
            return document.querySelectorAll('div.wrap > h2')[0].innerHTML === 'Dashboard';
        });
    });
//    casper.waitForSelectorTextChange('div.wrap > h2', null, function () {}, 5000);
}
