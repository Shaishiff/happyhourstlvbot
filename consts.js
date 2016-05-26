"use strict";

var consts = {
	FACEBOOK_WELCOME_MSG_URL: "https://graph.facebook.com/v2.6/" + process.env.FACEBOOK_PAGE_ID + "/thread_settings?access_token=" + process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
	FACEBOOK_USER_PROFILE_API: "https://graph.facebook.com/v2.6/<USER_ID>?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=" + process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
	MONGO_DB_URL: "mongodb://" + process.env.MONGO_DB_USER + ":" + process.env.MONGO_DB_USER + "@" + process.env.MONGO_DB_HOST + ":" + process.env.MONGO_DB_PORT + "/" + process.env.MONGO_DB_NAME,
	MONGO_DB_USER_INFO_COL: "user_info",
	ANALYTICS_API: "http://api.bot-metrics.com/v1/messages",
	HAPPY_HOURS_DOMAIN: "http://happyhourstlv.com",
	DEALS_IN_CAROUSEL: 5,
	CATEGORIES: [{
		title_en: "Everything",
		title: "הכל",
		db_name: "aa",
		payload: "showEverything",
		image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/everything.jpg"
	},
	{
		title_en: "Late Night",
		title: "לייט נייט",
		db_name: "aa",
		payload: "showLateNight",
		image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/latenight.jpg"
	},
	{
		title_en: "Happy Hour",
		title: "שעה שמחה",
		db_name: "aa",
		payload: "showHappyHour",
		image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/happyhour.jpg"
	},
	{
		title_en: "Business Lunch",
		title: "עסקית צהריים",
		db_name: "aa",
		payload: "showLunch",
		image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/lunch.jpg"
	},
	{
		title_en: "Brunch",
		title: "'בראנץ",
		db_name: "aa",
		payload: "showBrunch",
		image_url: "https://raw.githubusercontent.com/Shaishiff/happyhourstlvbot/master/images/brunch.jpg"
	}]
};

module.exports = consts;