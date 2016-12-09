#!/usr/bin/env node

'use strict';

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

var normalizedPath = path.join(__dirname, '../skills');
fs.readdirSync(normalizedPath).forEach(function(file) {
    require('../skills/' + file)(controller);
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