"use strict";

var FB = require('fb');
var Request = require('request');
var GlobalConsts = require('./globalConsts');
var Utils = require('./utils');
var facebookHelper = {};

facebookHelper.setGreetingText = function(text) {
  // See https://developers.facebook.com/docs/messenger-platform/thread-settings/greeting-text
  Request({
    url: GlobalConsts.FACEBOOK_GREETING_TEXT_URL,
    method: 'POST',
    json: {
      setting_type: "greeting",
      greeting: {
        text: text
      }
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error setting welcome message: ', error);
    } else if (response.body.error) {
      console.log('Error in response body when setting welcome message: ', response.body.error);
    }
  });
}

facebookHelper.setGetStartedButton = function(callback) {
  // See https://developers.facebook.com/docs/messenger-platform/thread-settings/get-started-button
  Request({
    url: GlobalConsts.FACEBOOK_GET_STARTED_BUTTON_URL,
    method: 'POST',
    json: {
      setting_type: "call_to_actions",
      thread_state: "new_thread",
      call_to_actions:[{
        payload: "getStartedButtonWasClicked"
      }]
    }
  }, function(error, response, body) {
    if (error) {
      console.error('Error setting get started button: ', error);
      if(typeof callback === "function") callback(false);
      return;
    } else if (response.body.error) {
      console.error('Error in response body when setting get started button: ', response.body.error);
      if(typeof callback === "function") callback(false);
      return;
    }
    if(typeof callback === "function") callback(true);
    return
  });
}

facebookHelper.setPersistentMainMenu = function(elements, callback) {
  // See https://developers.facebook.com/docs/messenger-platform/thread-settings/persistent-menu
  // Each element is of type:
  // {
  //     "type":"postback"|"web_url",
  //     "title":"Help",
  //     "payload"|"url":"PAYLOAD_OR_URL"
  // }
  if (!(elements instanceof Array)) {
    elements = [elements];
  }
  Request({
    url: GlobalConsts.FACEBOOK_PERSISTENT_MAIN_MENU_URL,
    method: 'POST',
    json: {
      setting_type: "call_to_actions",
      thread_state: "existing_thread",
      call_to_actions: elements
    }
  }, function(error, response, body) {
    if (error) {
      console.error('Error setting persistent main menu: ', error);
      if(typeof callback === "function") callback(false);
      return;
    } else if (response.body.error) {
      console.error('Error in response body when setting persistent main menu: ', response.body.error);
      if(typeof callback === "function") callback(false);
      return;
    }
    if(typeof callback === "function") callback(true);
    return;
  });
}

var validateGenericTemplate = function(elements) {
  // Generic Template Limits:
  // see https://developers.facebook.com/docs/messenger-platform/send-api-reference#guidelines
  // Title: 80 characters
  // Subtitle: 80 characters
  // Call-to-action title: 20 characters
  // Call-to-action items: 3 buttons
  // Bubbles per message (horizontal scroll): 10 elements
  while (elements.length > 10) {
    elements.pop();
  }
  for(var i = 0; i < elements.length; i++) {
    if (typeof elements[i].title === "string") {
      elements[i].title = elements[i].title.substr(0, 80);
    }
    if (typeof elements[i].subtitle === "string") {
      elements[i].subtitle = elements[i].subtitle.substr(0, 80);
    }
    if (Utils.isArray(elements[i].buttons)) {
      while (elements[i].buttons.length > 3) {
        elements[i].buttons.pop();
      }
      for (var j = 0; j < elements[i].buttons; j++) {
        if (typeof elements[i].buttons[j].title === "string") {
          elements[i].buttons[j].title = elements[i].buttons[j].title.substr(0, 20);
        }
      }
    }
  }
  return elements;
}

facebookHelper.buildGenericTemplate = function(elements) {
  if (!Utils.isArray(elements)) {
    elements = [elements];
  }
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: validateGenericTemplate(elements)
      }
    }
  }
}

facebookHelper.sendGenericTemplate = function(bot, message, elements, callback) {
  if (!Utils.isArray(elements)) {
    elements = [elements];
  }
  bot.reply(message, facebookHelper.buildGenericTemplate(elements), callback);
}

facebookHelper.sendMultipleGenericTemplates = function(bot, message, arr, index) {
  if (typeof index !== "number") index = 0;
  if (index >= arr.length) return;
  facebookHelper.sendGenericTemplate(bot, message, arr[index], function() {
    var newIndex = index + 1;
    facebookHelper.sendMultipleGenericTemplates(bot, message, arr, newIndex);
  });
}

facebookHelper.buildButtonTemplate = function(text, elements) {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: text,
        buttons: elements
      }
    }
  }
}

facebookHelper.sendButtonTemplate = function(bot, message, text, elements, callback) {
  if (!(elements instanceof Array)) {
    elements = [elements];
  }
  bot.reply(message, facebookHelper.buildButtonTemplate(text, elements), callback);
}

facebookHelper.buildImage = function(imageUrl) {
  return {
    attachment: {
      type: "image",
      payload: {
        url: imageUrl
      }
    }
  }
}

facebookHelper.sendImage = function(bot, message, imageUrl, callback) {
  if (typeof imageUrl !== "string" || imageUrl.length === 0) {
    callback();
    return;
  }
  bot.reply(message, facebookHelper.buildImage(imageUrl), callback);
}

facebookHelper.buildImageWithTitle = function(imageUrl, title) {
  var element = {
    title: title,
    image_url: imageUrl
  };
  return facebookHelper.buildGenericTemplate(element);
}

facebookHelper.sendImageWithTitle = function(bot, message, imageUrl, title, callback) {
  if (typeof title !== "string" || title.length === 0) {
    facebookHelper.sendImage(bot, message, imageUrl, callback);
    return;
  }
  if (typeof imageUrl !== "string" || imageUrl.length === 0) {
    callback();
    return;
  }
  bot.reply(message, facebookHelper.buildImageWithTitle(imageUrl, title), callback);
}

facebookHelper.sendText = function(bot, message, text, callback) {
  if (typeof text !== "string" || text.length === 0) {
    callback();
    return;
  }
  bot.reply(message, text, callback);
}

facebookHelper.buildTextWithQuickReplies = function(text, replies) {
  // Each item in replies should be of format:
  // {
  //   title: "Some title",
  //   payload: "Some payload"
  // }
  if (!Utils.isArray(replies)) {
    replies = [replies];
  }
  var formattedReplies = [];
  for (var i = 0; i < replies.length; i++) {
    formattedReplies.push({
      "content_type": "text",
      "title": replies[i].title,
      "payload": replies[i].payload
    });
  }
  return {
    "text": text,
    "quick_replies": formattedReplies
  };
}

facebookHelper.sendTextWithQuickReplies = function(bot, message, text, replies, callback) {
  if (typeof text !== "string" || text.length === 0) {
    callback();
    return;
  }
  bot.reply(message, facebookHelper.buildTextWithQuickReplies(text, replies), callback);
}

module.exports = facebookHelper;