var tasks = function(controller) {
    controller.hears(['tasks', 'todo'],
        ['direct_mention', 'mention'],
        function(bot, message) {
            controller.storage.users.get(message.user, function(err, user) {
                if (!user || !user.tasks || user.tasks.length == 0) {
                    bot.reply(message, 'Ehhh... no tenes ninguna tarea que yo sepa... Para agregar una usa `agregar _tarea_`.');
                } else {
                    var text = '**Glup** Estas son tus tareas o no?: \n' +
                        generateTaskList(user) +
                        'Respondeme con `terminada _numero_` para que las marque como completas.';

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
                bot.reply(message, 'Fijate bien, tiene que ser un número para cerrar la tarea.. :wink: .');
            } else {
                number = parseInt(number) - 1;

                controller.storage.users.get(message.user, function(err, user) {
                    if (!user) {
                        user = {};
                        user.id = message.user;
                        user.tasks = [];
                    }

                    if (number < 0 || number >= user.tasks.length) {
                        bot.reply(message, 'Sorry, your input is out of range. Right now there are ' + user.tasks.length + ' items on your list.');
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
