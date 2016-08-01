"use strict";

var Sentences = require('./sentences');
var utils = {};

utils.createRandomString = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i=0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

utils.randomBetweenMinAndMax = function(min, max) {
  return (Math.floor(Math.random() * max) + min);
}

utils.isArray = function(arr) {
  return (arr instanceof Array);
}

utils.randomFromArray = function(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

utils.shuffleArray = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

utils.isNormalInteger = function(str) {
  function isNumeric(num){
    return !isNaN(num)
  }
  function isInt(num) {
    return num % 1 === 0;
  }
  return isNumeric(str) && isInt(str);
}

utils.isNormalIntegerFromMinToMax = function(str, min, max) {
  return utils.isNormalInteger(str) && parseInt(str) >= min && parseInt(str) <= max;
}

utils.numberWithCommas = function(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

utils.padWithZeros = function(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

module.exports = utils;