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
  elements.push({
    "type": "postback",
    "title": "קישורים / Links",
    "payload": "showLinks"
  },
  {
      "type": "postback",
      "title": "Let's Explore / בוא נתחיל",
      "payload": "letsExploreInDefaultLang"
  });
  return elements;
}

view.showThankYouForContacting = function(bot, message, callback) {
  var text = "תודה שפנית לשעות שמחות תל-אביב !"
  + "\nאם רצית ליצור קשר עם מנהלי העמוד, פשוט שלח את ההודעה שלך ונחזור אליך בהקדם."
  + "\nאם אתה רוצה למצוא עסקאות טובות לחץ על הכפתור בוא נתחיל !";

  FacebookHelper.sendButtonTemplate(bot,
    message,
    text,
    [{
      "type": "postback",
      "title": "בוא נתחיל !",
      "payload": "letsExplore"
    },
    {
      "type": "postback",
      "title": "English Please",
      "payload": "showThankYouForContactingEn"
    }],
    callback);
}

view.showThankYouForContactingEn = function(bot, message, callback) {
  var text = "Thank you for contacting HappyHoursTLV !"
  + "\nIf you want to contact the page admin, please write your message and we will get back to you shortly."
  + "\nIf you are looking to explore great new deals then click on Let's Explore !";

  FacebookHelper.sendButtonTemplate(bot,
    message,
    text,
    [{
      "type": "postback",
      "title": "Let's Explore !",
      "payload": "letsExploreEn"
    },
    {
      "type": "postback",
      "title": "בעברית בבקשה",
      "payload": "showThankYouForContacting"
    }],
    callback);
}

view.showContactUs = function(bot, message) {
  var text = "";
  if (message.lang === "en") {
    text = "Please write your message and we will get back to you shortly."
    + "\nTo go back and explore great new deals click on Let's Explore !";
  } else {
    text = "אם רצית ליצור קשר עם מנהלי העמוד, פשוט שלח את ההודעה שלך ונחזור אליך בהקדם."
    + "\nעל מנת לחזור ולחפש עסקאות טובות לחץ על הכפתור בוא נתחיל !";
  }

  FacebookHelper.sendButtonTemplate(bot,
    message,
    text,
    [{
      "type": "postback",
      "title": (message.lang === "en" ? "Let's Explore !" : "בוא נתחיל !"),
      "payload": (message.lang === "en" ? "letsExploreEn" : "letsExplore")
    }],
    callback);
}

view.showGetStartedMessage = function(bot, message, callback) {
  FacebookHelper.sendText(bot, message, (message.firstName ? (message.lang === "en" ? "Hey " : "הי ") + message.firstName + " !" : ""), function() {
  // FacebookHelper.sendText(bot, message, (message.lang === "en" ? "Welcome to HappyHoursTLV !" : "ברוך הבא ל-HappyHoursTLV !"), function() {
  FacebookHelper.sendTextWithQuickReplies(bot,
    message,
    (message.lang === "en" ? "First things first, in order to get the most relevant results it will be best if you could send us your location." : "דבר ראשון, על מנת לקבל תוצאות רלוונטיות הכי טוב שתשלח את מיקומך."),
    [{
      "type":"postback",
      "title": (message.lang === "en" ? "How do I do that ?" : "איך עושים את זה ?"),
      "payload": "showHowToSendMyLocation"
    },
    {
      "type":"postback",
      "title": (message.lang === "en" ? "No thanks" : "לא תודה"),
      "payload": "showMainQuestion"
    },
    {
      "type":"postback",
      "title": (message.lang !== "en" ? "Change language" : "שנה שפה"),
      "payload": "changeLanguage"
    },
    {
      "type":"postback",
      "title": (message.lang !== "en" ? "Contact Page Admin" : "צור קשר"),
      "payload": "changeLanguage"
    }
    ],
    callback);
  // });
  });
}

view.showOnBoardingMessage = function(bot, message, callback) {
  FacebookHelper.sendText(bot,
    message,
    (message.lang === "en" ? "If you are looking for a specific place, simply text it's name." : "אם אתה מחפש מידע על מקום ספציפי, פשוט שלח הודעה עם השם שלו."),
    callback);
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
    },
    {
      "type": "web_url",
      "title": (message.lang === "en" ? "Add your business" : "הוסף את העסק שלך"),
      "url": "https://docs.google.com/forms/d/e/1FAIpQLScz3QshGRoJzbbn8Ztb6VW4T2QbdeZG6LhekajLCs18n7i_Gg/viewform"
    }
    ],
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

view.showMainQuestion = function(bot, message, callback) {
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
  options.push({
    'title': (message.lang !== "en" ? "Change language" : "שנה שפה"),
    'payload': "changeLanguage"
  });
  var address = message["address" + (message.lang === "en" ? "_en" : "")];
  var textForSpecificPlace = "";
  var textForSearch = (message.lang === "en" ? "If you are looking for " : "אם אתה מחפש ")
      + category +
      (message.lang === "en" ? " for " : " ל")
      + time +
      (address ? (message.lang === "en" ? " around " : " באזור ") + address : "") +
      (message.lang === "en" ? ", click on \"Find deals\" !" : ", הקלק על \"מצא דילים\" !")
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
  var buttons = [];
  buttons.push({ type: "web_url", "title": (message.lang === "en" ? "Help" : "עזרה"), url: locationInstructionsUrl});
  buttons.push({ type: "postback", "title": (message.lang === "en" ? "Back to menu" : "חזרה לתפריט"), "payload": "showMainQuestion"});
  FacebookHelper.sendButtonTemplate(bot, message, text, buttons, callback);
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
      FacebookHelper.sendText(bot, message, (message.lang === "en" ? "No relevant deals found :(" : "לא נמצאו דילים רלוונטים :("), function() {
        view.showMainQuestion(bot, message);
      });
    } else {
      FacebookHelper.sendGenericTemplate(bot, message, view.buildDealElements(dealsData, message.lang), function() {
        view.showMainQuestion(bot, message);
      });
    }
  });
}

view.buildDealElement = function(dealData, lang) {
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
  var elements = [];
  var numOfElements = Math.min(dealsData.length, 10);
  for(var i = 0; i < numOfElements; i++) {
    elements.push(view.buildDealElement(dealsData[i], lang));
  }
  return elements;
}

view.showDealsByString = function(bot, message, callback) {
  Api.getDataByHeadline(message.text, message.lang, function(dealData) {
    if (dealData) {
      FacebookHelper.sendGenericTemplate(bot, message, view.buildDealElement(dealData, message.lang), callback);
      return;
    }
    bot.reply(message, (message.lang === "en" ? "Could not find an exact match, here are the most resembling options..." : "לא נמצאה התאמה מדויקת, הנה האופציות הדומות ביותר..."), function() {
      Api.getDataByStringSimilarity(message.text, message.lang, function(dealsData) {
        FacebookHelper.sendGenericTemplate(bot, message, view.buildDealElements(dealsData, message.lang), callback);
      });
    });
  });
}

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

module.exports = view;