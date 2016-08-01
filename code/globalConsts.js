"use strict";

var INVALID_NUM = -999;
var vTODAY = "vTODAY";
var vRIGHT_NOW = "vRIGHT_NOW";
var vTOMORROW = "vTOMORROW";

var globalConsts = {
	INVALID_NUM: INVALID_NUM,
	FACEBOOK_PERSISTENT_MAIN_MENU_URL: "https://graph.facebook.com/v2.6/me/thread_settings?access_token=" + process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
	FACEBOOK_GET_STARTED_BUTTON_URL: "https://graph.facebook.com/v2.6/me/thread_settings?access_token=" + process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
	FACEBOOK_WELCOME_MSG_URL: "https://graph.facebook.com/v2.6/" + process.env.FACEBOOK_PAGE_ID + "/thread_settings?access_token=" + process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
	FACEBOOK_USER_PROFILE_API: "https://graph.facebook.com/v2.6/<USER_ID>?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=" + process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
	MONGO_DB_URL: process.env.MONGO_DB_URL,
	MONGO_DB_USER_INFO_COL: "user_info",
	ANALYTICS_API: "https://api.bot-metrics.com/v1/messages",
	HAPPY_HOURS_DOMAIN: "https://happyhourstlv.com",
	READ_HAPPY_HOURS_INTERVAL: 1000*60*60,
	DEALS_IN_CAROUSEL: 5,
	GEO_LIMITS: {
		LAT: {
			MAX: 32.146092,
			MIN: 31.954432
		},
		LON: {
			MAX: 34.838289,
			MIN: 34.715694
		}
	},
	CATEGORIES: [{
		title_en: "a happy hour",
		title: "שעה שמחה",
		db_name: "hh",
		payload: "showHappyHour",
		image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/happyhour.jpg"
	},
	{
		title_en: "all deals",
		title: "את כל הדילים",
		db_name: "everything",
		payload: "showEverything",
		image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/everything.jpg"
	},
	{
		title_en: "a late night",
		title: "לייט נייט",
		db_name: "ln",
		payload: "showLateNight",
		image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/latenight.jpg"
	},
	{
		title_en: "a business lunch",
		title: "עסקית צהריים",
		db_name: "bl",
		payload: "showLunch",
		image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/lunch.jpg"
	},
	{
		title_en: "a brunch",
		title: "'בראנץ",
		db_name: "br",
		payload: "showBrunch",
		image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/brunch.jpg"
	}],
	TODAY: vTODAY,
	RIGHT_NOW: vRIGHT_NOW,
	TOMORROW: vTOMORROW,
	TIMES: [{
		title_en: "right now",
		title: "עכשיו",
		db_name: vRIGHT_NOW,
		payload: "showNow",
		image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/latenight.jpg"
	},
	{
		title_en: "today",
		title: "היום",
		db_name: vTODAY,
		payload: "showToday",
		image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/everything.jpg"
	},
	{
		title_en: "tomorrow",
		title: "מחר",
		db_name: vTOMORROW,
		payload: "showTomorrow",
		image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/latenight.jpg"
	}
	// TODO: Add support for this sometime...
	// {
	// 	title_en: "Right Now",
	// 	title: "עכשיו",
	// 	db_name: vRIGHT_NOW,
	// 	payload: "showRightNow",
	// 	image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/latenight.jpg"
	// },
	// {
	// 	title_en: "Sunday",
	// 	title: "יום ראשון",
	// 	db_name: 0,
	// 	payload: "showSunday",
	// 	image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/latenight.jpg"
	// },
	// {
	// 	title_en: "Monday",
	// 	title: "יום שני",
	// 	db_name: 1,
	// 	payload: "showMonday",
	// 	image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/happyhour.jpg"
	// },
	// {
	// 	title_en: "Tuesday",
	// 	title: "יום שלישי",
	// 	db_name: 2,
	// 	payload: "showTuesday",
	// 	image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/lunch.jpg"
	// },
	// {
	// 	title_en: "Wednesday",
	// 	title: "יום רביעי",
	// 	db_name: 3,
	// 	payload: "showWednesday",
	// 	image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/brunch.jpg"
	// },
	// {
	// 	title_en: "Thursday",
	// 	title: "יום חמישי",
	// 	db_name: 4,
	// 	payload: "showThursday",
	// 	image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/everything.jpg"
	// },
	// {
	// 	title_en: "Friday",
	// 	title: "יום שישי",
	// 	db_name: 5,
	// 	payload: "showFriday",
	// 	image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/latenight.jpg"
	// },
	// {
	// 	title_en: "Saturday",
	// 	title: "יום שבת",
	// 	db_name: 6,
	// 	payload: "showSaturday",
	// 	image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/happyhour.jpg"
	// }
	]
};

globalConsts.init = function(callback) {
	if (typeof callback === "function") callback();
}

module.exports = globalConsts;