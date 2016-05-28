"use strict";

var Consts = require('./consts');
var Sentences = require('./sentences');
var MongoHelper = require('./mongoHelper');
var HttpHelper = require('./httpHelper');
var utils = {};

utils.getLatLonFromAddress = function(address, callback) {
  console.log("Finding lat and lon for address: " + address);
  var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address;
  url += "&key=" + process.env.GOOGLE_API_KEY;
  httpHelper.httpGetJson(url, function(jsonResponse) {
    if (jsonResponse &&
      jsonResponse.status &&
      jsonResponse.status == "OK" &&
      jsonResponse.results &&
      jsonResponse.results.length > 0 &&
      jsonResponse.results[0].geomatry &&
      jsonResponse.results[0].geomatry.location &&
      jsonResponse.results[0].geomatry.location.lat &&
      jsonResponse.results[0].geomatry.location.lng) {
      var lat = sonResponse.results[0].geomatry.location.lat;
      var lng = jsonResponse.results[0].geomatry.location.lng;
      console.log("Found lat and long from address: " + lat + "," + lng)
      callback(lat, lng);
    } else {
      callback(null, null);
    }
  });
}

utils.isUserRequestedToStop = function(userText) {
  var bStop = (Sentences.indexOf(userText) != -1);
  if (bStop) {
    console.log("User requested to stop: " + userText);
  }
  return bStop;
}

utils.isNormalIntegerFromMinToMax = function(str, min, max) {
  // This will work only from 0 to 9 (min/max).
  var regExStr = "[" + min + "-" + max + "]";
  var bRegEx = (new RegExp(regExStr, "i")).test(str);
  console.log("Output of regex test: " + regExStr + " => " + bRegEx + " - for str: " + str);
  return bRegEx;
}

utils.getTimeDbNameFromText = function(userText) {
  if (utils.isNormalIntegerFromMinToMax(userText, 1, Consts.TIMES.length)) {
    return Consts.TIMES.length[parseInt(userText) - 1].db_name;
  }
  for(var i = 0; i < Consts.TIMES.length; i++) {
    var time = Consts.TIMES[i];
    if (time.title_en == userText ||
      time.title == userText ||
      time.payload == userText) {
      return time.db_name;
    }
  }
  console.log("getTimeDbNameFromText - could not find user text: " + userText);
  return "";
}

utils.getCategoryDbNameFromText = function(userText) {
  if (utils.isNormalIntegerFromMinToMax(userText, 1, Consts.CATEGORIES.length)) {
    return Consts.CATEGORIES.length[parseInt(userText) - 1].db_name;
  }
  for(var i = 0; i < Consts.CATEGORIES.length; i++) {
    var cat = Consts.CATEGORIES[i];
    if (cat.title_en == userText ||
      cat.title == userText ||
      cat.payload == userText) {
      return cat.db_name;
    }
  }
  console.log("getCategoryDbNameFromText - could not find user text: " + userText);
  return "";
}

// Compute the edit distance between the two given strings
// Taken from: https://gist.github.com/andrei-m/982927
utils.getEditDistance = function(a, b) {
  if(a.length == 0) return b.length;
  if(b.length == 0) return a.length;
  var matrix = [];
  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }
  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }
  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b.charAt(i-1) == a.charAt(j-1)){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                       Math.min(matrix[i][j-1] + 1, // insertion
                       matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
};

utils.changeDateFormat = function(str) {
  // "10/06/2016 22:00" -> "06/10/2016 22:00"
  var date = str.split(" ")[0];
  var hour = str.split(" ")[1];
  var date_new_format = date.split("/")[1] + "/" + date.split("/")[0] + "/" + date.split("/")[2];
  return date_new_format + " " + hour;
}

utils.getUserInfo = function(userId, callback) {
  MongoHelper.getUserInfoFromMongo(userId, function(userInfo) {
    if (typeof userInfo !== "undefined" &&
      userInfo.first_name &&
      userInfo.last_name &&
      userInfo.gender) {
      console.log("Got the user info from mongoDB");
      callback(userInfo);
    } else {
      console.log("Can't find the user info in the mongoDB");
      HttpHelper.httpGetJson(Consts.FACEBOOK_USER_PROFILE_API.replace("<USER_ID>", userId), function(userInfo) {
        userInfo.user_id = userId;
        MongoHelper.insertUserInfoToMongo(userInfo, callback);
      });
    }
  });
}

utils.randomFromArray = function(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = utils;