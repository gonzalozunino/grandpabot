var conversations = function (controller) {
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
        });
};

module.exports = conversations;
