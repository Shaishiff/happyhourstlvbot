"use strict";

var GlobalConsts = require('./globalConsts');
var FacebookHelper = require('./facebookHelper');
var View = require('./view');
var Sentences = require('./sentences');
var User = require('./user');
var Api = require('./api');
var controller = {};

controller.init = function(botkit, callback) {
	// FacebookHelper.setGetStartedButton(function() {
	// 	FacebookHelper.setPersistentMainMenu(View.buildPersistentMainMenu());
	// });

	botkit.hears(["test"], 'message_received', function(bot, message) {
		FacebookHelper.sendText(bot, message, "test back");
		return false;
	});

	function showMainMenu(bot, message, lang) {
		User.setLang(message.user, lang, function() {
			View.showMainMenu(bot, message, lang);
		});
	}

	botkit.hears(Sentences.user_wants_main_menu_he, 'message_received', function(bot, message) {
		console.log("user requested hebrew menu: " + message.text);
		showMainMenu(bot, message, "");
		return false;
	});

	botkit.hears(Sentences.user_wants_main_menu_en, 'message_received', function(bot, message) {
		console.log("user requested english menu: " + message.text);
		showMainMenu(bot, message, "en");
		return false;
	});

	// Set initial data store.
	Api.collectData();

	if (typeof callback === "function") callback();
}

function handleUserAttachment(bot, message, lang) {
	console.log("handleUserAttachment started");
	if (message.attachments.length === 1 &&
		message.attachments[0].payload &&
		message.attachments[0].payload.coordinates &&
		message.attachments[0].payload.coordinates.lat &&
		message.attachments[0].payload.coordinates.long) {
		var lat = message.attachments[0].payload.coordinates.lat;
		var lon = message.attachments[0].payload.coordinates.long;
		View.showDealsByDistance(bot, message, lang, lat, lon);
		return true;
	}
	return false;
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
}

controller.defaultPostBackDataHandler = function(bot, message, postBackId, postBackData) {
	console.error("Could not find a postback callback");
}

module.exports = controller;