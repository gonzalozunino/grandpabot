var greetings = function(controller) {
    controller.hears(['grandpabot', 'grandpa', 'kk', 'jovie', 'viejo'],
        ['ambient', 'direct_mention', 'mention'],
        function(bot, message) {
            var userID = message.user;
            var user = '<@'+userID+'>';
            var reply = user + ' qué pasó? Ahora no puedo, ando en calls.';

            bot.reply(message, reply);
        });
};

module.exports = greetings;