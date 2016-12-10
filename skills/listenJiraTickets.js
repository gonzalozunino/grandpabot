'use strict';

// @ vendors
var JiraApi = require('jira-client');
var moment = require('moment');
var J2S = require('jira2slack');
// @ constants
var TICKET_BUFFER_LENGTH = 300000;
var RESPONSE_FULL = 'full';
// @ objects
var ticketBuffer = new Map();
var config = {
    protocol: process.env.JIRA_PROTOCOL,
    host: process.env.JIRA_HOST,
    port: parseInt(process.env.JIRA_PORT, 10),
    base: '',
    user: process.env.JIRA_USER,
    pass: process.env.JIRA_PASS,
    apiVersion: 'latest',
    strictSSL: false,
    regex: '([A-Z][A-Z0-9]+-[0-9]+)',
    sprintField: process.env.JIRA_SPRINT_FIELD,
    customFields: {},
    response: RESPONSE_FULL,
    usermap: {}
};
var jira = new JiraApi({
    protocol: config.protocol,
    host: config.host,
    port: config.port,
    username: config.user,
    password: config.pass,
    apiVersion: config.apiVersion,
    strictSSL: config.strictSSL,
    base: config.base
});
var ticketRegExp = new RegExp(config.regex, 'g');

var parseSprint = function parseSprint(customField) {
    var retVal = '';

    if (customField && customField.length > 0) {
        var sprintString = customField.pop();
        var matches = sprintString.match(/,name=([^,]+),/);
        if (matches && matches[1]) {
            retVal = matches[1];
        }
    }
    return retVal;
};

var jira2Slack = function jira2Slack(username) {
    var retVal = '';
    if (config.usermap[username]) {
        retVal = '@' + config.usermap[username];
    }
    return retVal;
};

var formatIssueDescription = function formatIssueDescription(description) {
    var desc = description || 'Ticket does not contain a description';
    return J2S.toSlack(desc);
};

var buildIssueLink = function buildIssueLink(issueKey) {
    var base = '/browse/';
    if (config.base) {
        // Strip preceeding and trailing forward slash
        base = '/' + config.base.replace(/^\/|\/$/g, '') + base;
    }
    return config.protocol + '://' + config.host + ':' + config.port + base + issueKey;
};

var issueResponse = function issueResponse(issue, usrFormat) {
    var format = usrFormat || config.response;
    var response = {
        fallback: 'Ehh no encontré nada para el issue ' + issue.key
    };
    var created = moment(issue.fields.created);
    var updated = moment(issue.fields.updated);

    response.text = formatIssueDescription(issue.fields.description);
    response.mrkdwn_in = ['text']; // Parse text as markdown
    response.fallback = issue.fields.summary;
    response.pretext = '**Glup** un poco de información sobre el ' + issue.key;
    response.title = issue.fields.summary;
    response.title_link = buildIssueLink(issue.key);
    response.footer = 'Slack Jira ';
    response.fields = [];
    if (format === RESPONSE_FULL) {
        response.fields.push({
            title: 'Created',
            value: created.calendar(),
            short: true
        });
        response.fields.push({
            title: 'Updated',
            value: updated.calendar(),
            short: true
        });
        response.fields.push({
            title: 'Status',
            value: issue.fields.status.name,
            short: true
        });
        response.fields.push({
            title: 'Priority',
            value: issue.fields.priority.name,
            short: true
        });
        response.fields.push({
            title: 'Reporter',
            value: jira2Slack(issue.fields.reporter.name) || issue.fields.reporter.displayName,
            short: true
        });
        var assignee = 'Unassigned';
        if (issue.fields.assignee) {
            assignee = jira2Slack(issue.fields.assignee.name) || issue.fields.assignee.displayName;
        }
        response.fields.push({
            title: 'Assignee',
            value: assignee,
            short: true
        });
        // Sprint fields
        if (config.sprintField) {
            response.fields.push({
                title: 'Sprint',
                value: parseSprint(issue.fields[config.sprintField]) || 'Not Assigned',
                short: false
            });
        }
        // Custom fields
        if (config.customFields && Object.keys(config.customFields).length) {
            Object.keys(config.customFields).map(function (customField) {
                var fieldVal = null;
                // Do some simple guarding before eval
                if (!/[;&\|\(\)]/.test(customField)) {
                    try {
                        /* eslint no-eval: 0*/
                        fieldVal = eval('issue.fields.' + customField);
                    } catch (e) {
                        fieldVal = 'Error while reading ' + customField;
                    }
                } else {
                    fieldVal = 'Invalid characters in ' + customField;
                }
                fieldVal = fieldVal || 'Unable to read ' + customField;
                return response.fields.push({
                    title: config.customFields[customField],
                    value: fieldVal,
                    short: false
                });
            });
        }
    }

    return response;
};

var hashTicket = function hashTicket(channel, ticket) {
    return channel + '-' + ticket;
};

var parseTickets = function parseTickets(channel, message) {
    var retVal = [];
    if (!channel || !message) {
        return retVal;
    }
    var uniques = {};
    var found = message.match(ticketRegExp);
    var now = Date.now();
    var ticketHash = void 0;

    if (found && found.length) {
        found.forEach(function (ticket) {
            ticketHash = hashTicket(channel, ticket);
            if (!uniques.hasOwnProperty(ticket) && now - (ticketBuffer.get(ticketHash) || 0) > TICKET_BUFFER_LENGTH) {
                retVal.push(ticket);
                uniques[ticket] = 1;
                ticketBuffer.set(ticketHash, now);
            }
        });
    }
    return retVal;
};

var handleMessage = function handleMessage(bot, message) {
    var response = {
        as_user: true,
        attachments: []
    };

    if (message.type === 'message' && message.text) {
        var found = parseTickets(message.channel, message.text);

        if (found && found.length) {
            found.forEach(function (issueId) {
                jira.findIssue(issueId).then(function (issue) {
                    var responseFormat = message.event === 'direct_mention' ? RESPONSE_FULL : null;

                    response.attachments = [issueResponse(issue, responseFormat)];

                    bot.reply(message, response, function (err) {
                        if (err) {
                            console.error('Unable to respond', err);
                        } else {
                            console.info('@' + bot.identity.name + ' responded with', response);
                        }
                    });
                }).catch(function (error) {
                    console.error('Got an error trying to find ' + issueId, error);
                });
            });
        }
    } else {
        console.info('@' + bot.identity.name + ' could not respond.');
    }
};


var listenJiraTickets = function(controller) {
    controller.hears(['Jira Ticket'],
        ['ambient', 'direct_message', 'direct_mention', 'mention'],
        function(bot, message) {
            handleMessage(bot, message, jira);
        });
};

module.exports = listenJiraTickets;