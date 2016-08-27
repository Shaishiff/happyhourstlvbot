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

	botkit.hears(["^ping$"], 'message_received', function(bot, message) {
		FacebookHelper.sendText(bot, message, "pong");
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

	botkit.hears([".*"], 'message_received', function(bot, message) {
		// if (["^:)$","^;)$"].indexOf(message.text) !== -1) {
		// 	FacebookHelper.sendText(bot, message, ":D", function() {
		// 		controller.showMainQuestion(bot, message);
		// 	});
		// } else if (["^:D$"].indexOf(message.text) !== -1) {
		// 	FacebookHelper.sendText(bot, message, ";D", function() {
		// 		controller.showMainQuestion(bot, message);
		// 	});
		// } else if (["^hey$","^hei$","^hi$","^hello$","^yo$","^heya$"].indexOf(message.text) !== -1) {
		// 	FacebookHelper.sendText(bot, message, "Hey !", function() {
		// 		controller.showMainQuestion(bot, message);
		// 	});
		// } else if (["^שלום$","^הי$",].indexOf(message.text) !== -1) {
		// 	FacebookHelper.sendText(bot, message, "הי !", function() {
		// 		controller.showMainQuestion(bot, message);
		// 	});
		if (message.text && message.text.length > 2 && message.text.length < 50) {
			View.showDealsByString(bot, message, function() {
				View.showMainQuestion(bot, message);
			});
		} else {
			View.showMainQuestion(bot, message);
		}
		return false;
	});

	// Set initial data store.
	Api.collectData();

	if (typeof callback === "function") callback();
}

function enrichMessageData(bot, message, callback) {

	function queryFbForUserProfile(userId, callback) {
		console.log("queryFbForUserProfile");
		HttpHelper.getJson(GlobalConsts.FACEBOOK_USER_PROFILE_API.replace("<USER_ID>", userId), function(fbInfo) {
			if (!fbInfo) {
				console.error("queryFbForUserProfile - Can't get the user info from the facebook API.");
				callback(false);
				return;
			}
			console.log("queryFbForUserProfile - response", JSON.stringify(fbInfo));
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
		message.onBoardMessageShowed = (docFound ? docFound.onBoardMessageShowed : false);
		message.startTime = (docFound ? docFound.startTime : null);
		message.isExploringUser = (docFound ? docFound.isExploringUser : false);
		console.log("controller.enrichMessageData", JSON.stringify(message));
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
	console.log("controller.messageReceived", JSON.stringify(message));
	enrichMessageData(bot, message, function() {
		if (!message.startTime) {
			console.log("controller.messageReceived - First ever message");
			User.setStartTime(message.user, function(){
				View.showThankYouForContacting(bot, message);
			});
		} else {
			if (!message.isExploringUser) {
				console.log("controller.messageReceived - This is not an exploring user");
				return;
			}
			if (typeof callback === "function") callback();
		}
	});
}

controller.handlePostBack = function(bot, message, payload) {
	console.log("controller.handlePostBack");
	if(payload.indexOf("-") === -1 ) payload += "-";
	var postBackId = payload.split("-")[0];
	var postBackData = payload.split("-")[1];
	if (typeof controller[postBackId] === "function") {
		controller[postBackId](bot, message, postBackData);
	}
}

controller.postbackReceived = function(bot, message, callback) {
	console.log("controller.postbackReceived", JSON.stringify(message));
	enrichMessageData(bot, message, callback);
}

controller.messageSent = function(bot, message, callback) {
	console.log("controller.messageSent", JSON.stringify(message));
	if (typeof callback === "function") callback();
}

controller.unknownUserMessage = function(bot, message, callback) {
	if (typeof callback === "function") callback();
}

controller.getStartedButtonWasClicked = function(bot, message) {
	console.log("controller.getStartedButtonWasClicked");
	if (!message.startTime) {
		console.log("controller.getStartedButtonWasClicked - First ever message");
		User.setStartTime(message.user, function(){
			View.showThankYouForContacting(bot, message);
		});
	} else {
		View.showThankYouForContacting(bot, message);
	}
}

controller.attachmentReceived = function(bot, message) {

	function handleUserAttachment(bot, message, callback) {
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
		} else {
			if (typeof callback === "function") callback();
		}
	}

	console.log("controller.attachmentReceived", JSON.stringify(message));
	enrichMessageData(bot, message, function() {
		if (!message.startTime) {
			console.log("controller.attachmentReceived - First ever message");
			User.setStartTime(message.user, function(){
				View.showThankYouForContacting(bot, message);
			});
		} else {
			if (!message.isExploringUser) {
				console.log("controller.attachmentReceived - This is not an exploring user");
				return;
			}
			handleUserAttachment(bot, message, function() {
				controller.showMainQuestion(bot, message);
			});
		}
	});
}

controller.showThankYouForContacting = function(bot, message) {
	console.log("controller.showThankYouForContacting");
	User.setLang(message.user, "", function() {
		message.lang = "";
		if (!message.isExploringUser) {
			View.showThankYouForContactingEn(bot, message);
		} else {
			View.showMainQuestion(bot, message);
		}
	});
}

controller.showThankYouForContactingEn = function(bot, message) {
	console.log("controller.showThankYouForContactingEn");
	User.setLang(message.user, "en", function() {
		message.lang = "en";
		if (!message.isExploringUser) {
			View.showThankYouForContactingEn(bot, message);
		} else {
			View.showMainQuestion(bot, message);
		}
	});
}

controller.contactUs = function(bot, message) {
	console.log("controller.contactUs");
	User.setNotExploringUser(message.user, function() {
		message.user.isExploringUser = false;
		View.showContactUs(bot, message);
	});
}

controller.letsExplore = function(bot, message) {
	console.log("controller.letsExplore");
	User.setExploringUser(message.user, function() {
		User.setLang(message.user, "", function() {
			message.lang = "";
			if (!message.address && !message.address_en) {
				View.showGetStartedMessage(bot, message);
			} else {
				View.showMainQuestion(bot, message);
			}
		});
	});
}

controller.letsExploreEn = function(bot, message) {
	console.log("controller.letsExplore");
	User.setExploringUser(message.user, function() {
		User.setLang(message.user, "en", function() {
			message.lang = "en";
			if (!message.address && !message.address_en) {
				View.showGetStartedMessage(bot, message);
			} else {
				View.showMainQuestion(bot, message);
			}
		});
	});
}

controller.letsExploreInDefaultLang = function(bot, message) {
	console.log("controller.letsExploreInDefaultLang");
	if (message.lang === "en") {
		controller.letsExploreEn(bot, message);
	} else {
		controller.letsExplore(bot, message);
	}
}

controller.defaultPostBackDataHandler = function(bot, message, postBackId, postBackData) {
	console.error("Could not find a postback callback");
}

controller.showMainQuestion = function(bot, message) {
	console.log("controller.showMainQuestion");
	if (message.onBoardMessageShowed) {
		View.showMainQuestion(bot, message);
		return;
	} else {
		message.onBoardMessageShowed = true;
		User.setOnBoardMessageShowed(message.user, function() {
			console.log("controller.showMainQuestion - Showing on board message");
			View.showOnBoardingMessage(bot, message, function() {
				View.showMainQuestion(bot, message);
			});
		});
	}
}

controller.showLinks = function(bot, message) {
	View.showLinks(bot, message, function() {
		if (!message.isExploringUser) {
			console.log("controller.showLinks - This is not an exploring user");
			return;
		}
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
	});
}

module.exports = controller;