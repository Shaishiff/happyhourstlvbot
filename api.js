"use strict";

var Mysql = require('mysql');
var Consts = require('./consts');
var api = {};
var data = null;
var fields = null;

function findFieldIndex(fieldName) {
	for (var i=0; i < fields.length; i++) {
        if (fields[i].name === fieldName) {
            return i;
        }
    }
    return -1;
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
		connection.query("SELECT * FROM " + process.env.MYSQL_TABLE, function(err, rows, fs) {
			if (err) {
				console.error("Failed to retrieve data from DB: " + err);
			} else {
				console.log("Number of rows retrieved: ", rows.length);
				data = rows;
				fields = fs;
			}
		});
		connection.end();
	} catch(err) {
		console.error("Caught exception while trying to retrieve data from DB: " + err.message);
	}
}

module.exports = api;