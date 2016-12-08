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

controller.hears(['Deja de spamear'],['direct_mention', 'mention'],function(bot,message) {
    bot.startConversation(message,function(err, convo) {
        var userID = message.user;
        var user = '<@'+userID+'>';

        convo.say('Dale, ' + user + ' lo hablamos por privado entonces...');
    });

    var lookForTrouble = function(response, dm) {
        dm.ask('Muy sensato lo del mensaje privado. En qué estarías trabajando ahora?', function(response, dm) {
            dm.say('Ok, no hay problema.');
            askHelp(response, dm);
            dm.next();
        });
    };

    var askHelp = function(response, dm) {
        dm.ask('Ejem... **Glup**. Mandaste el mail a API?', function(response, dm) {
            dm.say('... bueno de cualquier manera, recordá siempre ponerme en copia por favor.');
            sayGoodbye(response, dm);
            dm.next();
        });
    };

    var sayGoodbye = function(response, dm) {
        dm.ask('Otra consulta, estaría disponible para trabajar este Domingo?', function(response, dm) {
            dm.say('Ok, no importa, lo vemos despues. Disculpame, te tengo que dejar, tengo que mandar un fax a la gente de España, además tengo call en 5. Saludos');
            dm.next();
        });
    };

    bot.startConversation(message, lookForTrouble);
});