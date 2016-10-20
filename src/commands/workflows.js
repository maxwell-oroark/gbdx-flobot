
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

// each attachment will be one workflow plug the info into this template.  color can be variable
// based on the status of the workflow and the text will be the actual text
// title will be the ID of the workflow obviously.

const handler = (payload, res) => {

    request
        .get('https://geobigdata.io/workflows/v1/workflows', {
            'auth': {'bearer': token}
        })
        .on('response', function(response) {
            console.log("===response===")
            console.log(response)
            let workflows = response.body.Workflows
            if (response.statusCode === 200 && workflows.length > 0) {
                let attachments = workflows.slice(0, 5).map((workflow) => {
                  return {
                    title: `${workflow} `,
                    title_link: `workflow link`,
                    text: `some random text`,
                    mrkdwn_in: ['text', 'pretext']
                  }
                })
            } else {
                let attachments = emptyAttachment
            }
            let msg = _.defaults({
                channel: payload.channel_name,
                attachments: attachments
            }, msgDefaults)

            res.set('content-type', 'application/json')
            res.status(200).json(msg)
            return
        })
}

module.exports = { pattern: /workflows/ig, handler: handler }
