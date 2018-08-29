// Module with settings
var require = patchRequire(require);

var host = 'http://wp.local/';
var username = 'user';
var password = 'q1q1Q!Q!';
var spec_host = host+'?p=14';
var table_url = host+'wp-admin/edit.php';
var media_path = 'media-upload/';

exports.getUrl = function (path) {
    if(typeof(path)==='undefined') path = '';
    return host+path;
};

exports.setUrl = function (value) {
	host = value;
}

exports.getMediaPath = function() {
    return media_path;
};

exports.getUsername = function () {
    return username;
};

exports.setUsername = function (value) {
	username = value;
}

exports.getPassword = function () {
    return password;
};

exports.setPassword = function (value) {
	password = value;
}

exports.getSpecificPostUrl = function () {
    if(typeof(path)==='undefined') path = '';
    return spec_host+path;
};

exports.setSpecificPostUrl = function (value) {
    spec_host = value;
};

exports.getSpecificTableUrl = function () {
    if(typeof(path)==='undefined') path = '';
    return table_url+path;
}

exports.setSpecificTableUrl =function (value) {
	table_url= value;
}
