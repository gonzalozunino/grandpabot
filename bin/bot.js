#!/usr/bin/env node

'use strict';

/*// @ vendors
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

controller.hears(['Deja de spamear'],
    ['direct_mention', 'mention'],
    function(bot,message) {
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

        bot.startPrivateConversation(message, lookForTrouble);
    });*/


// @ vendors
var Botkit = require('botkit');
var path = require('path');
var fs = require('fs');
// @ constants
var botToken = process.env.BOT_API_KEY || require('../token');
var studioToken = process.env.STUDIO_API_KEY;

if (!botToken) {
    console.log('Error: Specify a Slack bot token in environment.');
    process.exit(1);
}

if (!studioToken) {
    console.log('Error: Specify a Botkit Studio token in environment.');
    // TODO: Uncomment this when having a studio token
    // process.exit(1);
}

/**
 * Creates the Botkit controller, which controls all instances of the bot.
 * @param {Object} {} - Studio token goes here.
 */
var controller = Botkit.slackbot({
    debug: false/*,
     retry: 10,
     studio_token: studioToken*/ // TODO: Uncomment this when having a studio token
});

/**
 * Spawns a single instance of the bot to connect to Slack team.
 * @param {Object} {} - Env bot API token goes here.
 */
var bot = controller.spawn({
    token: botToken
}).startRTM();

var normalizedPath = path.join(__dirname, 'skills');
fs.readdirSync(normalizedPath).forEach(function(file) {
    require("./skills/" + file)(controller);
});

/**
 * This captures and evaluates any message sent to the bot as a DM
 * or sent to the bot in the form "@bot message" and passes it to
 * Botkit Studio to evaluate for trigger words and patterns.
 * If a trigger is matched, the conversation will automatically fire!
 * You can tie into the execution of the script using the functions
 * controller.studio.before, controller.studio.after and controller.studio.validate.
 */
if (studioToken) {
    controller.on('direct_message, direct_mention, mention', function(bot, message) {
        controller.studio.runTrigger(bot, message.text, message.user, message.channel).catch(function(err) {
            bot.reply(message, 'I experienced an error with a request to Botkit Studio: ' + err);
        });
    });
} else {
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log('NOTE: Botkit Studio functionality has not been enabled');
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
}