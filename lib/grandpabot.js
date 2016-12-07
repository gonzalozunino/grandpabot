'use strict';

var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();

var GrandpaBot = function Constructor(controller) {
    this.settings = {};
    this.settings.controller = controller;
    this.settings.name = 'grandpabot';
    this.dbPath = path.resolve(__dirname, '..', 'data', 'grandpabot.db');
};

GrandpaBot.prototype.run = function () {
    this._connectDb();
    this._firstRunCheck();
};

GrandpaBot.prototype._connectDb = function () {
    if (!fs.existsSync(this.dbPath)) {
        console.error('Database path ' + '"' + this.dbPath + '" does not exists or it\'s not readable.');
        process.exit(1);
    }

    this.db = new SQLite.Database(this.dbPath);
};

GrandpaBot.prototype._firstRunCheck = function () {
    var self = this;
    self.db.get('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        var currentTime = (new Date()).toJSON();

        // this is a first run
        if (!record) {
            self.db.run('INSERT INTO info(name, val) VALUES("lastrun", ?)', currentTime);
            return self._welcomeMessage();
        } else {
            // updates with new last running time
            self.db.run('UPDATE info SET val = ? WHERE name = "lastrun"', currentTime);
            return self._replyWithRandomJoke();
        }
    });
};

GrandpaBot.prototype._welcomeMessage = function () {
    return self.settings.controller.hears('Hola!',['direct_mention','mention'], function(bot, message) {
        bot.reply(message, "Hola !");
    });
};

GrandpaBot.prototype._replyWithRandomJoke = function () {
    var self = this;
    self.db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        self.db.run('UPDATE jokes SET used = used + 1 WHERE id = ?', record.id);

        self.message =  record.joke;

        return self.settings.controller.hears(['kk','jajaja','Contate uno','Iluminame'],
            ['direct_mention', 'mention'],
            function(bot, message) {
                bot.reply(message, self.message);
        });
    });
};

module.exports = GrandpaBot;
