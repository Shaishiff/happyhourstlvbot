"use strict";
//
var Consts = require('./consts');
var Api = require('./api');
var FacebookHelper = require('./facebookHelper');
var MongoHelper = require('./mongoHelper');
var view = {};

view.buildLanguageMenu = function() {
  console.log("buildLanguageMenu");
  var element = {}
  element.title = "בחר/י את השפה שלך - Choose your language";
  element.image_url = "http://www.happyhourstlv.com/assets/cover_long.jpg";
  element.buttons = [];
  element.buttons.push({
    type: "postback",
    title: "עברית",
    payload: "showFirstMessage-he"
  });
  element.buttons.push({
    type: "postback",
    title: "English",
    payload: "showFirstMessage-en"
  });

  return element;
}

view.showLanguageMenu = function(bot, message) {
  FacebookHelper.sendGenericTemplate(bot, message, view.buildLanguageMenu());
}

view.showFirstMessage = function(bot, message, postbackData) {
  console.log("showFirstMessage with " + postbackData);
  if (!message.userInfo) {
    message.userInfo = {};
    message.userInfo.user_id = message.user;
  }
  bot.reply(message, "You chose the language: " + postbackData);
  if (postbackData === "he") postbackData = ""; // Hebrew is the default language.
  message.userInfo.chosen_lang = postbackData;
  MongoHelper.upsertUserInfoToMongo(message.userInfo.user_id, message.userInfo, function(res){
    bot.reply(message, "Data saved to mongo: " + res);
  });
}

view.showDealNumber = function(bot, message, postbackData) {
  if (!postbackData) return;
  if (postbackData.indexOf(",") === -1) postbackData += ",";
  var objectId = postbackData.split(",")[0];
  var lang = postbackData.split(",")[1];
  Api.getDataByObjectId(objectId, function(dealData) {
    if (!dealData || !dealData.phone) {
      bot.reply(message, "Sorry but I don't have the number :(");
      return;
    }
    bot.reply(message, dealData["headline" + lang] + "\n" + dealData.phone);
  });
}

view.buildDealElement = function(dealData, lang) {
  console.log("buildDealElement for: " + dealData["headline" + lang]);
  var element = {}
  element.title = dealData["headline" + lang];
  if (dealData.image_url) {
    element.image_url = Consts.HAPPY_HOURS_DOMAIN + "/images/" + dealData.image_url;
  }
  element.subtitle = dealData["address" + lang] + " - " + dealData["main_offer" + lang];
  element.buttons = [];
  if (dealData.link) {
    element.buttons.push({
      type: 'web_url',
      title: (lang.length === 0 ? 'לאתר' : "Web site"),
      url: dealData.link
    });
  }
  if (dealData.phone) {
    element.buttons.push({
      type: 'postback',
      title: (lang.length === 0 ? 'מספר טלפון' : "Phone number"),
      payload: 'showDealNumber-' + dealData.object_id + "," + lang
    });
  }
  if (dealData.lat && dealData.lon && dealData.address) {
    element.buttons.push({
      type: 'web_url',
      title: (lang.length === 0 ? 'פתח במפה' : "Show in map"),
      url: "http://maps.google.com/?q=" + dealData["address" + lang]
      // SHAISH: This will show the location with lat+lon instead of address...
      // I think it's not as nice as using the address but will probably be more accurate.
      //url: "http://maps.google.com/maps?q=" + dealData.lat + "," + dealData.lon
    });
  }
  return element;
}

view.buildDealElements = function(dealsData, lang) {
  console.log("buildDealElements started");
  var elements = [];
  for(var i = 0; i < 10; i++) {
    elements.push(view.buildDealElement(dealsData[i], lang));
  }
  return elements;
}

view.showDealsByDistance = function(bot, message, lang, lat, lon) {
  console.log("showDealsByDistance started: " + lat + "," + lon);
  console.log(typeof Api);
  console.log(typeof Api.getDataByDistanceFromUser);
  Api.getDataByDistanceFromUser(lat, lon, function(dealsData) {
    FacebookHelper.sendGenericTemplate(bot, message, view.buildDealElements(dealsData, lang));
  });
}

view.showDealsByStringSimilarity = function(bot, message, lang, userText) {
  console.log("showDealsByStringSimilarity started: " + userText);
  Api.getDataByStringSimilarity(userText, lang, function(dealsData) {
    FacebookHelper.sendGenericTemplate(bot, message, view.buildDealElements(dealsData, lang));
  });
}

view.buildCategoryMenu = function() {
  var elements = [];
  var element;

  for (var i=0; i < Consts.CATEGORIES.length; i++) {
    var category = Consts.CATEGORIES[i];
    element = {}
    element.title = "" + (i+1);
    element.image_url = category.image_url;
    element.buttons = [];
    element.buttons.push({
      'type': 'postback',
      'title': category.title,
      'payload': category.payload
    });
    elements.push(element);
  }

  return elements;
}

view.showCategoryMenu = function(bot, message) {
  FacebookHelper.sendGenericTemplate(bot, message, view.buildCategoryMenu());
}


view.buildTimesMenu = function() {
  var elements = [];
  var element;

  for (var i=0; i < Consts.TIMES.length; i++) {
    var time = Consts.TIMES[i];
    element = {}
    element.title = "" + (i+1);
    element.image_url = time.image_url;
    element.buttons = [];
    element.buttons.push({
      'type': 'postback',
      'title': time.title,
      'payload': time.payload
    });
    elements.push(element);
  }

  return elements;
}

module.exports = view;