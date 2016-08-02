"use strict";

var Sentences = require('./sentences');
var HttpHelper = require('./httpHelper');
var utils = {};

// utils.createRandomString = function(length) {
//     var text = "";
//     var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     for(var i=0; i < length; i++) {
//       text += possible.charAt(Math.floor(Math.random() * possible.length));
//     }
//     return text;
// }

// utils.randomBetweenMinAndMax = function(min, max) {
//   return (Math.floor(Math.random() * max) + min);
// }

utils.isArray = function(arr) {
  return (arr instanceof Array);
}

// utils.randomFromArray = function(arr) {
//   return arr[Math.floor(Math.random() * arr.length)];
// }

utils.shuffleArray = function(array) {
  console.log("before");
  console.log(array);
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  console.log("after");
  console.log(array);
  return array;
}

utils.isNormalInteger = function(str) {
  function isNumeric(num){
    return !isNaN(num)
  }
  function isInt(num) {
    return num % 1 === 0;
  }
  return isNumeric(str) && isInt(str);
}

utils.isNormalIntegerFromMinToMax = function(str, min, max) {
  return utils.isNormalInteger(str) && parseInt(str) >= min && parseInt(str) <= max;
}

// utils.numberWithCommas = function(num) {
//   return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// }

// utils.padWithZeros = function(num, size) {
//     var s = num+"";
//     while (s.length < size) s = "0" + s;
//     return s;
// }

utils.getSentence = function(sentenceKey, lang, gender) {
  if (!Sentences[sentenceKey]) return "";
  if (typeof lang === "undefined" || lang === "") {
    lang = "he";
    if (typeof gender === "undefined" || gender === "") gender = "male";
    return Sentences[sentenceKey][lang][gender];
  } else {
    return Sentences[sentenceKey][lang];
  }
}

utils.getAddressFromLatLon = function(lat, lon, lang, callback) {
  if (lang === "") lang = "iw"; // See: https://developers.google.com/maps/faq#languagesupport
  var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=<LAT>,<LON>&language=<LANG>&location_type=ROOFTOP";
  url += "&key=" + process.env.GOOGLE_API_KEY;
  url = url.replace("<LAT>", lat).replace("<LON>", lon).replace("<LANG>", lang);
  HttpHelper.getJson(url, function(jsonResponse) {
    if (jsonResponse &&
      jsonResponse.status &&
      jsonResponse.status == "OK" &&
      jsonResponse.results &&
      jsonResponse.results.length > 0 &&
      jsonResponse.results[0].formatted_address) {
      var address = jsonResponse.results[0].formatted_address;
      //console.log("Found address: " + address)
      callback(address);
    } else {
      callback(null);
    }
  });
}

utils.getLatLonFromAddress = function(address, lang, callback) {
  address = address.replace(/ /g, "+");
  address += (lang === "en" ? "+Tel+Aviv+Israel" : "+תל+אביב+ישראל");
  address = encodeURIComponent(address);
  var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address;
  url += "&key=" + process.env.GOOGLE_API_KEY;
  HttpHelper.getJson(url, function(jsonResponse) {
    if (jsonResponse &&
      jsonResponse.status &&
      jsonResponse.status == "OK" &&
      jsonResponse.results &&
      jsonResponse.results.length > 0 &&
      jsonResponse.results[0].geometry &&
      jsonResponse.results[0].geometry.location &&
      jsonResponse.results[0].geometry.location.lat &&
      jsonResponse.results[0].geometry.location.lng) {
      var lat = jsonResponse.results[0].geometry.location.lat;
      var lng = jsonResponse.results[0].geometry.location.lng;
      callback(lat, lng);
    } else {
      callback(null, null);
    }
  });
}

utils.isNormalIntegerFromMinToMax = function(str, min, max) {
  // This will work only from 0 to 9 (min/max).
  var regExStr = "[" + min + "-" + max + "]";
  var bRegEx = (new RegExp(regExStr, "i")).test(str);
  console.log("Output of regex test: " + regExStr + " => " + bRegEx + " - for str: " + str);
  return bRegEx;
}

utils.getTitleFromDbName = function(array, dbName, lang) {
  for(var i = 0; i < array.length; i++) {
    if (array[i].db_name === dbName) {
      return array[i]["title" + (lang === "en" ? "_en" : "")];
    }
  }
  return "";
}

utils.getTimeDbNameFromText = function(userText) {
  console.log("getTimeDbNameFromText - " + userText);
  if (utils.isNormalIntegerFromMinToMax(userText, 1, Consts.TIMES.length)) {
    return Consts.TIMES[parseInt(userText) - 1].db_name;
  }
  for(var i = 0; i < Consts.TIMES.length; i++) {
    var time = Consts.TIMES[i];
    console.log("getTimeDbNameFromText: " + JSON.stringify(time));
    if (time.title_en == userText ||
      time.title == userText ||
      time.payload == userText) {
      return time.db_name;
    }
  }
  console.log("getTimeDbNameFromText - could not find user text: " + userText);
  return Consts.INVALID_NUM;
}

utils.getCategoryDbNameFromText = function(userText) {
  console.log("getCategoryDbNameFromText - " + userText);
  if (utils.isNormalIntegerFromMinToMax(userText, 1, Consts.CATEGORIES.length)) {
    return Consts.CATEGORIES[parseInt(userText) - 1].db_name;
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

// utils.getUserInfo = function(userId, callback) {
//   if (typeof userInfoCache[userId] !== "undefined" &&
//     typeof userInfoCache[userId].info !== "undefined" &&
//     typeof userInfoCache[userId].info.first_name === "string" &&
//     typeof userInfoCache[userId].info.last_name === "string" &&
//     typeof userInfoCache[userId].info.gender === "string") {
//     console.log("getUserInfo - Have the user info in the cache.");
//     callback(userInfoCache[userId].info);
//     return;
//   }
//   console.log("getUserInfo - Don't have the user info in the cache, getting it from Mongo.");
//   MongoHelper.getUserInfoFromMongo(userId, function(mongoUserInfo) {
//     if (typeof mongoUserInfo !== "undefined" &&
//       mongoUserInfo.first_name &&
//       mongoUserInfo.last_name &&
//       mongoUserInfo.gender) {
//       console.log("getUserInfo - Got the user info from Mongo.");
//       userInfoCache[userId] = {};
//       userInfoCache[userId].info = {};
//       userInfoCache[userId].info = mongoUserInfo;
//       callback(mongoUserInfo);
//     } else {
//       console.log("getUserInfo - Can't find the user info in the Mongo, calling the facebook API.");
//       HttpHelper.httpGetJson(Consts.FACEBOOK_USER_PROFILE_API.replace("<USER_ID>", userId), function(fbUserInfo) {
//         if (typeof fbUserInfo === "undefined") {
//           console.log("getUserInfo - Can't get the user info from the facebook API.");
//           callback(null);
//         } else {
//           console.log("getUserInfo - Got the user info from the facebook API.");
//           fbUserInfo.user_id = userId;
//           userInfoCache[userId] = {};
//           userInfoCache[userId].info = fbUserInfo;
//           MongoHelper.insertUserInfoToMongo(fbUserInfo, callback);
//         }
//       });
//     }
//   });
// }

module.exports = utils;