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

    console.log("===payload===")
    console.log(payload)

    let options = {
        url: `https://geobigdata.io/workflows/v1/workflows/${workflowId}`,
        headers: {
            'Authorization':`Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    }

    let msg = _.defaults({
        channel: payload.channel_name,
        attachments: undefined
    }, msgDefaults)

    res.set('content-type', 'application/json')
    res.status(200).json(msg)

    return;

}

module.exports = { pattern: /workflow/ig, handler: handler }
