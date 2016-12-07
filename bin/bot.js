#!/usr/bin/env node

'use strict';

/**
 * Grandpabot launcher script.
 *
 */

var GrandpaBot = require('../lib/grandpabot');
var Botkit = require('botkit');

var controller = Botkit.slackbot({
    debug: false
    //include "log: false" to disable logging
    //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

controller.spawn({
        token: process.env.BOT_API_KEY || require('../token')
}).startRTM();

var grandpabot = new GrandpaBot(controller);
grandpabot.run();