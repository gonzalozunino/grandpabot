'use strict';

const config = {
    protocol: process.env.JIRA_PROTOCOL || 'Jira Protocol goes here!',
    host: process.env.JIRA_HOST || 'Jira Host goes here!',
    port: parseInt((process.env.JIRA_PORT || 'Jira Port goes here (443 || 80)!'), 10),
    base: '',
    user: process.env.JIRA_USER || 'Jira Username goes here!',
    pass: process.env.JIRA_PASS || 'Jira Pass goes here!',
    apiVersion: 'latest',
    strictSSL: false,
    regex: '([A-Z][A-Z0-9]+-[0-9]+)',
    sprintField: '',
    customFields: {},
    response: 'full',
    usermap: {}
};

module.exports = config;