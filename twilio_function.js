const https = require('https')

exports.handler = (context, event, callback) => {

  const { To, From, Body } = event
  const images = []

  while(event['MediaUrl' + images.length]) {
    images.push(event['MedialUrl' + images.length])
  }

  const bodyWithImages = [Body].concat(images).join('\nAttachments: ')

  const encode = (field) => {
    return field.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  const encodedBody = encode(bodyWithImages)
  const encodedFrom = encode(From)
  const encodedTo = encode(To)

  const slackMessage = JSON.stringify({
    attachments: [
      {
        fallback: `${From}: ${Body}`,
        text: `Received a text from ${From}`,
        fields: [
          {
            title: 'Message',
            value: encodedBody,
            short: false
          }
        ],
        color: '#602d89'
      }
    ]
  })

  const slackBodyLength = slackMessage.length

  const options = {
    host: 'hooks.slack.com',
    port: 443,
    path: context.SLACK_WEBHOOK_PATH,
    method: 'POST',
    headers: {
      'Content-Type' : 'application/json',
      'Content-Length' : slackBodyLength
    }
  }

  const post = https.request(options, res => {
    res.on('error', (e) => { console.log('ERROR: ', e) })
    res.on('data', (chunk) => { console.log('CHUNK: ', chunk.toString()) })
    res.on('end', () => {
      let twiml = new Twilio.twiml.MessagingResponse()
      twiml.message(context.SMS_RES)
      callback(null, twiml)
    })
  })
  post.on('error', (e) => { console.log('Error: ', e) })
  post.on('drain', () => { post.end() })
  if (post.write(slackMessage)) {
    post.end()
  }
}
