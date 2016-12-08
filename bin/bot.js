#!/usr/bin/env node

'use strict';

// @ vendors
var Botkit = require('botkit');
// @ commons
var GrandpaBot = require('../lib/grandpabot');

// Initialise
var grandpabot = new GrandpaBot();
grandpabot.run();

var controller = Botkit.slackbot({
    debug: false
});

controller.spawn({
    token: process.env.BOT_API_KEY || require('../token')
}).startRTM();

controller.hears(['jajaja','Contate uno','Iluminame'],
    ['direct_mention', 'mention'],
    function(bot, message) {
        grandpabot.replyWithRandomJoke(callback);

        function callback(response) {
            bot.reply(message, response);
        }
    });

controller.hears(['grandpabot', 'grandpa', 'kk', 'jovie', 'viejo'],
    ['ambient', 'direct_mention', 'mention'],
    function(bot, message) {
        var userID = message.user;
        var user = '<@'+userID+'>';
        var reply = user + ' qué pasó? Ahora no puedo, ando en calls.';

        bot.reply(message, reply);
    });