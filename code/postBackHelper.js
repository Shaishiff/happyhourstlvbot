"use strict";

var Controller = require('./controller');
var postBackHelper = {};

postBackHelper.handlePostBack = function(bot, message, payload) {
	if(payload.indexOf("-") === -1 ) payload += "-";
	var postBackId = payload.split("-")[0];
	var postBackData = payload.split("-")[1];
	if (typeof Controller[postBackId] === "function") {
		Controller[postBackId](bot, message, postBackData);
	}
}

module.exports = postBackHelper;