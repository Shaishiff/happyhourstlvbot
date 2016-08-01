"use strict";

var GlobalConsts = require('./globalConsts');
var FacebookHelper = require('./facebookHelper');
var MongoHelper = require('./mongoHelper');
var View = require('./view');
var User = require('./user');
var SlotsController = require('./slotsController');
var controller = {};

controller.init = function(botkit, callback) {
	FacebookHelper.setGetStartedButton(function() {
		FacebookHelper.setPersistentMainMenu(View.buildPersistentMainMenu());
	});
	botkit.hears(["^add to balance$","^add balance$"], 'message_received', function(bot, message) {
		User.setUserBalance(message.user, 10000, function() {
			FacebookHelper.sendText(bot, message, "Added 10000 to user balance");
		});
		return false;
	});
	botkit.hears(["^clear games$","^clear game$"], 'message_received', function(bot, message) {
		User.setUserGameState(message.user, 0, function() {
			FacebookHelper.sendText(bot, message, "Cleared games");
		});
		return false;
	});

	// Should be called last.
	SlotsController.init(botkit, callback);
}

controller.messageReceived = function(bot, message, callback) {
	if (typeof callback === "function") callback();
}

controller.messageSent = function(bot, message, callback) {
	if (typeof callback === "function") callback();
}

controller.unknownUserMessage = function(bot, message, callback) {
	if (typeof callback === "function") callback();
}

controller.getStartedButtonWasClicked = function(bot, message) {
	User.setUserStarted(message.user, function() {
		User.getOrCreateFbInfo(message.user, function(fbUserInfo) {
			SlotsController.getStartedButtonWasClicked(bot, message, fbUserInfo);
		});
	});
}

controller.defaultPostBackDataHandler = function(bot, message, postBackId, postBackData) {
	if (typeof SlotsController[postBackId] === "function") {
		SlotsController[postBackId](bot, message, postBackData);
	} else {
		console.error("Could not find a postback callback");
	}
}

controller.accountLinking = function(bot, message) {
	if (typeof message.account_linking.authorization_code === "string" &&
		message.account_linking.authorization_code.indexOf("-") !== -1 &&
		message.account_linking.status === "linked") {
		var accessToken = message.account_linking.authorization_code.split("-")[0];
		var fbUserId = message.account_linking.authorization_code.split("-")[1];
		var expiresIn = message.account_linking.authorization_code.split("-")[2];
		// Attempt to extend the access token to a longer one.
		FacebookHelper.extendAccessTokenExpirationTime(accessToken, function(res) {
			if(res) {
				accessToken = res.accessToken;
				expiresIn = res.expiresIn;
			}
			User.setUserFbAccountLinkingInfo(message.user, {accessToken: accessToken, fbUserId:fbUserId, expiresIn:expiresIn}, function() {
				SlotsController.accountLinking(bot, message);
			});

		});
	} else if (message.account_linking.status === "unlinked") {
		User.setUserFbAccountLinkingInfo(message.user, {}, function() {
			SlotsController.accountUnlinking(bot, message);
		});
	}
}

module.exports = controller;