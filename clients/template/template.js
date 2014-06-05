#!/usr/bin/env node

// template client program
var config = require('../../config/config.json');
var socket = require('socket.io-client').connect(config.host + ':' + config.port, {
	query: {token: config.token}
});

socket.on('newNotification', function(notification) {
	// new notification arrived, print text property
	console.log('new notification: ' + notification.source + ': ' + notification.text);
});
socket.on('markAs', function(notifications) {
	// existing notifications' read property changed, print the old indices
	for (var i = 0; i < notifications.length; i++) {
		if(notifications[i].read)
			console.log('notification ' + notifications[i].unreadID + ' marked as read.');
		else
			console.log('notification ' + notifications[i].readID + ' marked as unread.');
	}
});
socket.on('notifications', function(notifications) {
	// server sent back a list of notifications that you've requested
	console.log('got list of notifications:');
	for (var i = 0; i < notifications.length; i++)
		console.log(notifications[i].source + ': ' + notifications[i].text)
});
socket.on('connect', function() {
	socket.emit('newNotification', {
		'text': 'notification text goes here',
		'source': 'testapp',
		'sourcebg': 'blue',
		'sourcefg': 'black'
	});
	socket.emit('markAs', {
		'read': true,
		'source': 'testapp'
	});
	socket.emit('getRead');
	socket.emit('getUnread', {
		'id': '5..42'
	});
});
