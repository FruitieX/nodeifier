nodifier
=========

![Screenshot](/screenshot.png?raw=true "Screenshot")

nodifier is a simple notification server complete with a client, both written in NodeJS. Standalone programs known as plugins can add new notifications to the server, eg. e-mails and IRC highlights. You can easily write your own by having a look at the API below!

### Features:
* Simple HTTPS REST API. Notifications sent as JSON.
* The nodifier client can be used to list (un)read notifications, mark one or several as (un)read, and open a program associated with a notification.
* The nodifier server prints unread notifications to STDOUT whenever the list changes, making it useful on a secondary monitor.
* Plugins can associate notifications with a program and an URI to pass as an argument to that program. This way you can e.g. open a web browser directly to the URL of a received e-mail.
* Plugins can be told when a notification has been read, and can then e.g. mark an e-mail as read. Works vice-versa, too.
* Free Open Source Software! (MIT License)


Client
------
The client can request all notifications, specific notifications only or mark a
notification as (un)read.


### Setup
1. Server and client shares the same `config.json` file, so if you did the above steps you should be set.
2. Run `nodifier_cl.js` in a terminal to test it.
3. Optional: Make an alias/symlink for quick access:
`ln -s ~/dev/nodifier/nodifier_cl.js n`

### Supported commands:


Server
------

Furthermore the server automatically logs unread notifications to the terminal
window from where it was ran. (and hides already read notifications, too)

### Setup

1. Generate SSL keys with `./gen_keys.sh`
2. `cp config.json.example config.json` (TODO: do this
   automatically?)
3. Edit `config.json`.
4. Run `nodifier_sv.js` in a terminal where you want notifications to show up.
5. Test with e.g. `plugins/spam/plugin.js`

Now the server is not very useful alone without anything sending notifications
to it, but there are a few scripts in this repo (under `plugins/`) that do just
that (such as the above spam script).  Have a look and/or script your own!

Plugins
-------
### Included
* Mail notifier
* Simple program for adding a TODO as a notification
### Other projects
* znc-push, using URI service. Setup example:
```
set service url
set message_uri https://domain.org:8888/?method=newNotification&text={nick} {message}&sourcebg=green&sourcefg=black&source=irc&context={context}&contextbg=yellow&contextfg=black&openwith=irc
set message_uri_markasread https://domain.org:8888/?method=setRead&source=irc&context={context}
set mark_asread yes
set message_uri_post yes
set username http_auth_username
set secret http_auth_password
set highlight your_nick
```

Upstream znc-push currently puts a lot of extra stuff in `{message}`, and has
no support for `message_uri_markasread`. I've fixed/added these things in my
fork of znc-push, and maintain all changes inside my server branch over at:
`https://github.com/FruitieX/znc-push/tree/fruitiex/server`

API
------
The server speaks HTTP. Here's what it can do:

### POST request
Resource is always `/`, use `querystring.stringify(data_json)` to go from JSON to query string.
* Add a notification
```
{
	"method": "newNotification",
	"text": "lorem ipsum",
	"source": "mail",
	"sourcebg": "green",
	"sourcefg": "black"
	"context": "gmail",
	"contextbg": "red",
	"contextfg": "whiteBright"
	"app": "web",
	"url": "http://awesome-mail-provider.com/inbox/847295819",
}
```
* Mark notification as read
```
{
	"method": "setRead",
	"id": 42
}
```
* Mark notification as unread
```
{
	"method": "setUnread",
	"id": 42
}
```

### GET request
* Request a list of all notifications
	* Resource: `/all`, returns something like:
```
[
	{"text":"spam0","source":"source0","app":"app0","url":"url0","sourcebg":"red","sourcefg":"white","read":false,"id":0,"date":1392663071818},
	{"text":"spam1","source":"source1","app":"app1","url":"url1","sourcebg":"red","sourcefg":"white","read":false,"id":1,"date":1392663072816},
	{"text":"spam2","source":"source2","app":"app2","url":"url2","sourcebg":"red","sourcefg":"white","read":false,"id":2,"date":1392663073816}
]
```

* Request a specific notification
	* Resource: `/<notification-id>`, returns something like:
```
{
	"text":"spam",
	"source":"source0",
	"sourcebg":"green",
	"sourcefg":"black",
	"app":"app0",
	"url":"url0",
	"read":false,
	"id":0,
	"date":1392663071818
}
```

