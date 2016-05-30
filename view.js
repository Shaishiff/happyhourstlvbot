"use strict";
//
var Consts = require('./consts');
var Sentences = require('./sentences');
var Api = require('./api');
var Utils = require('./utils');
var FacebookHelper = require('./facebookHelper');
var MongoHelper = require('./mongoHelper');
var view = {};

view.buildMainMenu = function(lang) {
  console.log("buildMainMenu - " + lang);
  var element = {}
  element.title = Utils.getSentence("lets_start", lang);
  element.image_url = "http://www.happyhourstlv.com/assets/cover_long.jpg";
  element.buttons = [];
  element.buttons.push({
    type: "postback",
    title: (lang === "en" ? "Search" : "חיפוש"),
    payload: "showSearchMenu-" + (lang === "en" ? "en" : "")
  });
  element.buttons.push({
    type: "postback",
    title: (lang === "en" ? "Guide" : "מדריך"),
    payload: "showGuideMenu-" + (lang === "en" ? "en" : "")
  });
  element.buttons.push({
    type: "postback",
    title: (lang === "en" ? "עברית" : "English"),
    payload: "showLanguage-" + (lang === "en" ? "" : "en")
  });

  return element;
}

view.showSearchMenu = function(bot, message, lang) {
  console.log("showSearchMenu - " + lang);
  bot.startConversation(message, function(err,convo) {
    convo.ask(Utils.getSentence("type_name_of_business", lang), function(response, convo) {
      if(typeof response.text === "string" && response.text.length > 0) {
        view.showDealsByStringSimilarity(bot, response, lang, response.text, function() {
          convo.say(Utils.getSentence("type_menu_to_see_menu", lang));
          convo.next();
        });
      } else {
        convo.say(Utils.getSentence("invalid_response", lang));
        convo.repeat();
        convo.next();
      }
    });
  });
}

view.showMainMenu = function(bot, message, lang) {
  FacebookHelper.sendGenericTemplate(bot, message, view.buildMainMenu(lang));
}

view.showLanguage = function(bot, message, lang) {
  console.log("showLanguage - " + lang);
  bot.reply(message, Utils.getSentence("switching_to_language", lang), function() {
    Utils.setUserLang(message.user, lang);
    view.showMainMenu(bot, message, lang);
  });
}

// view.showFirstMessage = function(bot, message, postbackData) {
//   console.log("showFirstMessage with " + postbackData);
//   if (!message.userInfo) {
//     message.userInfo = {};
//     message.userInfo.user_id = message.user;
//   }
//   bot.reply(message, "You chose the language: " + postbackData);
//   if (postbackData === "he") postbackData = ""; // Hebrew is the default language.
//   message.userInfo.chosen_lang = postbackData;
//   MongoHelper.upsertUserInfoToMongo(message.userInfo.user_id, message.userInfo, function(res){
//     bot.reply(message, "Data saved to mongo: " + res);
//   });
// }

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
    bot.reply(message, dealData["headline" + (lang === "en" ? "_en" : "")] + "\n" + dealData.phone);
  });
}

view.buildDealElement = function(dealData, lang) {
  console.log("buildDealElement for: " + dealData["headline" + (lang === "en" ? "_en" : "")]);
  var element = {}
  element.title = dealData["headline" + (lang === "en" ? "_en" : "")];
  if (dealData.image_url) {
    element.image_url = Consts.HAPPY_HOURS_DOMAIN + "/images/" + dealData.image_url;
  }
  element.subtitle = dealData["address" + (lang === "en" ? "_en" : "")] + " - " + dealData["main_offer" + (lang === "en" ? "_en" : "")];
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
  var numOfElements = Math.min(dealsData.length, 10);
  for(var i = 0; i < numOfElements; i++) {
    elements.push(view.buildDealElement(dealsData[i], lang));
  }
  return elements;
}

view.showDealsByDistance = function(bot, message, lang, lat, lon) {
  console.log("showDealsByDistance started: " + lat + "," + lon);
  console.log(typeof Api);
  console.log(typeof Api.getDataByDistanceFromUser);
  Api.getDataByDistanceFromUser(null, lat, lon, function(dealsData) {
    FacebookHelper.sendGenericTemplate(bot, message, view.buildDealElements(dealsData, lang));
  });
}

view.showDealsByStringSimilarity = function(bot, message, lang, userText, callback) {
  console.log("showDealsByStringSimilarity started: " + userText);
  Api.getDataByHeadline(userText, lang, function(dealData) {
    if (dealData) {
      FacebookHelper.sendGenericTemplate(bot, message, view.buildDealElement(dealData, lang), callback);
      return;
    }
    bot.reply(message, Utils.getSentence("cant_find_exact_match_here_are_best_options", lang), function() {
      Api.getDataByStringSimilarity(userText, lang, function(dealsData) {
        FacebookHelper.sendGenericTemplate(bot, message, view.buildDealElements(dealsData, lang), callback);
      });
    });
  });
}

view.buildCategoryMenu = function(lang) {
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
      'title': category["title" + (lang === "en" ? "_en" : "")],
      'payload': category.payload
    });
    elements.push(element);
  }
  return elements;
}

view.buildTimesMenu = function(lang) {
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
      'title': time["title" + (lang === "en" ? "_en" : "")],
      'payload': time.payload
    });
    elements.push(element);
  }
  return elements;
}

view.showGuideMenu = function(bot, message, lang) {
  console.log("showGuideMenu - " + JSON.stringify(message));
  var gender = "";
  var category = "";
  var when = Consts.INVALID_NUM;
  var lat = Consts.INVALID_NUM;
  var lon = Consts.INVALID_NUM;
  var invalid_response = Utils.getSentence("invalid_response", lang, gender);

  var askCategory = function(response, convo) {
    convo.say(Utils.getSentence("please_choose_category", lang, gender));
    convo.ask(FacebookHelper.buildGenericTemplate(view.buildCategoryMenu(lang)), function(response, convo) {
      if (Utils.isUserRequestedToStop(response.text)) {
        convo.say(Utils.getSentence("stopping_the_guide", lang, gender) + "\n" + Utils.getSentence("type_menu_to_see_menu", lang));
        convo.stop();
        return;
      }
      if (response.text) {
        category = Utils.getCategoryDbNameFromText(response.text);
      }
      if (category.length > 0) {
        askWhen(response, convo);
      } else {
        convo.say(invalid_response);
        convo.repeat();
      }
      convo.next();
    });
  }

  var askWhen = function(response, convo) {
    convo.say(Utils.getSentence("please_choose_the_time", lang, gender));
    convo.ask(FacebookHelper.buildGenericTemplate(View.buildTimesMenu(lang)), function(response, convo) {
      if (Utils.isUserRequestedToStop(response.text)) {
        convo.stop();
        return;
      }
      if (response.text) {
        when = Utils.getTimeDbNameFromText(response.text);
      }
      if (when != Consts.INVALID_NUM) {
        askWhere(response, convo);
      } else {
        convo.say(invalid_response);
        convo.repeat();
      }
      convo.next();
    });
  }

  var askWhere = function(response, convo) {
    convo.say(Utils.getSentence("do_you_want_based_on_your_location", lang, gender));
    convo.ask(convo.say(Utils.getSentence("please_enter_your_location", lang, gender)), function(response, convo) {
      if (Utils.isUserRequestedToStop(response.text)) {
          convo.stop();
          return;
      }
      if (response.text && response.text.length > 0) {
        if (response.text === "לא" || response.text === "no") {
          // No need to find the exact address.
          lat = 0;
          lon = 0;
        } else {
          Utils.getLatLonFromAddress(response.text, function(latFromGoogle, lonFromGoogle) {
            if (latFromGoogle && lonFromGoogle) {
              console.log("Found lat and lon from Google");
              lat = latFromGoogle;
              lon = lonFromGoogle;
            } else {
              console.error("Could not find lat and lon from Google");
              lat = 0;
              lon = 0;
            }
            showDeals();
            convo.next();
          });
          return;
        }
      } else if (isValidLocationAttachment(response)) {
        lat = response.attachments[0].payload.coordinates.lat;
        lon = response.attachments[0].payload.coordinates.long;
      }
      if (lat >= 0 && lon >= 0) {
        showDeals();
      } else {
        convo.say(invalid_response);
        convo.repeat();
      }
      convo.next();
    });
  }

  var isValidLocationAttachment = function(response) {
    return (response.attachments &&
    response.attachments.length > 0 &&
    response.attachments[0].payload &&
    response.attachments[0].payload.coordinates &&
    response.attachments[0].payload.coordinates.lat &&
    response.attachments[0].payload.coordinates.long);
  }

  var showDeals = function() {
    Api.getData(lang, category, when, lat, lon, function(dealsData) {
      if (dealsData.length === 0) {
        convo.say("No deals found :(");
      } else {
        FacebookHelper.sendGenericTemplate(bot, message, View.buildDealElements(dealsData, lang));
      }
    });
  }
  bot.startConversation(message, askCategory);
}

module.exports = view;