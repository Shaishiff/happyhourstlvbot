"use strict";

var GlobalConsts = require('./globalConsts');
var Mysql = require('mysql');
var GlobalConsts = require('./globalConsts');
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
		var isEn = (new RegExp(/^[a-z0-9]+$/i).test(userText));
		var dealName = data[i]["headline" + (isEn ? "_en" : "")];
		// Remove english chars if we're in hebrew mode.
		if (!isEn) {
			dealName = dealName.replace(/[A-z]/g, "").trim();
		}
		if (dealName.toLowerCase() == userText.toLowerCase()) {
			callback(data[i]);
			return;
		}
	}
	callback(null);
}

api.getDataByStringSimilarity = function(userText, userLang, callback) {
	function setSimilarity(lang) {
		var dealName = sortedData[i]["headline" + (lang === "en" ? "_en" : "")].toLowerCase();
		// Remove english chars if we're in hebrew mode.
		if (lang === "") {
			dealName = dealName.replace(/[A-z]/g, "").trim();
		}
		var stringSimilarity = Utils.getEditDistance(userText, dealName);
		if (userText.length >= 4 && dealName.indexOf(userText) === 0) {
			console.log("Giving this option extra points");
			stringSimilarity = (stringSimilarity/3.0);
		}

		// Try without some common words:
		var stringSimilarity = Math.min(stringSimilarity,Utils.getEditDistance(userText, dealName.replace(/bar/i,'').replace(/wine/i,'').replace(/burger/i,'')));
		//console.log("userText: " + userText + ", dealName: " + dealName + ", stringSimilarity: " + stringSimilarity);
		return stringSimilarity;
	}
	userText = userText.toLowerCase();
	var sortedData = data;
	for(var i = 0; i < sortedData.length; i++) {
		var stringSimilarityEn = setSimilarity("en");
		var stringSimilarity = setSimilarity("");
		sortedData[i].stringSimilarity = Math.min(stringSimilarityEn, stringSimilarity);
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
		//console.log("getDataByDistanceFromUser - distance from " + sortedData[i].headline_en + ": " + sortedData[i].distance);
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

api.filterDataByTime = function(dataToFilter, when, timezone) {
	// TODO: Handle RIGHT_NOW
	var timeToAdd = timezone * 60 * 60 * 1000;
	var whenDay = null;
	if (when == GlobalConsts.TODAY || when == GlobalConsts.RIGHT_NOW) {
		whenDay = (new Date((new Date()).getTime() + timeToAdd)).getDay();
	} else if (when == GlobalConsts.TOMORROW) {
		whenDay = (new Date((new Date()).getTime() + 24 * 60 * 60 * 1000 + timeToAdd)).getDay();
	}
	var whenHour = null;
	if (when == GlobalConsts.RIGHT_NOW) {
		whenHour = (new Date((new Date()).getTime() + timeToAdd)).getHours() * 100 + (new Date((new Date()).getTime() + timeToAdd)).getMinutes();
	}
	return dataToFilter.filter(function(obj) {
		var opening_hours = null;
		try {
			opening_hours = JSON.parse(obj.opening_hours);
			var relevantDay = true;
			if (whenDay) {
				relevantDay = (opening_hours &&
					opening_hours.length &&
					opening_hours.length === 7 &&
					opening_hours[whenDay].length > 0);
			}
			var relevantHour = true;
			if (whenHour) {
				relevantHour = false;
				if (opening_hours &&
					opening_hours.length &&
					opening_hours.length === 7) {
					for (var i = 0; i < opening_hours[whenDay].length; ++i) {
						relevantHour = (opening_hours[whenDay][i].start <= whenHour &&
							opening_hours[whenDay][i].end >= whenHour);
					}
				}
			}
			return relevantDay && relevantHour;

		} catch (err) {
			console.log("filterDataByTime caught exception: " + err.message);
		}
		return false;
	});
}

api.getData = function(message, lat, lon, callback) {
	var processedData = data;
	//console.log("processedData.length: " + processedData.length);
	processedData = api.filterDataByCategory(processedData, message.dealCategory);
	//console.log("After category filter processedData.length: " + processedData.length);
	processedData = api.filterDataByTime(processedData, message.dealTime, message.timezone);
	//console.log("After time filter processedData.length: " + processedData.length);
	if (typeof lat === "number" && lat > 0 &&
		typeof lon === "number" && lon > 0) {
		//console.log("Sorting according to distance from user");
		api.getDataByDistanceFromUser(processedData, lat, lon, callback);
	} else {
		//console.log("Sorting randomly");
		callback(Utils.shuffleArray(processedData));
	}
}

api.collectData = function() {
	try {
		console.log("started collecting data", new Date());
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
				data = rows;
			}
		});
		connection.end();
	} catch(err) {
		console.error("Caught exception while trying to retrieve data from DB: " + err.message);
	}

	setTimeout(function() {
		api.collectData();
	}, GlobalConsts.READ_HAPPY_HOURS_INTERVAL);
}

module.exports = api;