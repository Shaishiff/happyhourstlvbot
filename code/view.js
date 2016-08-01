"use strict";

var GlobalConsts = require('./globalConsts');
var Sentences = require('./sentences');
var Api = require('./api');
var Utils = require('./utils');
var FacebookHelper = require('./facebookHelper');
var MongoHelper = require('./mongoHelper');
var view = {};

view.buildPersistentMainMenu = function() {
  var elements = [];
  // elements.push({
  //   "type": "postback",
  //   "title": "מדריך / Guide",
  //   "payload": "startGuide"
  // });
  // elements.push({
  //   "type": "postback",
  //   "title": "חיפוש / Search",
  //   "payload": "startSearch"
  // });
  elements.push({
    "type": "postback",
    "title": "שפה / Language",
    "payload": "changeLanguage"
  });
  elements.push({
    "type": "postback",
    "title": "קישורים / Links",
    "payload": "showLinks"
  });
  return elements;
}

view.showGetStartedMessage = function(bot, message, callback) {
  FacebookHelper.sendText(bot,
    message,
    "Hey" + (message.firstName ? " " + message.firstName : "") + ",\n"
    + "ברוך הבא ל-HappyHoursTLV !\n"
    + ".To change the language go to the menu below\n",
    function() {
        FacebookHelper.sendTextWithQuickReplies(bot,
          message,
          "דבר ראשון, על מנת לקבל תוצאות רלוונטיות הכי טוב שתשלח את מיקומך.\n"
          + "First thing, to get the most relevant results please send us you location.\n",
          [{
            "type":"postback",
            "title": "עדכן את המיקום שלי ?",
            "payload": "showHowToSendMyLocation"
          },
          {
            "type":"postback",
            "title": "לא תודה",
            "payload": "showMainQuestion"
          },
          {
            "type":"postback",
            "title": "Update my location ?",
            "payload": "showHowToSendMyLocation"
          },
          {
            "type":"postback",
            "title": "No thanks",
            "payload": "showMainQuestion"
          }],
          callback);
    });
}

view.showLinks = function(bot, message, callback) {
  FacebookHelper.sendButtonTemplate(bot,
    message,
    (message.lang === "en" ? "Here are a few helpful links..." : "הנה כמה קישורים שימושיים..."),
    [{
      "type": "web_url",
      "title": "happyhourstlv.com",
      "url": "https://happyhourstlv.com"
    },
    {
      "type": "web_url",
      "title": (message.lang === "en" ? "Our fb page" : "עמוד הפייסבוק שלנו"),
      "url": "https://www.facebook.com/happyhourstlv"
    }],
    callback);
}

view.changeLanguage = function(bot, message, callback) {
  FacebookHelper.sendTextWithQuickReplies(bot,
    message,
    "Please choose your preferred language:\n"
    + "בבקשה בחר את השפה המועדפת עליך:\n",
    [{
      "type":"postback",
      "title": "English",
      "payload": "switchedLanguage-en"
    },
    {
      "type":"postback",
      "title": "עברית",
      "payload": "switchedLanguage-"
    }],
    callback);
}

view.foundYourAddress = function(bot, message, address, callback) {
  if (address === "") {
    if (typeof callback === "function") callback();
    return;
  }
  FacebookHelper.sendText(bot,
    message,
    (message.lang === "en" ?
      "Identified your new address as: " + address:
      "הכתובת החדשה שלך זוהתה בתור: " + address) + ".\n"
    + (message.lang === "en" ?
      "You can always change it whenver you want.":
      "תמיד תוכל לשנות את הכתובת מתי שתרצה."),
    function() {
      view.showMainQuestion(bot, message, callback);
    });
}

view.weOnlySupport = function(bot, message, callback) {
  FacebookHelper.sendText(bot,
    message,
    (message.lang ==="en" ?
      "We're sorry we currently only have deals in the Tel Aviv area :(" :
      "מצטערים אבל יש לנו רק עסקאות באזור תל אביב כרגע :("),
    function() {
      view.showMainQuestion(bot, message, callback);
    });
}

// view.buildMainMenu = function(lang) {
//   console.log("buildMainMenu - " + lang);
//   var element = {}
//   element.title = Utils.getSentence("lets_start", lang);
//   element.image_url = "https://www.happyhourstlv.com/assets/cover_long.jpg";
//   element.buttons = [];
//   element.buttons.push({
//     type: "postback",
//     title: (lang === "en" ? "Search" : "חיפוש"),
//     payload: "showSearchMenu-" + (lang === "en" ? "en" : "")
//   });
//   element.buttons.push({
//     type: "postback",
//     title: (lang === "en" ? "Guide" : "מדריך"),
//     payload: "showGuideMenu-" + (lang === "en" ? "en" : "")
//   });
//   element.buttons.push({
//     type: "postback",
//     title: (lang === "en" ? "עברית" : "English"),
//     payload: "showLanguage-" + (lang === "en" ? "" : "en")
//   });

//   return element;
// }

// view.showSearchMenu = function(bot, message, lang) {
//   var gender = "";
//   console.log("showSearchMenu - " + lang);
//   bot.startConversation(message, function(err,convo) {
//     convo.ask(Utils.getSentence("type_name_of_business", lang), function(response, convo) {
//       if(typeof response.text === "string" && response.text.length > 0) {
//         view.showDealsByStringSimilarity(bot, response, lang, response.text, function() {
//           view.showStartMainMenu(bot, message, lang, gender, function() {
//             convo.next();
//           });
//         });
//       } else {
//         convo.say(Utils.getSentence("invalid_response", lang));
//         convo.repeat();
//         convo.next();
//       }
//     });
//   });
// }

view.showMainQuestion = function(bot, message, callback) {
  //console.log("showMainQuestion");
  var category = Utils.getTitleFromDbName(GlobalConsts.CATEGORIES, message.dealCategory, message.lang);
  var time = Utils.getTitleFromDbName(GlobalConsts.TIMES, message.dealTime, message.lang);
  var options = [];
  options.push({
    'title': (message.lang === "en" ? "Find deals !" : "מצא דילים !"),
    'payload': "findOptions"
  });
  options.push({
    'title': (message.lang === "en" ? "Change deal category" : "שנה קטגוריה"),
    'payload': "showCategories"
  });
  options.push({
    'title': (message.lang === "en" ? "Change deal time" : "שנה את זמן הדיל"),
    'payload': "showTimes"
  });
  options.push({
    'title': (message.lang === "en" ? "Set new location ?" : "איך לעדכן מיקום ?"),
    'payload': "showHowToSendMyLocation"
  });
  var address = message["address" + (message.lang === "en" ? "_en" : "")];
  var textForSpecificPlace = (message.lang === "en" ? "If you are looking for a specific place, simply text it's name." : "אם אתה מחפש מידע על מקום ספציפי, פשוט שלח הודעה עם השם שלו.");
  var textForSearch = (message.lang === "en" ? "If you are looking for " : "אם אתה מחפש ")
      + category +
      (message.lang === "en" ? " for " : " ל")
      + time +
      (address ? (message.lang === "en" ? " around " : " באזור ") + address : "") +
      (message.lang === "en" ? ", click on \"find deals\" !" : ", הקלק על \"מצא דילים\" !")
    + (address ? "" :
      "\n" + (message.lang === "en" ? "Note: We don't have your location !\nPlease send it to receive relevant results.\nYou can always update it later." :
        "שים לב: אין לנו את המיקום שלך !\nבבקשה שלח אותו על מנת לקבל תוצאות רלוונטיות.\nתמיד תוכל לעדכן אותו אחר כן."));
  FacebookHelper.sendText(bot,
    message,
    textForSpecificPlace,
    function() {
      FacebookHelper.sendTextWithQuickReplies(bot,
        message,
        textForSearch,
        options,
        callback);
    });
}

view.showHowToSendMyLocation = function(bot, message, callback) {
  var locationInstructionsUrl = "https://www.facebook.com/help/messenger-app/1394730427523556";
  var text = (message.lang === "en" ? "Click on the Help button and follow the instructions" : "הקלק על כפתור עזרה ועקוב אחר ההוראות");
  var button = { type: "web_url", "title": (message.lang === "en" ? "Help" : "עזרה"), url: locationInstructionsUrl};
  FacebookHelper.sendButtonTemplate(bot, message, text, button, callback);
}

view.showCategories = function(bot, message, callback) {
  var options = [];
  for (var i = 0; i < GlobalConsts.CATEGORIES.length; i++) {
    options.push({
      'title': GlobalConsts.CATEGORIES[i]["title" + (message.lang === "en" ? "_en" : "")],
      'payload': "choseCategory-" + GlobalConsts.CATEGORIES[i].db_name
    });
  }
  FacebookHelper.sendTextWithQuickReplies(bot,
    message,
    (message.lang === "en" ? "What kind of deal are you looking for ?" : "איזה סוג דיל בא לך ?"),
    options,
    callback);
}

view.showTimes = function(bot, message, callback) {
  var options = [];
  for (var i = 0; i < GlobalConsts.TIMES.length; i++) {
    options.push({
      'title': GlobalConsts.TIMES[i]["title" + (message.lang === "en" ? "_en" : "")],
      'payload': "choseTime-" + GlobalConsts.TIMES[i].db_name
    });
  }
  FacebookHelper.sendTextWithQuickReplies(bot,
    message,
    (message.lang === "en" ? "When are you looking the deal for ?" : "מתי תרצה ללכת לדיל ?"),
    options,
    callback);
}

view.showDeals = function(bot, message) {
  Api.getData(message, message.lat, message.lon, function(dealsData) {
    if (dealsData.length === 0) {
      FacebookHelper.sendText(bot, message, Utils.getSentence("no_deals_found", message.lang, message.gender), function() {
        view.showMainQuestion(bot, message);
      });
    } else {
      FacebookHelper.sendGenericTemplate(bot, message, view.buildDealElements(dealsData, message.lang), function() {
        view.showMainQuestion(bot, message);
      });
    }
  });
}

// view.showMainMenu = function(bot, message, lang) {
//   FacebookHelper.sendGenericTemplate(bot, message, view.buildMainMenu(lang));
// }

// view.showLanguage = function(bot, message, lang) {
//   console.log("showLanguage - " + lang);
//   bot.reply(message, Utils.getSentence("switching_to_language", lang), function() {
//     Utils.setUserLang(message.user, lang);
//     view.showMainMenu(bot, message, lang);
//   });
// }

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
  //console.log("buildDealElement for: " + dealData["headline" + (lang === "en" ? "_en" : "")]);
  var element = {}
  element.title = dealData["headline" + (lang === "en" ? "_en" : "")];
  if (dealData.image_url) {
    element.image_url = GlobalConsts.HAPPY_HOURS_DOMAIN + "/images/" + dealData.image_url;
  }
  element.item_url = dealData.link;
  element.subtitle = dealData["address" + (lang === "en" ? "_en" : "")] + " - "
  + dealData["main_offer" + (lang === "en" ? "_en" : "")] + " - "
  + dealData["days" + (lang === "en" ? "_en" : "")] ;
  element.buttons = [];
  // if (dealData.link) {
  //   element.buttons.push({
  //     type: 'web_url',
  //     title: (lang.length === 0 ? 'אתר' : "Site"),
  //     url: dealData.link
  //   });
  // }
  if (dealData.phone && typeof dealData.phone === "string" && dealData.phone.length > 6) {
    var phoneNumber = dealData.phone;
    phoneNumber = phoneNumber.replace(/-/g,'');
    if (phoneNumber[0] === "0") {
      phoneNumber = phoneNumber.substr(1);
    }
    phoneNumber = ("+972" + phoneNumber);
    element.buttons.push({
      type: 'phone_number',
      title: (lang.length === 0 ? 'התקשר' : "Call"),
      payload: phoneNumber//'showDealNumber-' + dealData.object_id + "," + lang
    });
  }
  if (dealData.lat && dealData.lon && dealData.address) {
    element.buttons.push({
      type: 'web_url',
      title: (lang.length === 0 ? 'מפה' : "Map"),
      url: "https://maps.google.com/?q=" + dealData["address" + (lang === "en" ? "_en" : "")] + (lang === "en" ? "+Tel+Aviv+Israel" : "+תל+אביב+ישראל")
      // SHAISH: This will show the location with lat+lon instead of address...
      // I think it's not as nice as using the address but will probably be more accurate.
      //url: "http://maps.google.com/maps?q=" + dealData.lat + "," + dealData.lon
    });
  }
  return element;
}

view.buildDealElements = function(dealsData, lang) {
  //console.log("buildDealElements started with number of deals: " + dealsData.length);
  var elements = [];
  var numOfElements = Math.min(dealsData.length, 10);
  for(var i = 0; i < numOfElements; i++) {
    elements.push(view.buildDealElement(dealsData[i], lang));
  }
  return elements;
}

// view.showDealsByDistance = function(bot, message, lat, lon) {
//   console.log("showDealsByDistance started: " + lat + "," + lon);
//   Api.getData(message, lat, lon, function(dealsData) {
//     FacebookHelper.sendGenericTemplate(bot, message, view.buildDealElements(dealsData, message.lang));
//   });
// }

view.showDealsByString = function(bot, message, callback) {
  //console.log("showDealsByStringSimilarity started: " + message.text);
  Api.getDataByHeadline(message.text, message.lang, function(dealData) {
    if (dealData) {
      FacebookHelper.sendGenericTemplate(bot, message, view.buildDealElement(dealData, message.lang), callback);
      return;
    }
    bot.reply(message, Utils.getSentence("cant_find_exact_match_here_are_best_options", message.lang), function() {
      Api.getDataByStringSimilarity(message.text, message.lang, function(dealsData) {
        FacebookHelper.sendGenericTemplate(bot, message, view.buildDealElements(dealsData, message.lang), callback);
      });
    });
  });
}

// view.showDealsByStringSimilarity = function(bot, message, lang, userText, callback) {
//   console.log("showDealsByStringSimilarity started: " + userText);
//   Api.getDataByHeadline(userText, lang, function(dealData) {
//     if (dealData) {
//       FacebookHelper.sendGenericTemplate(bot, message, view.buildDealElement(dealData, lang), callback);
//       return;
//     }
//     bot.reply(message, Utils.getSentence("cant_find_exact_match_here_are_best_options", lang), function() {
//       Api.getDataByStringSimilarity(userText, lang, function(dealsData) {
//         FacebookHelper.sendGenericTemplate(bot, message, view.buildDealElements(dealsData, lang), callback);
//       });
//     });
//   });
// }

view.buildCategoryMenu = function(lang) {
  var elements = [];
  var element;
  for (var i=0; i < GlobalConsts.CATEGORIES.length; i++) {
    var category = GlobalConsts.CATEGORIES[i];
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

  for (var i=0; i < GlobalConsts.TIMES.length; i++) {
    var time = GlobalConsts.TIMES[i];
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

// view.buildStartMainMenuButton = function(lang) {
//   return [{
//     title: (lang === "en" ? "Menu" : "תפריט"),
//     type: "postback",
//     payload: "showMainMenu-" + (lang === "en" ? "en" : "")
//   }];
// }

// view.buildStartMainMenu = function(lang, gender) {
//   return FacebookHelper.buildButtonTemplate(Utils.getSentence("type_menu_to_see_menu", lang, gender), view.buildStartMainMenuButton(lang));
// }

// view.showStartMainMenu = function(bot, message, lang, gender, callback) {
//   FacebookHelper.sendButtonTemplate(bot, message, Utils.getSentence("type_menu_to_see_menu", lang, gender), view.buildStartMainMenuButton(lang), callback);
// }

// view.buildBasedOnLocationQuestion = function(lang, gender) {
//   return FacebookHelper.buildButtonTemplate(Utils.getSentence("do_you_want_based_on_your_location", lang, gender) + "\n" + Utils.getSentence("please_enter_your_location", lang, gender),
//   [{
//     title: (lang === "en" ? "No" : "לא"),
//     type: "postback",
//     payload: (lang === "en" ? "no" : "לא")
//   }]);
// }

// view.showGuideMenu = function(bot, message, lang) {
//   console.log("showGuideMenu - " + JSON.stringify(message));
//   var gender = "";
//   var category = "";
//   var when = GlobalConsts.INVALID_NUM;
//   var lat = GlobalConsts.INVALID_NUM;
//   var lon = GlobalConsts.INVALID_NUM;
//   var invalid_response = Utils.getSentence("invalid_response", lang, gender);
//   var stopping_the_guide = Utils.getSentence("stopping_the_guide", lang, gender);

//   var stopTheGuide = function(convo) {
//     convo.say(stopping_the_guide);
//     convo.say(view.buildStartMainMenu(lang, gender));
//     convo.next();
//   }

//   var askCategory = function(response, convo) {
//     console.log("askCategory started");
//     convo.say(Utils.getSentence("please_choose_category", lang, gender));
//     convo.ask(FacebookHelper.buildGenericTemplate(view.buildCategoryMenu(lang)), function(response, convo) {
//       if (Utils.isUserRequestedToStop(response.text)) {
//         stopTheGuide(convo);
//         return;
//       }
//       if (response.text) {
//         category = Utils.getCategoryDbNameFromText(response.text);
//         console.log("askCategory - user selected category: " + category);
//       }
//       if (category.length > 0) {
//         askWhen(response, convo);
//       } else {
//         convo.say(invalid_response);
//         convo.repeat();
//       }
//       convo.next();
//     });
//   }

//   var askWhen = function(response, convo) {
//     console.log("askWhen started");
//     convo.say(Utils.getSentence("please_choose_the_time", lang, gender));
//     convo.ask(FacebookHelper.buildGenericTemplate(view.buildTimesMenu(lang)), function(response, convo) {
//       if (Utils.isUserRequestedToStop(response.text)) {
//         stopTheGuide(convo);
//         return;
//       }
//       if (response.text) {
//         when = Utils.getTimeDbNameFromText(response.text);
//         console.log("askWhen - user selected time: " + when);
//       }
//       if (when != GlobalConsts.INVALID_NUM) {
//         askWhere(response, convo);
//       } else {
//         convo.say(invalid_response);
//         convo.repeat();
//       }
//       convo.next();
//     });
//   }

//   var askWhere = function(response, convo) {
//     console.log("askWhere started");
//     //convo.say(Utils.getSentence("do_you_want_based_on_your_location", lang, gender));
//     convo.ask(view.buildBasedOnLocationQuestion(lang, gender), function(response, convo) {
//       if (Utils.isUserRequestedToStop(response.text)) {
//           stopTheGuide(convo);
//           return;
//       }
//       if (response.text && response.text.length > 0) {
//         if (response.text === "לא" || response.text === "no") {
//           // No need to find the exact address.
//           lat = 0;
//           lon = 0;
//         } else {
//           Utils.getLatLonFromAddress(response.text, lang, function(latFromGoogle, lonFromGoogle) {
//             if (latFromGoogle && lonFromGoogle) {
//               console.log("Found lat and lon from Google");
//               lat = latFromGoogle;
//               lon = lonFromGoogle;
//             } else {
//               console.error("Could not find lat and lon from Google");
//               convo.say(Utils.getSentence("no_lat_lon_from_google", lang, gender));
//               lat = 0;
//               lon = 0;
//             }
//             showDeals(convo);
//           });
//           return;
//         }
//       } else if (isValidLocationAttachment(response)) {
//         lat = response.attachments[0].payload.coordinates.lat;
//         lon = response.attachments[0].payload.coordinates.long;
//       }
//       if (lat >= 0 && lon >= 0) {
//         showDeals(convo);
//       } else {
//         convo.say(invalid_response);
//         convo.repeat();
//         convo.next();
//       }
//     });
//   }

//   var isValidLocationAttachment = function(response) {
//     return (response.attachments &&
//     response.attachments.length > 0 &&
//     response.attachments[0].payload &&
//     response.attachments[0].payload.coordinates &&
//     response.attachments[0].payload.coordinates.lat &&
//     response.attachments[0].payload.coordinates.long);
//   }

//   var showDeals = function(convo) {
//     Api.getData(lang, category, when, lat, lon, function(dealsData) {
//       if (dealsData.length === 0) {
//         convo.say(Utils.getSentence("no_deals_found", lang, gender));
//         convo.next();
//       } else {
//         convo.next();
//         FacebookHelper.sendGenericTemplate(bot, message, view.buildDealElements(dealsData, lang), function() {
//           //convo.say(Utils.getSentence("type_menu_to_see_menu", lang, gender));
//           view.showStartMainMenu(bot, message, lang, gender, function() {
//             convo.next();
//           });
//         });
//       }
//     });
//   }

//   bot.startConversation(message, askCategory);
// }

module.exports = view;