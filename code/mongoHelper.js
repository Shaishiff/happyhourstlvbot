"use strict";

var GlobalConsts = require('./globalConsts');
var MongoClient = require('mongodb').MongoClient;
var mongoHelper = {};

mongoHelper.insert = function(docToInsert, collection, callback) {
	MongoClient.connect(GlobalConsts.MONGO_DB_URL, function(errConnect, db) {
		if(errConnect) {
			console.error("insertIntoMongo - Could not connect to server with error: " + errConnect);
			if (typeof callback === "function") callback(false);
			return;
		}
		db.collection(collection).insertOne(docToInsert, function(errInsert, r) {
			db.close();
			if(errInsert) {
				console.error("insertIntoMongo - error: " + errInsert);
				if (typeof callback === "function") callback(false);
				return;
			}
			if (typeof callback === "function") callback(true, r.ops[0]);
		});
	});
}

mongoHelper.upsert = function(docToFind, docToUpsert, collection, callback) {
	MongoClient.connect(GlobalConsts.MONGO_DB_URL, function(errConnect, db) {
		if(errConnect) {
			console.error("upsertIntoMongo - Could not connect to server with error: " + errConnect);
			if (typeof callback === "function") callback(false);
			return;
		}
		db.collection(collection).update(docToFind, docToUpsert, {upsert: true, multi: false}, function(errUpsert, r) {
			db.close();
			if(errUpsert) {
				console.error("upsertIntoMongo - error: " + errUpsert);
				if (typeof callback === "function") callback(false);
				return;
			}
			if (typeof callback === "function") callback(true);
		});
	});
}

mongoHelper.get = function(docToFind, collection, callback) {
	MongoClient.connect(GlobalConsts.MONGO_DB_URL, function(errConnect, db) {
		if(errConnect) {
			console.error("getFromMongo - Could not connect to server with error: " + errConnect);
			if (typeof callback === "function") callback(null);
			return;
		}
		db.collection(collection).find(docToFind).limit(1).toArray(function(errFind, docs) {
			db.close();
			if (docs instanceof Array && docs.length == 1) {
				if (typeof callback === "function") callback(docs[0]);
			} else {
				if (typeof callback === "function") callback(null);
			}
		});
	});
}

mongoHelper.findOne = function(docToFind, fields, collection, callback) {
	MongoClient.connect(GlobalConsts.MONGO_DB_URL, function(errConnect, db) {
		if(errConnect) {
			console.error("findOne - Could not connect to server with error: " + errConnect);
			if (typeof callback === "function") callback(null);
			return;
		}
		db.collection(collection).findOne(docToFind, fields, function(errFind, doc) {
			db.close();
			if (typeof callback === "function") {
				if (!errFind) callback(doc);
				else callback(null);
			}
		});
	});
}

mongoHelper.getMultiple = function(selector, fields, collection, callback) {
	MongoClient.connect(GlobalConsts.MONGO_DB_URL, function(errConnect, db) {
		if(errConnect) {
			console.error("getMultiple - Could not connect to server with error: " + errConnect);
			if (typeof callback === "function") callback(null);
			return;
		}
		db.collection(collection).find(selector, fields).toArray(function(err, docs) {
			db.close();
			if (typeof callback === "function") callback((docs instanceof Array && docs.length >= 1) ? docs : null);
		});
	});
}

mongoHelper.delete = function(docToFind, collection, callback) {
	MongoClient.connect(GlobalConsts.MONGO_DB_URL, function(errConnect, db) {
		if(errConnect) {
			console.error("deleteFromMongo - Could not connect to server with error: " + errConnect);
			if (typeof callback === "function") callback(false);
			return;
		}
		db.collection(collection).deleteMany(docToFind, function(err, results) {
			db.close();
			if (err) {
				console.log("deleteFromMongo - err: " + err);
				if (typeof callback === "function") callback(false);
			} else {
				if (typeof callback === "function") callback(true);
			}
		});
	});
}

mongoHelper.findAndModify = function(docToFind, docToInsert, collection, callback) {
	MongoClient.connect(GlobalConsts.MONGO_DB_URL, function(errConnect, db) {
		if(errConnect) {
			console.error("findAndModify - Could not connect to server with error: " + errConnect);
			if (typeof callback === "function") callback(null);
			return;
		}
		var res = db.collection(collection).findAndModify(
			docToFind,
			null,
			{
				$setOnInsert: docToInsert
			},
			{
				new: true,   // return new doc if one is upserted
				upsert: true // insert the document if it does not exist
			}, function(err, doc) {
				if (typeof callback === "function") {
					var value = (doc && (typeof doc === "object") && (typeof doc.value == "object")) ? doc.value : null;
					callback(value);
				}
			});
	});
}

mongoHelper.findAndRemove = function(docToFind, collection, callback) {
	MongoClient.connect(GlobalConsts.MONGO_DB_URL, function(errConnect, db) {
		if(errConnect) {
			console.error("findAndRemove - Could not connect to server with error: " + errConnect);
			if (typeof callback === "function") callback(null);
			return;
		}
		var res = db.collection(collection).findAndModify(
			docToFind,
			null,
			{
			},
			{
				remove: true
			}, function(err, doc) {
				if (typeof callback === "function") {
					var value = (doc && (typeof doc === "object") && (typeof doc.value == "object")) ? doc.value : null;
					callback(value);
				}
			});
	});
}

module.exports = mongoHelper;