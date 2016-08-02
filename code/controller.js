"use strict";

var GlobalConsts = require('./globalConsts');
var HttpHelper = require('./httpHelper');
var FacebookHelper = require('./facebookHelper');
var View = require('./view');
var Sentences = require('./sentences');
var User = require('./user');
var Api = require('./api');
var Utils = require('./utils');
var controller = {};

controller.init = function(botkit, callback) {
	FacebookHelper.setGetStartedButton(function() {
		FacebookHelper.setPersistentMainMenu(View.buildPersistentMainMenu());
	});

	botkit.hears(["^test$"], 'message_received', function(bot, message) {
		FacebookHelper.sendText(bot, message, "test back");
		return false;
	});

	botkit.hears(["^delete me$", "^start over$"], 'message_received', function(bot, message) {
		User.delete(message.user, function() {
			FacebookHelper.sendText(bot, message, "*** Deleted all your past info, starting over... ***", function() {
				controller.getStartedButtonWasClicked(bot, message);
			});
		});
		return false;
	});

	// function showMainMenu(bot, message, lang) {
	// 	User.setLang(message.user, lang, function() {
	// 		message.lang = lang;
	// 		View.showMainQuestion(bot, message);
	// 	});
	// }

	// botkit.hears(Sentences.user_wants_main_menu_he, 'message_received', function(bot, message) {
	// 	console.log("user requested hebrew menu: " + message.text);
	// 	showMainMenu(bot, message, "");
	// 	return false;
	// });

	// botkit.hears(Sentences.user_wants_main_menu_en, 'message_received', function(bot, message) {
	// 	console.log("user requested english menu: " + message.text);
	// 	showMainMenu(bot, message, "en");
	// 	return false;
	// });

	function handleUserAttachment(bot, message) {
		if (message.attachments.length === 1 &&
			message.attachments[0].payload &&
			message.attachments[0].payload.coordinates &&
			message.attachments[0].payload.coordinates.lat &&
			message.attachments[0].payload.coordinates.long) {
			var lat = message.attachments[0].payload.coordinates.lat;
			var lon = message.attachments[0].payload.coordinates.long;
			if (GlobalConsts.GEO_LIMITS.LAT.MAX < lat ||
				GlobalConsts.GEO_LIMITS.LAT.MIN > lat ||
				GlobalConsts.GEO_LIMITS.LON.MAX < lon ||
				GlobalConsts.GEO_LIMITS.LON.MIN > lon) {
				View.weOnlySupport(bot, message);
			} else {
				Utils.getAddressFromLatLon(lat, lon, "en", function(address_en) {
					Utils.getAddressFromLatLon(lat, lon, "", function(address) {
						User.setLatLon(message.user, lat, lon, (address ? address: ""), (address_en ? address_en: ""), function() {
							message.lat = lat;
							message.lon = lon;
							message.address = address;
							message.address_en = address_en;
							View.foundYourAddress(bot, message, (message.lang === "en" ? address_en : address), function() {
							});
						});
					});
				});
			}
		}
	}

	botkit.on('message_received', function(bot, message) {
		if (message.attachments) {
			//console.log("message has attachments");
			handleUserAttachment(bot, message);
		}
	});

	botkit.hears([".*"], 'message_received', function(bot, message) {
		if (message.text) {
			View.showDealsByString(bot, message, function() {
				View.showMainQuestion(bot, message);
			});
		}
		return false;
	});

	// Set initial data store.
	Api.collectData();

	if (typeof callback === "function") callback();
}

function enrichMessageData(bot, message, callback) {

	function queryFbForUserProfile(userId, callback) {
		HttpHelper.getJson(GlobalConsts.FACEBOOK_USER_PROFILE_API.replace("<USER_ID>", userId), function(fbInfo) {
			if (!fbInfo) {
				console.error("queryFbForUserProfile - Can't get the user info from the facebook API.");
				callback(false);
				return;
			}
			message.firstName = (fbInfo && typeof fbInfo.first_name === "string" && fbInfo.first_name.length > 0  ? fbInfo.first_name : null);
			message.lastName = (fbInfo && typeof fbInfo.last_name === "string" && fbInfo.last_name.length > 0  ? fbInfo.last_name : null);
			message.profilePic = (fbInfo && typeof fbInfo.profile_pic === "string" && fbInfo.profile_pic.length > 0  ? fbInfo.profile_pic : null);
			message.locale = (fbInfo && typeof fbInfo.locale === "string" && fbInfo.locale.length > 0  ? fbInfo.locale : null);
			message.timezone = (fbInfo && typeof fbInfo.timezone === "number" ? fbInfo.timezone : null);
			message.gender = (fbInfo && typeof fbInfo.gender === "string" && fbInfo.gender.length > 0  ? fbInfo.gender : null);
			User.setFbInfo(userId, fbInfo, callback);
		});
	}

	User.get(message.user, function(docFound) {
		message.lang = (docFound && typeof docFound.lang === "string" && docFound.lang.length > 0 ? docFound.lang : "");
		message.gender = (docFound && typeof docFound.gender === "string" && docFound.gender.length > 0 ? docFound.gender : "male");
		message.dealCategory = (docFound && typeof docFound.category === "string" && docFound.category.length > 0  ? docFound.category : GlobalConsts.CATEGORIES[0].db_name);
		message.dealTime = (docFound && typeof docFound.time === "string" && docFound.time.length > 0  ? docFound.time : GlobalConsts.TIMES[0].db_name);
		message.firstName = (docFound && typeof docFound.firstName === "string" && docFound.firstName.length > 0  ? docFound.firstName : null);
		message.lastName = (docFound && typeof docFound.lastName === "string" && docFound.lastName.length > 0  ? docFound.lastName : null);
		message.profilePic = (docFound && typeof docFound.profilePic === "string" && docFound.profilePic.length > 0  ? docFound.profilePic : null);
		message.locale = (docFound && typeof docFound.locale === "string" && docFound.locale.length > 0  ? docFound.locale : null);
		message.timezone = (docFound && typeof docFound.timezone === "number" ? docFound.timezone : null);
		message.gender = (docFound && typeof docFound.gender === "string" && docFound.gender.length > 0  ? docFound.gender : null);
		message.lat = (docFound && typeof docFound.lat === "number" ? docFound.lat : null);
		message.lon = (docFound && typeof docFound.lon === "number" ? docFound.lon : null);
		message.address = (docFound && typeof docFound.address === "string" && docFound.address.length > 0 ? docFound.address : null);
		message.address_en = (docFound && typeof docFound.address_en === "string" && docFound.address_en.length > 0 ? docFound.address_en : null);
		if (!docFound || !docFound.gender || !docFound.timezone) {
			queryFbForUserProfile(message.user, function() {
				if (typeof callback === "function") callback();
			});
		} else {
			if (typeof callback === "function") callback();
		}
	});
}

controller.messageReceived = function(bot, message, callback) {
	//console.log("controller.messageReceived");
	enrichMessageData(bot, message, callback);
}

controller.postbackReceived = function(bot, message, callback) {
	//console.log("controller.postbackReceived");
	enrichMessageData(bot, message, callback);
}

controller.messageSent = function(bot, message, callback) {
	if (typeof callback === "function") callback();
}

controller.unknownUserMessage = function(bot, message, callback) {
	if (typeof callback === "function") callback();
}

controller.getStartedButtonWasClicked = function(bot, message) {
	View.showGetStartedMessage(bot, message);
}

controller.defaultPostBackDataHandler = function(bot, message, postBackId, postBackData) {
	console.error("Could not find a postback callback");
}

controller.showMainQuestion = function(bot, message) {
	View.showMainQuestion(bot, message);
}

controller.showLinks = function(bot, message) {
	View.showLinks(bot, message, function() {
		View.showMainQuestion(bot, message);
	});
}

controller.changeLanguage = function(bot, message) {
	View.changeLanguage(bot, message);
}

controller.switchedLanguage = function(bot, message, lang) {
	User.setLang(message.user, lang, function() {
		message.lang = lang;
		View.showMainQuestion(bot, message);
	});
}

controller.findOptions = function(bot, message) {
	View.showDeals(bot, message);
}

controller.showCategories = function(bot, message) {
	View.showCategories(bot, message);
}

controller.choseCategory = function(bot, message, category) {
	message.dealCategory = category;
	User.setDealCategory(message.user, category, function() {
		View.showMainQuestion(bot, message);
	});
}

controller.showTimes = function(bot, message) {
	View.showTimes(bot, message);
}

controller.choseTime = function(bot, message, time) {
	message.dealTime = time;
	User.setDealTime(message.user, time, function() {
		View.showMainQuestion(bot, message);
	});
}

controller.showHowToSendMyLocation = function(bot, message) {
	View.showHowToSendMyLocation(bot, message, function() {
		View.showMainQuestion(bot, message);
	});
}

module.exports = controller;