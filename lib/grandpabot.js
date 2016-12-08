'use strict';

// @ vendors
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();

var GrandpaBot = function Constructor() {
    this.settings = {};
    this.settings.name = 'grandpabot';
    this.dbPath = path.resolve(__dirname, '..', 'data', 'grandpabot.db');
};

GrandpaBot.prototype.run = function () {
    this._connectDb();
};

GrandpaBot.prototype._connectDb = function () {
    if (!fs.existsSync(this.dbPath)) {
        console.error('Database path ' + '"' + this.dbPath + '" does not exists or it\'s not readable.');
        process.exit(1);
    }

    this.db = new SQLite.Database(this.dbPath);
};

GrandpaBot.prototype.replyWithRandomJoke = function (callback) {
    var self = this;

    self.db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        self.db.run('UPDATE jokes SET used = used + 1 WHERE id = ?', record.id);

        return callback(record.joke);
    });
};

module.exports = GrandpaBot;
