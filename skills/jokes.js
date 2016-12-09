// @ vendors
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();

var _connectDb = function () {
    var dbPath = path.resolve(__dirname, '..', 'data', 'grandpabot.db');

    if (!fs.existsSync(dbPath)) {
        console.error('Database path does not exists or it\'s not readable.');
        process.exit(1);
    }

    return new SQLite.Database(dbPath);
};

var _replyWithRandomJoke = function (db, replyWithRandomJokeCallback) {

    db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        db.run('UPDATE jokes SET used = used + 1 WHERE id = ?', record.id);

        return replyWithRandomJokeCallback(record.joke);
    });
};

var jokes = function(controller) {
    var db = _connectDb();

    controller.hears(['jajaja','Contate uno','Iluminame'],
        ['direct_mention', 'mention'],
        function(bot, message) {
            function replyWithRandomJokeCallback(response) {
                bot.reply(message, response);
            }

            _replyWithRandomJoke(db, replyWithRandomJokeCallback);
        });
};

module.exports = jokes;