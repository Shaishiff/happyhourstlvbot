"use strict";

var Mysql = require('mysql');
var Consts = require('./consts');
var Utils = require('./utils');
var api = {};
var data = null;

api.getDataByObjectId = function(objectId, callback) {
	for(var i = 0; i < data.length; i++) {
		if (data[i].object_id === objectId) {
			callback(data[i]);
			return;
		}
	}
	callback(null);
}

api.getDataByHeadline = function(userText, lang, callback) {
	for(var i = 0; i < data.length; i++) {
		var dealName = data[i]["headline" + (lang === "en" ? "_en" : "")];
		// Remove english chars if we're in hebrew mode.
		if (lang.length === 0) {
			dealName = dealName.replace(/[A-z]/g, "").trim();
		}
		if (dealName == userText) {
			callback(data[i]);
			return;
		}
	}
	callback(null);
}

api.getDataByStringSimilarity = function(userText, lang, callback) {
	var sortedData = data;
	for(var i = 0; i < sortedData.length; i++) {
		var dealName = sortedData[i]["headline" + (lang === "en" ? "_en" : "")];
		// Remove english chars if we're in hebrew mode.
		if (lang.length === 0) {
			dealName = dealName.replace(/[A-z]/g, "").trim();
		}
		sortedData[i].stringSimilarity = Utils.getEditDistance(userText, dealName);
		console.log("userText: " + userText + ", dealName: " + dealName + ", stringSimilarity: " + sortedData[i].stringSimilarity);
		if (userText.length >= 4 && dealName.indexOf(userText) === 0) {
			console.log("Giving this option extra points");
			sortedData[i].stringSimilarity = (sortedData[i].stringSimilarity/2.0);
		}
	}
	callback(sortedData.sort(function(a, b) {
		if(a.stringSimilarity == b.stringSimilarity) return 0;
		else return (a.stringSimilarity > b.stringSimilarity ? 1 : -1);
	}));
}

api.getDataByDistanceFromUser = function(dataToUse, userLat, userLon, callback) {
	var sortedData = (dataToUse ? dataToUse : data);
	for(var i = 0; i < sortedData.length; i++) {
		sortedData[i].distance = Math.sqrt(Math.pow(sortedData[i].lat - userLat, 2) + Math.pow(sortedData[i].lon - userLon, 2), 2);
	}
	callback(sortedData.sort(function(a, b) {
		if(a.distance == b.distance) return 0;
		else return (a.distance > b.distance ? 1 : -1);
	}));
}

api.filterDataByCategory = function(dataToFilter, category) {
	if (category === "everything") return dataToFilter;
	else return dataToFilter.filter(function(obj) {return (obj.category === category)});
}

api.filterDataByTime = function(dataToFilter, when) {
	if (when == Consts.TODAY) {
		when = (new Date()).getDay();
	}
	return dataToFilter.filter(function(obj) {
		var opening_hours = null;
		try {
			opening_hours = JSON.parse(obj.opening_hours);
			if (opening_hours &&
				opening_hours.length &&
				opening_hours.length == 7) {
				return opening_hours[when].length > 0;
			}
		} catch (err) {
			console.log("filterDataByTime caught exception: " + err.message);
		}
		return false;
	});
}

api.getData = function(lang, category, when, lat, lon, callback) {
	console.log("api.getData");
	var processedData = data;
	console.log("processedData.length: " + processedData.length);
	processedData = api.filterDataByCategory(processedData, category);
	console.log("After category filter processedData.length: " + processedData.length);
	processedData = api.filterDataByTime(processedData, when);
	console.log("After time filter processedData.length: " + processedData.length);
	api.getDataByDistanceFromUser(processedData, lat, lon, callback);
}

api.collectData = function() {
	try {
		var connection = Mysql.createConnection({
			host     : process.env.MYSQL_HOST,
			user     : process.env.MYSQL_USER,
			password : process.env.MYSQL_PASSWORD,
			database : process.env.MYSQL_DB
		});
		connection.connect();
		connection.query("SELECT * FROM " + process.env.MYSQL_TABLE + " WHERE is_active = 1 ORDER BY headline", function(err, rows, fs) {
			if (err) {
				console.error("Failed to retrieve data from DB: " + err);
			} else {
				console.log("Number of rows retrieved: ", rows.length);
				data = rows;
			}
		});
		connection.end();
	} catch(err) {
		console.error("Caught exception while trying to retrieve data from DB: " + err.message);
	}
}

module.exports = api;