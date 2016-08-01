"use strict";

console.log("Web server app started", new Date(), process.env.NODE_ENV);
require('./botInitializer').init(function(fbBot, spawnedBot) {
  // Start web server.
  // Useful note - how to get requests from port 80 into node web server.
  // Taken from - http://stackoverflow.com/questions/16573668/best-practices-when-running-node-js-with-port-80-ubuntu-linode
  // $ sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080
  console.log("Setting up web server");
  var webServerPort = process.env.PORT || 8080;
  fbBot.setupWebserver(webServerPort, function(err, webserver) {
  	console.log("Setting up web hooks");
    fbBot.createWebhookEndpoints(fbBot.webserver, spawnedBot, function() {
    });
  });
});