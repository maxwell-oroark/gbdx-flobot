
'use strict'

const express = require('express')
const proxy = require('express-http-proxy')
const bodyParser = require('body-parser')
const _ = require('lodash')
const config = require('./config')
const commands = require('./commands')
const helpCommand = require('./commands/help')

let bot = require('./bot')

let app = express()

if (config('PROXY_URI')) {
  app.use(proxy(config('PROXY_URI'), {
    forwardPath: (req, res) => { return require('url').parse(req.url).path }
  }))
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// app.use(isLoggedIn)

app.get('/', (req, res) => { res.send('\n 👋 🌍 \n') })

app.post('/commands/gbdx', (req, res) => {
  let payload = req.body
  console.log("===PAYLOAD===")
  console.log(payload)

  if (!payload || payload.token !== config('STARBOT_COMMAND_TOKEN')) {
    let err = '✋  gbdx—what? An invalid slash token was provided'
    console.log(err)
    res.status(401).end(err)
    return
  }

  let cmd = _.reduce(commands, (a, cmd) => {
    return payload.text.match(cmd.pattern) ? cmd : a
  }, helpCommand)

  cmd.handler(payload, res)
})

app.listen(config('PORT'), (err) => {
  if (err) throw err

  console.log(`\n🚀  Starbot LIVES on PORT ${config('PORT')} 🚀`)

  if (config('SLACK_TOKEN')) {
    console.log(`🤖  beep boop: @starbot is real-time\n`)
    bot.listen({ token: config('SLACK_TOKEN') })
  }
})


// EXAMPLE PAYLOAD BELOW:

// {
//     token: 'EVIhl6bmTB2OqkjYssHcLejN',
//     team_id: 'T0KC9NUQ4',
//     team_domain: 'dg-platform',
//     channel_id: 'D1A345VJT',
//     channel_name: 'directmessage',
//     user_id: 'U19HWME7N',
//     user_name: 'maxwello',
//     command: '/gbdx',
//     text: '123',
//     response_url: 'https://hooks.slack.com/commands/T0KC9NUQ4/94086706694/11TBNuaae2GvdmVb55hWzFC8'
// }
//
