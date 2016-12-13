// @ vendors
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var request = require('request');
// @ constants
var dbPath = path.resolve(__dirname, '..', 'data', 'grandpabot.db');

if (!fs.existsSync(dbPath)) {
    console.error('Database path does not exists or it\'s not readable.');
    process.exit(1);
}
/**
 * Creates the jokes database.
 * @param {String} - Database path.
 */
var db = new SQLite.Database(dbPath);

var _replyWithRandomJoke = function (replyWithRandomJokeCallback) {
    db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        db.run('UPDATE jokes SET used = used + 1 WHERE id = ?', record.id);

        return replyWithRandomJokeCallback(record.joke);
    });
};

var _addJoke = function (newJoke) {
    db.get('SELECT MAX(id) as id FROM jokes', function (err, record) {
        if (err) {
            console.error('ERROR:', err);
            return console.error('DATABASE ERROR:', err);
        }

        var newId = record.id + 1;

        return db.run('INSERT INTO jokes(id, joke, used) VALUES(?, ?, ?)', newId, newJoke, '1');
    });
};

var jokes = function(controller) {
    controller.hears(['jajaja','Contate uno','Iluminame'],
        ['direct_mention', 'mention'],
        function(bot, message) {
            function replyWithRandomJokeCallback(response) {
                bot.reply(message, response);
            }

            _replyWithRandomJoke(replyWithRandomJokeCallback);
        });

    controller.hears(['Agregar Frase (.*)'],
        ['direct_mention', 'mention'],
        function(bot, message) {
            var newJoke = message.match[1];

            _addJoke(newJoke);
            bot.reply(message, 'Ehhh OK, listo mergeado, digo... agregada!');
        });

    controller.hears(['Que embole'],
        ['ambient'],
        function(bot, message) {
            request("http://api.giphy.com/v1/gifs/search?q=fail&api_key=dc6zaTOxFJmzC", function (error, response, body){
                var data = JSON.parse(body);

                var max = data.data.length;
                var min = 0;

                var randomNumber = Math.floor(Math.random() * (max - min)) + min;

                gifUrl = data.data[randomNumber].images.downsized.url;

                replyMessage = 'El mensaje es "verificar, y arreglar" - para quien esté sin tarea, pero toma un gif :wink:! \n' + gifUrl;

                bot.reply(message, replyMessage);
            });
        });
};

module.exports = jokes;