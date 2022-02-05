# Slack to Text

## Description

A two way Slack to text sms connection. Send a text message to a Slack channel, text a phone from Slack. Great for customer/audience feedback and engagement.

## Requirements

- A [Slack](https://slack.com) workspace you can add apps and webhooks to.
- A [Twilio](https://www.twilio.com) Account with an active phone number.
- A node server which is accessible to your Slack App

## Setup

### SMS to Slack

- On the [Slack API](https://api.slack.com) for your workspace go to Incoming Webhooks and click Add a New Webhook to Workspace.
- Now, on the [Twilio Console](https://console.twilio.com), open the Functions product and select Services.
- Click Create Service and then once you have named your service you will be taken to the service page.
- On the service page, open the /main file under Functions and copy the code from **twilio_function.js** into the file.
- Under the Settings section open up Environment Variables and add a key `SLACK_WEBHOOK_PATH` with a value equal to the Slack webhook you just created, as well as a key `SMS_RES` with a value equal to the desired automatic response a user will recieve when texting your number.
- Click Deploy All at the bottom of the page and you should be all set.

### Slack to SMS

- To set up the Slack slash command to send messages from your workspace to a phone number, first you must set up a server to receive a message from Slack and then access the Twilio API.
- Using the **Dockerfile** found in this repository you can easily deploy an Docker container which will run your node server.
- On the [Slack API](https://api.slack.com) for your workspace go to Slash Commands and click Create New Command.
- Name your command `/sms`, set the request url to the URL or IP address of your node server with the call `/send_sms` appended onto the end, and then add a short description and usage hint.
- Back in your server you'll need to fill out the .env file for all missing environment variables.
- Set `SLACK_CHANNEL_ID` equal to the channel id of the slack channel you'd like to enable the command,  `SLACK_VALIDATION_TOKEN` equal to the Verification Token on your slack apps Basic Information, `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` to your Twilio account credentials, and finally `TWILIO_PHONE_NUMBER` to the phone number you have activated on your Twilio account.
- Redeploy your server and start texting!
