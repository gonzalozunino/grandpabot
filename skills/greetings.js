var greetings = function(controller) {
    controller.hears(['kk', 'jovie', 'viejo'],
        ['direct_mention', 'mention'],
        function(bot, message) {
            var userID = message.user;
            var user = '<@'+userID+'>';
            var reply = user + ' qué pasó? Ahora no puedo, ando en calls.';

            bot.reply(message, reply);
        });

    controller.middleware.receive.use(function(bot, message, next) {
        if (message.text == 'Hola' || message.text == 'Holis' || message.text == 'Que haces' || message.text == 'Hey') {
            message.intent = 'Hi';
        }

        next();
    });

    controller.middleware.send.use(function(bot, message, next) {
        next();
    });

    function hear_intent(patterns, message) {
        for (var p = 0; p < patterns.length; p++) {
            if (message.intent == patterns[p]) {
                return true;
            }
        }

        return false;
    }

    controller.hears(['Hola'],
        ['direct_mention', 'mention', hear_intent],
        function(bot, message) {
            bot.api.reactions.add({
                timestamp: message.ts,
                channel: message.channel,
                name: 'wink'
            },function(err, res) {
                if (err) {
                    bot.botkit.log('Failed to add emoji reaction :(',err);
                }
            });

            controller.storage.users.get(message.user,function(err, user) {
                if (user && user.name) {
                    bot.reply(message, 'Ehhh Quien es ? Hola ' + user.name + '!!');
                } else {
                    bot.reply(message, 'Buenas buenas...');
                }
            });
        });

    controller.hears(['Llamame (.*)','Me dicen (.*)'],
        ['direct_mention', 'mention'],
        function(bot, message) {
            var name = message.match[1];

            controller.storage.users.get(message.user,function(err, user) {
                if (!user) {
                    user = {
                        id: message.user,
                    };
                }
                user.name = name;
                controller.storage.users.save(user,function(err, id) {
                    bot.reply(message,'Ssscelente para mí te llamas ' + user.name + ' desde ahora.');
                });
            });
        });

    controller.hears(['Quien soy','Como me llamo'],
        ['direct_mention', 'mention'],
        function(bot, message) {
            controller.storage.users.get(message.user,function(err, user) {
                if (user && user.name) {
                    bot.reply(message,'Te dicen ' + user.name);
                } else {
                    bot.reply(message,'Ehh ehh **Glup** Fernando?');
                }
            });
        });
};

module.exports = greetings;