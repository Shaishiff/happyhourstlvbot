"use strict";

var Consts = require('./consts');
var MongoHelper = require('./mongoHelper');
var HttpHelper = require('./httpHelper');
var utils = {};

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