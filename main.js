var system = require('system');
//casper.options.waitTimeout = 100000;

var casper = require('casper').create({
    verbose: true,
    logLevel: 'debug',
    viewportSize: {width: 800, height: 600},

}),
	utils = require('utils'),
    common = require('common'),
    config = require('config'),
    gen_text = require('gen_text'),
    auth = require('auth-everything'),
    cats = require('categories-everything'),
    comment = require('comment-everything'),
    media = require('media-everything'),
    page = require('page-everything'),
    post = require('post-everything'),
    tags = require('tags-everything'),
	unauth = require('unauth-everything');

// This code makes a screenshot after each step - useful for debugging


state = { 
    'host': config.getUrl(), 
    'url_post': config.getSpecificPostUrl(),
    'allTags': Array(),
    'step_index': 100, 
    'screenshots': false
};

var screenshotsMaker = function (stepResult) {
    if (state.screenshots) {
        casper.capture('screenshots/'+state.step_index+'.png');
        state.step_index ++;
    }
}

var enableOrDisableScreenshots = function () {
    state.screenshots = !state.screenshots;
}

casper.on('screenshots', enableOrDisableScreenshots);
casper.on('step.complete', screenshotsMaker)

function cmd_exec(casper, command) {
    casper.then(function () {
        this.emit('screenshots');
//        utils.dump(command);
//        system.stdout.writeLine(command);
        var cmd_parse = command.split(' ');
        switch (cmd_parse[0]) {
            // value to start
            case 'START':
                break;

            // unauth module actions
            case 'listPostsByArchive':
                unauth.listPostsByArchive(this);
                break;
            case 'openHome':
                unauth.openHome(this);
                break;
            case 'listPostsByFrontPage':
                unauth.listPostsByFrontPage(this);
                break;
            case 'listPostsByCategory':
                unauth.listPostsByCategory(this);
                break;
            case 'listPostsByTag':
                unauth.listPostsByTag(this);
                break;
            case 'search':
                unauth.search(this);
                break;
            case 'comment':
                unauth.comment(this);
                break;
            case 'openHomeFromAdmin':
                unauth.openHomeFromAdmin(this);
                break;

            //  auth module actions
            case 'login':
                auth.login(this, cmd_parse[1], cmd_parse[2]);
                break;
            case 'logoutUpBar':
                auth.logoutUpBar(this);
                break;
//            case 'logoutMetaLeft':
//                auth.logoutMetaLeft(this);
//                break;
            case 'anySort':
                auth.anySort(this);
                break;
            case 'openAdminPage':
                auth.openAdminPage(this);
                break;
            case 'openDashboard':
                auth.openDashboard(this);
                break;
            case 'test':
                auth.test(this);
                break;

            // categories module actions
            case 'createCategories':
                cats.createCategories(this);
                break;
            case 'deleteCategories':
                cats.deleteCategories(this);
                break;
            case 'editCategories':
                cats.editCategories(this);
                break;
            case 'quickEditCategories':
                cats.quickEditCategories(this);
                break;
            case 'bulkActionCategories':
                cats.bulkActionCategories(this);
                break;
            case 'openCategories':
                cats.openCategories(this);
                break;

            // comment module actions
            case 'openSecAll':
                comment.openSecAll(this);
                break;
            case 'openSecPending':
                comment.openSecPending(this);
                break;
            case 'openSecApproved':
                comment.openSecApproved(this);
                break;
            case 'openSecSpam':
                comment.openSecSpam(this);
                break;
            case 'openSecTrash':
                comment.openSecTrash(this);
                break;
            case 'openComments':
                comment.openComments(this);
                break;
            case 'spamComments':
                comment.spamComments(this);
                break;
            case 'aproveOrUnaproveComments':
                comment.aproveOrUnaproveComments(this);
                break;
            case 'quickEditComments':
                comment.quickEditComments(this);
                break;
            case 'replyComments':
                comment.replyComments(this);
                break;
            case 'deleteComments':
                comment.deleteComments(this);
                break;
            case 'notSpamComments':
                comment.notSpamComments(this);
                break;
            case 'bulkComments':
                comment.bulkComments(this);
                break;

            // media module actions
            case 'uploadBrowser':
                media.uploadBrowser(this);
                break;
            case 'uploadMultiFile':
                media.uploadMultiFile(this);
                break;
            case 'editMedia':
                media.editMedia(this);
                break;
            case 'bulkMedia':
                media.bulkMedia(this);
                break;
            case 'deleteMedia':
                media.deleteMedia(this);
                break;
            case 'openLibrary':
                media.openLibrary(this);
                break;

            // page module actions
            case 'createPages':
                page.createPages(this);
                break;
            case 'deletePages':
                page.deletePages(this);
                break;
            case 'fullEditPages':
                page.fullEditPages(this);
                break;
            case 'quickEditPages':
                page.quickEditPages(this);
                break;
            case 'bulkActionPages':
                page.bulkActionPages(this);
                break;
            case 'openPages':
                page.openPages(this);
                break;

            // post module actions
            case 'getAllTags':
                post.getAllTags(this, state.allTags);
                break;
            case 'createPosts':
                post.createPosts(this, state.allTags);
                break;
            case 'fullEditPosts':
                post.fullEditPosts(this, state.allTags);
                break;
            case 'quickEditPosts':
                post.quickEditPosts(this, state.allTags);
                break;
            case 'bulkActionPosts':
                post.bulkActionPosts(this);
                break;
            case 'deletePosts':
                post.deletePosts(this);
                break;
            case 'openPosts':
                post.openPosts(this);
                break;

            // tag module actions
            case 'createTag':
                tags.createTag(this);
                break;
            case 'deleteTag':
                tags.deleteTag(this);
                break;
            case 'editTag':
                tags.editTag(this);
                break;
            case 'quickEditTag':
                tags.quickEditTag(this);
                break;
            case 'bulkActionTags':
                tags.bulkActionTags(this);
                break;
            case 'openTags':
                tags.openTags(this);
                break;

            // common module actions
            case 'openHost':
                common.openHost(this, state.host);
                break;

/*           
            case 'openHome':
                unauth.openHome(this);
                break;
            case 'openHome':
                unauth.openHome(this);
                break;
            case 'openHome':
                unauth.openHome(this);
                break;
*/
            default:
                this.log('default branch in cmd_exec', 'error');
                break;
        }
    });
    casper.then(function () {
        this.emit('screenshots');
        system.stdout.writeLine('');
        system.stdout.writeLine('Type command: ');
        system.stdout.flush();
        var cmd = system.stdin.readLine();
        cmd = cmd.replace('\n', '');
        system.stdout.writeLine(cmd);
        if (cmd !== 'STOP')
            cmd_exec(casper, cmd);
        this.capture('screenshots/'+state.step_index+'.png'); // last screen
    });
}

casper.start(state.host);

casper.then(function () {
    system.stdout.writeLine('Start entering commands (type "STOP" to finish): ');
    cmd_exec(this, 'START');
});

casper.run();


/*
casper.then(function () {
	common.openAdminPage(this);
});

casper.then(function () {
	this.clickLabel('Tags', 'a');
});

casper.then(function () {
	this.echo(this.getCurrentUrl());
	post.getAllTags(this, state.allTags);
});

casper.thenOpen(state.host, function () {
	this.log('LOOK-main', 'warning');
	utils.dump(state);
	common.openAdminPage(this);
})

casper.then(function (){
	post.openPosts(this);
});

casper.then(function () {
	common.changePage(this);
});

casper.then(function () {
	post.quickEditPosts(this, state.allTags);
});

casper.then(function () {

});

casper.run();
*/
