"use strict";

var Botkit = require('botkit');
var Sentences = require('./sentences');
var Consts = require('./consts');
var Api = require('./api');
var View = require('./view');
var Utils = require('./utils');
var FacebookHelper = require('./facebookHelper');
var PostBackHelper = require('./postBackHelper');
var AnalyticsHelper = require('./analyticsHelper');
var UserInfoCache = {};

var controller = Botkit.facebookbot({
  access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
  verify_token: process.env.FACEBOOK_VERIFY_TOKEN
})

var bot = controller.spawn({});

// Set up the welcome message.
if (process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
  //FacebookHelper.setWelcomeMessageText("Welcome to happy hours TLV !");
  FacebookHelper.setWelcomeMessageStructuredMessage(View.buildMainMenu());
}

// Set initial data store.
Api.collectData();

// Start web server.
var webServerPort = process.env.PORT || 8080;
controller.setupWebserver(webServerPort, function(err, webserver) {
  controller.createWebhookEndpoints(controller.webserver, bot, function() {
    webserver.get('/health', function(req, res) {
      console.log(req.query);
      res.send('OK');
    });
  });
});

function handleUserAttachment(bot, message, lang) {
  console.log("handleUserAttachment started");
  if (message.attachments.length === 1 &&
    message.attachments[0].payload &&
    message.attachments[0].payload.coordinates &&
    message.attachments[0].payload.coordinates.lat &&
    message.attachments[0].payload.coordinates.long) {
    var lat = message.attachments[0].payload.coordinates.lat;
    var lon = message.attachments[0].payload.coordinates.long;
    View.showDealsByDistance(bot, message, lang, lat, lon);
    return true;
  }
  return false;
}

// Log the message and add more info to the message.
controller.middleware.receive.use(function(bot, message, next) {
  console.log("Message received: " + JSON.stringify(message));
  Utils.getUserInfo(message.user, function(userInfo) {
    if (userInfo) {
      message.userInfo = userInfo;
      message.fullNameWithId = userInfo.first_name + "_" + userInfo.last_name + "_" + message.user;
    } else {
      message.fullNameWithId = message.user;
    }
    AnalyticsHelper.sendUserMsgToAnalytics(message.fullNameWithId, message.text);
    var bNext = true;
    if (message.attachments) {
      bNext = handleUserAttachment(bot, message, "");
    }
    if (bNext) {
      next();
    } else {
      bot.reply(message, "Sorry, I don't understand these kind of stuff :(");
    }
  });
});

controller.middleware.send.use(function(bot, message, next) {
  console.log(JSON.stringify(message));
  Utils.getUserInfo(message.channel, function(userInfo) {
    if (userInfo) {
      if (UserInfoCache[message.channel] && UserInfoCache[message.channel].text_original_lang) {
        userInfo.lang = UserInfoCache[message.channel].text_original_lang;
        console.log("user lang for translation: " + userInfo.lang);
      }
      message.userInfo = userInfo;
      message.fullNameWithId = userInfo.first_name + "_" + userInfo.last_name + "_" + message.channel;
    } else {
      message.fullNameWithId = message.channel;
    }
    AnalyticsHelper.sendBotMsgToAnalytics(message.fullNameWithId, message.text || "-empty-");
    next();
  });
});

// User clicked the send-to-messenger plugin.
controller.on('facebook_optin', function(bot, message) {
  bot.reply(message, 'Hey, welcome !');
});

// User said hello.
controller.hears(Sentences.user_welcoming_messages, 'message_received', function(bot, message) {
  bot.reply(message, Utils.randomFromArray(Sentences.bot_welcoming_messages));
});

// User said thanks.
controller.hears(Sentences.user_says_thanks, 'message_received', function(bot, message) {
  bot.reply(message, Utils.randomFromArray(Sentences.bot_says_you_are_welcome));
});

// User wants help.
controller.hears(Sentences.help_me, 'message_received', function(bot, message) {
  bot.reply(message, Sentences.help_message);
});

// User wants help.
controller.hears(["test"], 'message_received', function(bot, message) {
  bot.reply(message, "testing 123");
});

// Test location.
controller.hears("test location", 'message_received', function(bot, message) {
    var lat = 32.079869;
    var lon = 34.77845;
    bot.reply(message, "Lat: " + lat + ", Lon: " + lon);
    View.showDealsByDistance(bot, message, "", lat, lon);
});

controller.hears("aaa", 'message_received', function(bot, message) {
  console.log("Starting conversation: " + JSON.stringify(message));
  var lang = "";
  var category = "";
  var when = Consts.INVALID_NUM;
  var lat = Consts.INVALID_NUM;
  var lon = Consts.INVALID_NUM;
  var invalid_response = "";
  if (lang.length != 0) {
      invalid_response = "Sorry but that isn't a valid response. If you want to start over just tell me: \"start over\" or just send: \"0\"";
  } else {
    if (message.userInfo.gender === "female") {
      // TODO
      invalid_response = "Sorry but that isn't a valid response. If you want to start over just tell me: \"start over\" or just send: \"0\"";
    } else {
      // TODO
      invalid_response = "Sorry but that isn't a valid response. If you want to start over just tell me: \"start over\" or just send: \"0\"";
    }
  }
  var askCategory = function(response, convo) {
    if (lang.length != 0) {
      convo.say('Please choose which deal are you interested in:');
    } else {
      if (message.userInfo.gender === "female") {
        convo.say('איזה סוג של דיל את רוצה ? (לחצי על הכפתור או שלחי את המספר המתאים)');
      } else {
        convo.say('איזה סוג של דיל אתה רוצה ? (לחץ על הכפתור או שלח את המספר המתאים)');
      }
    }
    convo.ask(FacebookHelper.buildGenericTemplate(View.buildCategoryMenu()), function(response, convo) {
      console.log("response: " + JSON.stringify(response));
      // Check if this a valid response. Options are:
      // - User clicked one of the buttons.
      // - User entered a number.
      // - User entered a value.
      if (response.text) {
        if (Utils.isUserRequestedToStop(response.text)){
          convo.stop();
          return;
        }
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
    if (lang.length != 0) {
      convo.say('When do you want to go ?');
    } else {
      if (message.userInfo.gender === "female") {
        convo.say('מתי את רוצה ללכת ? (לחצי על הכפתור או שלחי את המספר המתאים)');
      } else {
        convo.say('מתי אתה רוצה ללכת ? (לחץ על הכפתור או שלח את המספר המתאים)');
      }
    }
    convo.ask(FacebookHelper.buildGenericTemplate(View.buildTimesMenu()), function(response, convo) {
      console.log("response: " + JSON.stringify(response));
      // Check if this a valid response. Options are:
      // - User clicked one of the buttons.
      // - User entered a number.
      // - User entered a value.
      if (response.text) {
        if (Utils.isUserRequestedToStop(response.text)){
          convo.stop();
          return;
        }
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
    if (lang.length != 0) {
      convo.say("Do you want to find a place based on your location ?");
    } else {
      if (message.userInfo.gender === "female") {
        convo.say('את רוצה למצוא מקום לפי המיקום שלך ?');
      } else {
        convo.say('אתה רוצה למצוא מקום לפי המיקום שלך ?');
      }
    }
    var pleaseEnter = "";
    if (lang.length != 0) {
      pleaseEnter = "If so, please enter street name and number or you can just send your GPS location.\nSend \"no\" if location doesn't matter to you.";
    } else {
      if (message.userInfo.gender === "female") {
        pleaseEnter = "אם כן, הכנסי את שם הרחוב ומספר הבית או שלחי את מיקום ה-גי.פי.אס.\nכתבי \"לא\" אם המיקום לא משנה לך.";
      } else {
        pleaseEnter = "אם כן, הכנס את שם הרחוב ומספר הבית או שלח את מיקום ה-גי.פי.אס.\nכתוב \"לא\" אם המיקום לא משנה לך.";
      }
    }
    convo.ask(pleaseEnter, function(response, convo) {
      console.log("response: " + JSON.stringify(response));
      // Check if this a valid response. Options are:
      // - User clicked one of the buttons.
      // - User entered a number.
      // - User entered a value.
      if (response.text && response.text.length > 0) {
        if (Utils.isUserRequestedToStop(response.text)) {
          convo.stop();
          return;
        } else if (response.text === "לא" || response.text === "no") {
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
            Api.getData(lang, category, when, lat, lon, function(dealsData) {
              if (dealsData.length === 0) {
                convo.say("No deals found :(");
              } else {
                FacebookHelper.sendGenericTemplate(bot, message, View.buildDealElements(dealsData, lang));
              }
            });
            convo.next();
          });
          return;
        }
      } else if (response.attachments &&
          response.attachments.length > 0 &&
          response.attachments[0].payload &&
          response.attachments[0].payload.coordinates &&
          response.attachments[0].payload.coordinates.lat &&
          response.attachments[0].payload.coordinates.long) {
        lat = response.attachments[0].payload.coordinates.lat;
        lon = response.attachments[0].payload.coordinates.long;
      }
      if (lat >= 0 && lon >= 0) {
        Api.getData(lang, category, when, lat, lon, function(dealsData) {
          FacebookHelper.sendGenericTemplate(bot, message, View.buildDealElements(dealsData, lang));
        });
      } else {
        convo.say(invalid_response);
        convo.repeat();
      }
      convo.next();
    });
  }

  bot.startConversation(message, askCategory);
});

// Main menu.
controller.hears(Sentences.user_wants_main_menu, 'message_received', function(bot, message) {
  View.showMainMenu(bot, message);
});

// Similar string.
// controller.hears(["(.*)"], 'message_received', function(bot, message) {
//     if(typeof message.text === "string" && message.text.length > 0) {
//       View.showDealsByStringSimilarity(bot, message, "", message.text);
//     }
// });

// Not sure what the users wants. Final fallback.
controller.on('message_received', function(bot, message) {
  //console.log("Reached unknown user message");
  //if (message.text) notSureWhatUserWants(bot, message);
  //return false;
});

function notSureWhatUserWants(bot, message) {
  console.log("No idea what the user wants...");
  bot.reply(message, Utils.randomFromArray(Sentences.bot_not_sure_what_user_means));
  AnalyticsHelper.sendUserMsgToAnalytics("unknown_msgs", message.text);
}

// Facebook postsbacks.
controller.on('facebook_postback', function(bot, message) {
  AnalyticsHelper.sendUserMsgToAnalytics(message.user, "facebook_postback-" + message.payload);
  PostBackHelper.handlePostBack(bot, message, message.payload);
});
