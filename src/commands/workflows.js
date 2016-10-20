
'use strict'

const _ = require('lodash')
const config = require('../config')
const request = require('request')
const token= config('GBDX_ACCESS_TOKEN')

console.log("GBDX TOKEN")
console.log(token)


const msgDefaults = {
  response_type: 'in_channel',
  username: 'Starbot',
  icon_emoji: config('ICON_EMOJI')
}

let emptyAttachment = [
  {
    title: 'WORKFLOWS:',
    color: '#e67e22',
    text: 'oops, you have no workflows to show',
    mrkdwn_in: ['text']
  }
]

let msg = _.defaults({
    channel: payload.channel_name,
    attachments: emptyAttachment
}, msgDefaults)

// each attachment will be one workflow plug the info into this template.  color can be variable
// based on the status of the workflow and the text will be the actual text
// title will be the ID of the workflow obviously.

const handler = (payload, res) => {

    let options = {
        url: 'https://geobigdata.io/workflows/v1/workflows',
        headers: {
            'Bearer' : token
        }
    }

    function callback(error, response, body) {
        if (!error && response.statusCode === 200) {
            var info = JSON.parse(body)
            console.log("INFO")
            console.log(info)
        }
    }

    request(options, callback)

    res.set('content-type', 'application/json')
    res.status(200).json(msg)
    return

}

module.exports = { pattern: /workflows/ig, handler: handler }
