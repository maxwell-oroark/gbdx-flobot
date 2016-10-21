'use strict'

const _ = require('lodash')
const config = require('../config')
const request = require('request')
const token = config('GBDX_ACCESS_TOKEN')
const moment = require('moment')

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

let callback = function (error, response, body) {
    if (!error && response.statusCode === 200) {
        let tasks = JSON.parse(body).tasks
        console.log("tasks")
        console.log(tasks)

        // map over tasks here

        let attachments = tasks.map((task) => {
          console.log("==task==")
          console.log(task)
          let readableStartTime = moment(task.start_time).format('MMMM Do YYYY, h:mm:ss a')
          let colorMap = {
              complete : '#2ecc71'
              failed   : '#e74c3c'
          }
          let statusColor = colorMap[task.state.state]
          return {
            title: `${task.id} / ${task.taskType} `,
            pretext: ``,
            color: `${statusColor}`
            text: `Your task started at ${readableStartTime} and the status is ${task.state.state}`,
            mrkdwn_in: ['text', 'pretext']
          }
        })

        let msg = _.defaults({
            channel: payload.channel_name,
            attachments: attachments
        }, msgDefaults)

        res.set('content-type', 'application/json')
        res.status(200).json(msg)
    }
    return;
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

    request(options,callback)

    return;

}

module.exports = { pattern: /workflow\s\d+/ig, handler: handler }
