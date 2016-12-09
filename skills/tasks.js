var tasks = function(controller) {
    controller.hears(['tasks', 'todo', 'tareas'],
        ['direct_mention', 'mention'],
        function(bot, message) {
            controller.storage.users.get(message.user, function(err, user) {
                if (!user || !user.tasks || user.tasks.length == 0) {
                    bot.reply(message, 'Ehhh... no tenés ninguna tarea que yo sepa... Para agregar una usa `agregar - y la tarea ...-`.');
                } else {
                    var text = '**Glup** Estas son tus tareas o no?: \n' +
                        generateTaskList(user) +
                        'Respondeme con `terminada - y número de la tarea ...-` para que las marque como completa.';

                    bot.reply(message, text);
                }
            });
        });

    controller.hears(['agregar (.*)'],
        ['direct_mention', 'mention'],
        function(bot, message) {
            var newtask = message.match[1];

            controller.storage.users.get(message.user, function(err, user) {
                if (!user) {
                    user = {};
                    user.id = message.user;
                    user.tasks = [];
                }

                user.tasks.push(newtask);

                controller.storage.users.save(user, function(err,saved) {
                    if (err) {
                        bot.reply(message, 'Ehhh dió error y no pude agregar la tarea... Vamos a tener que mandar un mail o algo...: ' + err);
                    } else {
                        bot.api.reactions.add({
                            name: 'thumbsup',
                            channel: message.channel,
                            timestamp: message.ts
                        });
                    }
                });
            });
        });

    controller.hears(['terminada (.*)'],
        ['direct_mention', 'mention'],
        function(bot, message) {
            var number = message.match[1];

            if (isNaN(number)) {
                bot.reply(message, 'Fijate bien, tiene que ser un número para cerrar la tarea... :wink: .');
            } else {
                number = parseInt(number) - 1;

                controller.storage.users.get(message.user, function(err, user) {
                    if (!user) {
                        user = {};
                        user.id = message.user;
                        user.tasks = [];
                    }

                    if (number < 0 || number >= user.tasks.length) {
                        bot.reply(message, 'No hay tareas con ese número, te fuiste de rango, tenés: ' + user.tasks.length + ' en tu lista :wink:.');
                    } else {
                        var item = user.tasks.splice(number,1);

                        bot.reply(message, '~' + item + '~');

                        if (user.tasks.length > 0) {
                            bot.reply(message, 'Estas son las tareas que faltan terminar:\n' + generateTaskList(user));
                        } else {
                            bot.reply(message, 'Estas sin tareas? Ehh... Fijate en Jira, de agregar una, yo no puedo estoy en call...');
                        }
                    }
                });
            }

        });

    function generateTaskList(user) {
        var text = '';

        for (var t = 0; t < user.tasks.length; t++) {
            text = text + '> `' +  (t + 1) + '`) ' +  user.tasks[t] + '\n';
        }

        return text;

    }
};

module.exports = tasks;
