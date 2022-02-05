const express = require('express')
const cors = require('cors')
const axios = require('axios')
const twilio = require('twilio')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const sendText = (body) => {
  return new Promise( async (resolve, reject) => {

    let response = { statusCode: 200, headers: { 'Content-Type': 'application/www-form-urlencoded' } }
    const data = body.text || ''
    const spaceIndex = data.indexOf(' ')
    const msg = data.substr(spaceIndex + 1)
    const toPhone = data.substr(0, spaceIndex)

    if (!body.token || body.token !== process.env.SLACK_VALIDATION_TOKEN) {
      response.body = JSON.stringify({ text: 'Message not sent, invalid slack token.' })
      reject(response)
    }
    if (process.env.SLACK_CHANNEL_ID && body.channel_id !== process.env.SLACK_CHANNEL_ID) {
      response.body = JSON.stringify({ text: 'Access Denied. This command is only permitted in the covid-unsafe channel.' })
      reject(response)
    }
    if (!/^\+1[0-9]{10}\b/.test(data)) {
      response.body = JSON.stringify({ text: 'Message not sent, the phone number must be in the format +1XXXXXXXXXX' })
      reject(response)
    }
    if (spaceIndex !== 12) {
      response.body = JSON.stringify({ text: 'Message not sent, the phone number must be followed by a space.' })
      reject(response)
    }
    if (!/[\S]/.test(body)) {
      response.body = JSON.stringify({ text: 'Message not sent, the message body cannot be empty.' })
      reject(response)
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const client = twilio(accountSid, authToken)
    await client.messages.create({
      to: toPhone,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: msg
    })
    .then(() => {
      response.body = 'success'
      resolve(response)
    })
    .catch((error) => {
      console.log('twilio error: ', error)
      response.body = JSON.stringify({ error: error })
      reject(response)
    })
  })
}

const sendSlack = (body) => {
  return new Promise( async (resolve, reject) => {

    let response = { statusCode: 200, headers: { 'Content-Type': 'application/www-form-urlencoded' } }
    const data = body.text || ''
    const spaceIndex = data.indexOf(' ')
    const msg = data.substr(spaceIndex + 1)
    const toPhone = data.substr(0, spaceIndex)

    const message = {
      attachments: [
        {
          fallback: `${toPhone}: ${msg}`,
          text: `${body.user_name} sent an SMS text message to ${toPhone}`,
          fields: [
            {
              title: 'Message',
              value: msg,
              short: false
            }
          ],
          color: '#ffe156'
        }
      ]
    }

    await axios({
      method: 'POST',
      url: process.env.SLACK_WEBHOOK_URL,
      data: message,
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(() => {
      response.body = 'success'
      resolve(response)
    })
    .catch((error) => {
      console.log('slack error: ', error)
      response.body = JSON.stringify({ error: error })
      reject(response)
    })
  })
}

app.post('/send_sms', async (req, res) => {
  let text
  let slack
  try {
    text = await sendText(req.body)
    if (text.body === 'success') {
      try {
        slack = sendSlack(req.body)
        res.send({res: 'message successfully sent'})
      } catch (error) {
        res.send(error)
      }
    }
  } catch (error) {
    res.send(error)
  }
})

app.listen(5000, async () => {
  console.log('the server is live and listening for requests')
})
