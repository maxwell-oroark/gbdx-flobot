'use strict'

const _ = require('lodash')
const config = require('../config')
const request = require('request')
const token = config('GBDX_ACCESS_TOKEN')
const moment = require('moment')



const handler = (payload, res) => {

    let catId = payload.text.match(/\d+/)[0]

    console.log("====CAT ID===")
    console.log(catId)

    const constructionAttachment = [
        {
            color: '#f1c40f',
            text: 'this response is under construction but your cat id is ${catId}',
            mrkdwn_in: ['text']
        }
    ]

    const msgDefaults = {
        response_type: 'in_channel',
        username: 'Starbot',
        icon_emoji: config('ICON_EMOJI'),
        attachments: constructionAttachment
    }

    let callback = function (error, response, body) {

        console.log("===BODY===")
        console.log(JSON.parse(body))

        if (!error && response.statusCode === 200) {

            console.log("===BODY===")
            console.log(JSON.parse(body))

            let msg = _.defaults({
                channel: payload.channel_name,
                attachments: attachments
            }, msgDefaults)

            res.set('content-type', 'application/json')
            res.status(200).json(msg)
        }
        return;
    }

    let options = {
        url: `https://geobigdata.io/orders/v2/order`,
        method: `POST`,
        headers: {
            'Authorization':`Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        json: [catId],
    }

    request(options,callback)

    return;

}

module.exports = { pattern: /order/ig, handler: handler }
