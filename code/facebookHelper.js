"use strict";

var FB = require('fb');
var Request = require('request');
var GlobalConsts = require('./globalConsts');
var Utils = require('./utils');
var facebookHelper = {};

// DEBUG
facebookHelper.test = function() {
  return;

  var accessToken = GlobalConsts.FACEBOOK_APP_ID + "|" + GlobalConsts.FACEBOOK_APP_SECRET;
  var fb = FB.withAccessToken(accessToken);
  // var webhookConfig = {
  //   object: 'page',
  //   callback_url: 'https://slotochat.herokuapp.com/messenger',
  //   verify_token: "my_token",
  //   fields: [ 'messages', 'messaging_account_linking', 'messaging_optins', 'messaging_postbacks' ],
  //   active: true
  // };
  fb.api(GlobalConsts.FACEBOOK_APP_ID + '/subscriptions', 'get', function (res) {
    if(!res || res.error) {
      console.log(!res ? 'error occurred' : res.error);
      return;
    }
    console.log(res.data[0]);
    var webhookConfig = res.data[0];
    webhookConfig.verify_token = "my_token";
    if (webhookConfig.callback_url.indexOf("slotochat-staging.herokuapp") === -1) {
      webhookConfig.callback_url = 'https://slotochat-staging.herokuapp.com/messenger';
    } else {
      webhookConfig.callback_url = 'https://slotochat.herokuapp.com/messenger';
    }
    fb.api(GlobalConsts.FACEBOOK_APP_ID + '/subscriptions', 'post', webhookConfig, function (res) {
      if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
      }
      console.log(res);
    });
  });
  return;

  // See: https://developers.facebook.com/docs/graph-api/reference/v2.0/post
  // var accessToken = "";
  // var fb = FB.withAccessToken(accessToken);
  // fb.api('me', { fields: ['id', 'name', 'age_range', 'email'] }, function (res) {
  //   if(!res || res.error) {
  //   console.log(!res ? 'error occurred' : res.error);
  //   return;
  //   }
  //   //console.log("res: ", res);
  // });
  var message = 'This is a test: ' + (new Date()).getTime();
  var link = "https://qq5l031s6h.execute-api.us-east-1.amazonaws.com/dev";
  fb.api('me/feed', 'post', { message: message, link: link}, function (res) {
    if(!res || res.error) {
      console.log(!res ? 'error occurred' : res.error);
      return;
    }
    console.log('Post Id: ' + res.id);
    fb.api(res.id, { fields: ['application', 'message', 'privacy'] }, function (resGet) {
      if(!resGet || resGet.error) {
        console.log(!resGet ? 'error occurred' : resGet.error);
        return;
      }
      console.log('Get response', resGet);
    });
  });
}
//

facebookHelper.extendAccessTokenExpirationTime = function(accessToken, callback) {
  // See: https://developers.facebook.com/docs/facebook-login/access-tokens/expiration-and-extension
  // See: https://www.npmjs.com/package/fb#extend-expiry-time-of-the-access-token
  FB.api('oauth/access_token', {
      client_id: GlobalConsts.FACEBOOK_APP_ID,
      client_secret: GlobalConsts.FACEBOOK_APP_SECRET,
      grant_type: 'fb_exchange_token',
      fb_exchange_token: accessToken
  }, function (res) {
      if(!res || res.error) {
          console.log(!res ? 'error occurred' : res.error);
          callback(null);
          return;
      }
      var newAccessToken = res.access_token;
      var expiresIn = res.expires ? res.expires : 0;
      callback({accessToken:newAccessToken, expiresIn: expiresIn});
  });
}

facebookHelper.getUserGraphApiInfo = function(fbAccountLinkingInfo, callback) {
  var accessToken = fbAccountLinkingInfo.accessToken;
  var fb = FB.withAccessToken(accessToken);
  fb.api('me', { fields: ['age_range', 'email'] }, function (res) {
    if (!res || res.error) {
      callback(null);
      return;
    }
    callback(res);
  });
}

facebookHelper.getUserGraphApiFriendsInfo = function(fbAccountLinkingInfo, callback) {
  var accessToken = fbAccountLinkingInfo.accessToken;
  var fb = FB.withAccessToken(accessToken);
  fb.api(fbAccountLinkingInfo.fbUserId + '/friends', {}, function (res) {
    if (!res || res.error) {
      callback(null);
      return;
    }
    callback(res);
  });
}

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