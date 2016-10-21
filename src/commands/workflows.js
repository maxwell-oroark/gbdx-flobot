
'use strict'

const _ = require('lodash')
const config = require('../config')
const request = require('request')
const token = config('GBDX_ACCESS_TOKEN')
const db = require('database/database');

const noWorkflowsAttachment = [
    {
        color: '#f1c40f',
        text: 'you have no workflows to show',
        mrkdwn_in: ['text']
    }
]

const msgDefaults = {
  response_type: 'in_channel',
  username: 'Starbot',
  icon_emoji: config('ICON_EMOJI'),
  attachments: noWorkflowsAttachment
}

function parseWorkflows(workflows) {
    if (!workflows.length) return;
    let attachments = workflows.slice(0, 5).map((workflowId, i) => {
        return {
            title: `workflow ${i + 1}:`,
            text: `workflow id: ${workflowId}`,
            color: `#2980b9`,
            mrkdwn_in: ['text', 'pretext']
        }
    })
    return attachments
}

function callback(error, response, body) {
    if (!error && response.statusCode === 200) {
        let workflows = JSON.parse(body).Workflows
        console.log("workflows")
        console.log(workflows)
    }
    return;
}

const handler = (payload, res) => {

    db.getWorkflowsForSlackUser(payload.user_name)
        .then((workflows) => {
            let attachments = parseWorkflows(workflows)

            let msg = _.defaults({
                channel: payload.channel_name,
                attachments: attachments
            }, msgDefaults)

            res.set('content-type', 'application/json')
            res.status(200).json(msg);
        })
        .catch((err) => {

        })

    return;

}

module.exports = { pattern: /workflows/ig, handler: handler }
