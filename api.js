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
	callback();
}

api.getDataByStringSimilarity = function(userText, callback) {
	var sortedData = data;
	for(var i = 0; i < sortedData.length; i++) {
		sortedData[i].stringSimilarity = Utils.getEditDistance(userText, sortedData[i]["headline"]);
	}
	callback(sortedData.sort(function(a, b) {
		if(a.stringSimilarity == b.stringSimilarity) return 0;
		else return (a.stringSimilarity > b.stringSimilarity ? 1 : -1);
	}));
}

api.getDataByDistanceFromUser = function(userLat, userLon, callback) {
	var sortedData = data;
	for(var i = 0; i < sortedData.length; i++) {
		sortedData[i].distance = Math.sqrt(Math.pow(sortedData[i].lat - userLat, 2) + Math.pow(sortedData[i].lon - userLon, 2), 2);
	}
	callback(sortedData.sort(function(a, b) {
		if(a.distance == b.distance) return 0;
		else return (a.distance > b.distance ? 1 : -1);
	}));
}

function filterDataByCategory(category) {
	var filteredData = data;
	return filteredData.filter(function(obj) {return (obj.category === category)});
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