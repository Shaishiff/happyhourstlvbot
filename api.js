"use strict";

var Mysql = require('mysql');
var Consts = require('./consts');
var api = {};
var data = null;

api.getDataByDistanceFromUser = function(userLat, userLon, callback) {
	var sortedData = data;
	callback(sortedData.sort(function(a, b) {
		//var aDistance = Math.sqrt(Math.pow(a.lat - userLat, 2) + Math.pow(a.lon - userLon, 2), 2);
		//var bDistance = Math.sqrt(Math.pow(a.lat - userLat, 2) + Math.pow(a.lon - userLon, 2), 2);
		var aDistance = Math.abs(a.lat - userLat) + Math.abs(a.lon - userLon);
		var bDistance = Math.abs(a.lat - userLat) + Math.abs(a.lon - userLon);
		if(aDistance == bDistance) return 0;
		else return (aDistance > bDistance ? 1 : -1);
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