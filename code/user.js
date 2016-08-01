"use strict";

var GlobalConsts = require('./globalConsts');
var MongoHelper = require('./mongoHelper');
var user = {};

user.get = function(userId, callback) {
	MongoHelper.get({userId: userId}, GlobalConsts.MONGO_DB_USER_INFO_COL, callback);
}

user.setFbInfo = function(userId, fbInfo, callback) {
	MongoHelper.upsert({userId: userId},
	{
		$set: {
			userId: userId,
			firstName: fbInfo.first_name,
			lastName: fbInfo.last_name,
			profilePic: fbInfo.profile_pic,
			locale: fbInfo.locale,
			timezone: fbInfo.timezone,
			gender: fbInfo.gender
		}
	},
	GlobalConsts.MONGO_DB_USER_INFO_COL,
	callback);
}

user.setLatLon = function(userId, lat, lon, address, address_en, callback) {
	MongoHelper.upsert({userId: userId},{$set: {userId: userId, lat: lat, lon: lon, address: address, address_en: address_en, latLonLastUpdateTime: new Date()}}, GlobalConsts.MONGO_DB_USER_INFO_COL, callback);
}

user.setLang = function(userId, lang, callback) {
	MongoHelper.upsert({userId: userId},{$set: {userId: userId, lang: lang, langLastUpdateTime: new Date()}}, GlobalConsts.MONGO_DB_USER_INFO_COL, callback);
}

user.getLang = function(userId, callback) {
	MongoHelper.findOne({userId: userId, lang: { $exists: true}}, {lang:1}, GlobalConsts.MONGO_DB_USER_INFO_COL, callback);
}

user.setDealCategory = function(userId, category, callback) {
	MongoHelper.upsert({userId: userId},{$set: {userId: userId, category: category, categoryLastUpdateTime: new Date()}}, GlobalConsts.MONGO_DB_USER_INFO_COL, callback);
}

user.getDealCategory = function(userId, callback) {
	MongoHelper.findOne({userId: userId, category: { $exists: true}}, {category:1}, GlobalConsts.MONGO_DB_USER_INFO_COL, callback);
}

user.setDealTime = function(userId, time, callback) {
	MongoHelper.upsert({userId: userId},{$set: {userId: userId, time: time, timeLastUpdateTime: new Date()}}, GlobalConsts.MONGO_DB_USER_INFO_COL, callback);
}

user.getDealTime = function(userId, callback) {
	MongoHelper.findOne({userId: userId, time: { $exists: true}}, {time:1}, GlobalConsts.MONGO_DB_USER_INFO_COL, callback);
}

user.setDealType = function(userId, type, callback) {
	MongoHelper.upsert({userId: userId},{$set: {userId: userId, type: type, typeLastUpdateTime: new Date()}}, GlobalConsts.MONGO_DB_USER_INFO_COL, callback);
}

user.getDealTime = function(userId, callback) {
	MongoHelper.findOne({userId: userId, type: { $exists: true}}, {type:1}, GlobalConsts.MONGO_DB_USER_INFO_COL, callback);
}

module.exports = user;