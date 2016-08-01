"use strict";

var GlobalConsts = require('./globalConsts');
var FacebookBot = require('./facebookBot');
var Controller = require('./controller');
var PostBackHelper = require('./postBackHelper');
var botInitializer = {};

botInitializer.init = function(callback) {
	var fbBot = FacebookBot({
		access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
		verify_token: process.env.FACEBOOK_VERIFY_TOKEN
	})

	// Log the message and add more info to the message.
	fbBot.middleware.receive.use(function(bot, message, next) {
	  Controller.messageReceived(bot, message, function() {
	    next();
	  });
	});

	fbBot.middleware.send.use(function(bot, message, next) {
	  Controller.messageSent(bot, message, function() {
	    next();
	  });
	});

	// Not sure what the users wants. Final fallback.
	fbBot.on("message_received", function(bot, message) {
		if (typeof message.quick_reply === "object" && typeof message.quick_reply.payload === "string") {
			PostBackHelper.handlePostBack(bot, message, message.quick_reply.payload);
			return false;
		}
	});

	// Facebook postsbacks.
	fbBot.on('facebook_postback', function(bot, message) {
	  PostBackHelper.handlePostBack(bot, message, message.payload);
	});

	Controller.init(fbBot, function() {
		GlobalConsts.init(function() {
			callback(fbBot, fbBot.spawn({}));
		});
	});
}

module.exports = botInitializer;