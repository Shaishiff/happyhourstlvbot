"use strict";

var GlobalConsts = require('./globalConsts');
var MongoHelper = require('./mongoHelper');
var user = {};

user.setLang = function(userId, lang, callback) {
	MongoHelper.upsert({userId: userId},{$set: {lang: lang, langLastUpdateTime: new Date()}}, GlobalConsts.MONGO_DB_USER_INFO_COL, callback);
}

user.getLang = function(userId, callback) {
	MongoHelper.findOne({userId: userId, lang: { $exists: true}}, {lang:1}, GlobalConsts.MONGO_DB_USER_INFO_COL, callback);
}

module.exports = user;