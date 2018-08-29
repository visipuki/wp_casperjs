var casper = require('casper').create({
    verbose: true,
    logLevel: "debug"
});
var common = require('common'),
    config = require('config');


var host = config.setUrl(),
    login = config.getLogin(),
    passw = config.getPassword();

if (casper.cli.has('pass'))
    passw = casper.cli.raw.get('pass');
if (casper.cli.has('login'))
    login = casper.cli.raw.get('login');

// returns the link to log in from main wordpress page
function auth() {
    var link,links = document.querySelectorAll('#meta-2 a');
    for (var i = 0; i < links.length; i++){
        if (links[i].innerHTML === 'Войти' || links[i].innerHTML === 'Log in') {
            link = links[i].href;
            casper.echo(link);
        }
    }
    return link;
}

casper.start(host, function() {
    common.checkLoggedIn.call(this,2);
    var link = this.evaluate(auth); 
    this.open(link);
});

casper.then(function() {
    this.echo(this.getTitle());
    this.click('#rememberme');
    this.fill('form#loginform',{
        'log': login,
        'pwd': passw
    }, true);
    this.wait(1000); // this delay helps to log in
});

casper.thenOpen(host,function() {
    common.checkLoggedIn.call(this,1);
});

casper.run();
