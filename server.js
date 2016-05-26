"use strict";
// test
var Botkit = require('botkit');
var Sentences = require('./sentences');
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
  FacebookHelper.setWelcomeMessageText("Welcome to happy hours TLV !");
  //FacebookHelper.setWelcomeMessageStructuredMessage(View.buildMainMenu());
}

// Set initial data store.
Api.collectData();

// Start web server.
var webServerPort = process.env.PORT || 8080;
controller.setupWebserver(webServerPort, function(err, webserver) {
  controller.createWebhookEndpoints(controller.webserver, bot, function() {
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
  }
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
    if (message.attachments) handleUserAttachment(bot, message, "")
    next();
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

// Test location.
controller.hears("test location", 'message_received', function(bot, message) {
    var lat = 32.079869;
    var lon = 34.77845;
    bot.reply(message, "Lat: " + lat + ", Lon: " + lon);
    View.showDealsByDistance(bot, message, "", lat, lon);
});

controller.hears("aaa", 'message_received', function(bot, message) {
     var askCategory = function(response, convo) {
      convo.say('Please choose which deal are you interested in:');
      convo.ask(FacebookHelper.buildGenericTemplate(View.buildCategoryMenu()), function(response, convo) {
        console.log("response: " + JSON.stringify(response));
        // TODO check if this a valid response
        if (response.text) {

        }
        askWhen(response, convo);
        convo.next();
      });
    }
    var askWhen = function(response, convo) {
      convo.say('When do you want to go ?');
      convo.ask(FacebookHelper.buildGenericTemplate(View.buildTimesMenu()), function(response, convo) {
        console.log("response: " + JSON.stringify(response));
        // TODO check if this a valid response
        if (response.text) {

        }
        askWhere(response, convo);
        convo.next();
      });
    }
    var askWhere = function(response, convo) {
      convo.ask("Do you want to find a place based on your location ?\nIf so, please enter street name and number or you can just send your GPS location. Send \"no\" if location doesn't matter to you.", function(response, convo) {
        console.log("response: " + JSON.stringify(response));
        // TODO check if this a valid response
        if (response.text) {

        }
        convo.say('All done !');
        convo.next();
      });
    }

    bot.reply(message, "aaa");
    bot.startConversation(message, askCategory);
});

// Main menu.
controller.hears(["menu","תפריט"], 'message_received', function(bot, message) {
  View.showCategoryMenu(bot, message);
});

// Similar string.
/*
controller.hears(["(.*)"], 'message_received', function(bot, message) {
    if(message.text && message.text.length > 0) {
      View.showDealsByStringSimilarity(bot, message, "", message.text);
    }
});
*/

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
