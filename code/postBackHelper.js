"use strict";

var Controller = require('./controller');
var postBackHelper = {};

postBackHelper.handlePostBack = function(bot, message, payload) {
	if(payload.indexOf("-") === -1 ) payload += "-";
	var postBackId = payload.split("-")[0];
	var postBackData = payload.split("-")[1];
	if (typeof Controller[postBackId] === "function") {
		Controller[postBackId](bot, message, postBackData);
	} else {
		Controller.defaultPostBackDataHandler(bot, message, postBackId, postBackData);
	}
}

// postBackHelper.isPostBack = function(message) {
// 	if (typeof message.text !== "string") return false;
// 	var payload = message.text;
// 	if(payload.indexOf("-") === -1 ) payload += "-";
// 	var postBackId = payload.split("-")[0];
// 	if (typeof Controller[postBackId] === "function") {
// 		return true;
// 	} else {
// 		return false;
// 	}
// }

module.exports = postBackHelper;