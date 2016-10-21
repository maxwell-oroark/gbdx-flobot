'use strict'

const _ = require('lodash')
const config = require('../config')
const request = require('request')
const token = config('GBDX_ACCESS_TOKEN')

const constructionAttachment = [
    {
        color: '#f1c40f',
        text: 'this response is under construction',
        mrkdwn_in: ['text']
    }
]


const msgDefaults = {
  response_type: 'in_channel',
  username: 'Starbot',
  icon_emoji: config('ICON_EMOJI'),
  attachments: constructionAttachment
}

const handler = (payload, res) => {

    let workflowId = payload.text.match(/\d+/)[0]

    let options = {
        url: `https://geobigdata.io/workflows/v1/workflows/${workflowId}`,
        headers: {
            'Authorization':`Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    }

    let callback = function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let tasks = JSON.parse(body).tasks
            console.log("tasks")
            console.log(tasks)

            let msg = _.defaults({
                channel: payload.channel_name,
                attachments: [
                    {
                        color: '#f1c40f',
                        text: `this response is under construction
                        but your workflow id is: ${workflowId}`,
                        mrkdwn_in: ['text']
                    }
                ]
            }, msgDefaults)

            res.set('content-type', 'application/json')
            res.status(200).json(msg)
        }
        return;
    }

    request(options,callback)

    return;

}

module.exports = { pattern: /workflow\s\d+/ig, handler: handler }
