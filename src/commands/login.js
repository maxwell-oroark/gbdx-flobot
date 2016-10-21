
'use strict'

const _ = require('lodash')
const config = require('../config')
const request = require('request')
const token = config('GBDX_ACCESS_TOKEN')
const moment = require('moment')
const db = require('database/database');

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

    let loginCreds = payload.text.split(' ');

    db.loginSlackUserToGbdx(payload.user_name, loginCreds[1], loginCreds[2], loginCreds[3])
        .then(() => {
            // login success
        })
        .catch((err) => {
            // login fail
        })

    return;
}

module.exports = { pattern: /workflow\s\d+/ig, handler: handler }
