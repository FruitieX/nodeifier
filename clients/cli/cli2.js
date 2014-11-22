var clc = require('cli-color');
var clc_color = require(__dirname + '/clc-color.js');

var config = require(process.env.HOME + '/.nodifier/config.js');
var inspect = require('util').inspect;

var printEntries = function() {
    _.each(_.sortBy(_.keys(categories), function(category) {
        return config.categories.indexOf(category) * -1;
    }), printCategory);
};

var printCategory = function(category) {
    process.stdout.write('\n' + category + ':');
    // descending sort by date, then print entries in order
    _.each(_.sortBy(categories[category], 'date'), printEntry);
};

var printEntry = function(entry, index) {
    var app_color = clc_color.def_app_color;
    if(entry.appfg || entry.appbg)
        app_color = clc_color.color_from_text(entry.appfg, entry.appbg);
    var context_color = clc_color.def_context_color;
    if(entry.contextfg || entry.contextbg)
        context_color = clc_color.color_from_text(entry.contextfg, entry.contextbg);

    var date_string;
    if(entry.date) {
        var date_arr = new Date(entry.date).toString().split(' ');
        date_string = date_arr[1] + ' ' + date_arr[2] + ' ';
    } else {
        date_string = Array(8).join(' ');
    }

    var pos_string = index.toString();

    // find length of string before entry.text, shorten entry.text if
    // wider than our terminal
    var app_string = ''; context_string = '';
    if(entry.app)
        app_string = ' ' + entry.app + ' ';
    if(entry.context)
        context_string = ' ' + entry.context + ' ';

    var pre_text = date_string + ' ' + pos_string + ' ' + app_string + context_string + ' ';
    var text_length = entry.text.length;
    var text = entry.text
    if(pre_text.length + text_length > process.stdout.columns)
        text = text.substr(0, process.stdout.columns - pre_text.length - 3) + '...';

    process.stdout.write('\n');
    process.stdout.write(clc_color.date_color(date_string) + clc_color.id_color(' ' + pos_string + ' ') + app_color(app_string) + context_color(context_string) + ' ' + text);
};

/*
socket.send('set', {
    category: "wip",
    text: "foo bar",
    app: "mail",
    context: "gmail"
});
*/

// networking
var netEvent = require('net-event');
var fs = require('fs');
var _ = require("underscore");

var options = {
    host: config.host,
    port: config.port,
    tls: config.tls,
    key: fs.readFileSync(process.env.HOME + '/.nodifier/nodifier-key.pem'),
    cert: fs.readFileSync(process.env.HOME + '/.nodifier/nodifier-cert.pem'),
    ca: fs.readFileSync(process.env.HOME + '/.nodifier/nodifier-cert.pem'),
    rejectUnauthorized: config.rejectUnauthorized
};

var socket = new netEvent(options);
var categories = [];

socket.on('set', function(data) {
    if(data.err) {
        console.log(inspect(data.err));
        return;
    }

    categories = _.groupBy(data.entries, 'category');
    printEntries();
});

socket.send('get', {
    query: {},
    options: {
        sort: "category"
    }
});

var onexit = function() {
    socket.close();
    process.stdout.write('\x1b[?25h'); // enable cursor
    process.stdout.write('\u001B[2J\u001B[0;0f'); // clear terminal
    process.exit();
};
process.on('SIGINT', onexit); process.on('exit', onexit);

// q or ctrl-c pressed: run onquit
process.stdin.on('data', function(key) {
    if(key == 'q' || key == '\u0003') onquit();
});

process.stdin.setRawMode(true); // hide input
process.stdout.write('\x1b[?25l'); // hide cursor
process.stdout.write('\u001B[2J\u001B[0;0f'); // clear terminal

process.stdout.on('resize', function() {
    process.stdout.write('\u001B[2J\u001B[0;0f'); // clear terminal
    printEntries();
});
