import {flatten, get, partialRight} from 'lodash'
import request from 'request-promise'
import sleep from 'es6-sleep'

import {InboundMessage, messageTypeEnum, buttonTypeEnum} from './messages'
import config from './config'

const FB_ENDPOINT = 'https://graph.facebook.com/v2.6/me/messages'

// Example of Facebook data:
// {
//   "object":"page",
//   "entry":[
//     {
//       "id":"PAGE_ID",
//       "time":1458692752478,
//       "messaging":[
//         {
//           "sender":{
//             "id":"USER_ID"
//           },
//           "recipient":{
//             "id":"PAGE_ID"
//           },

//           ...
//         }
//       ]
//     }
//   ]
// }

export function parseEntry (entry) {
  return flatten(
    entry.entry.map(function (entry) {
      return entry.messaging.map(function (message) {
        return parseMessage({entry, message})
      })
    })
  )
}

function parseMessage ({entry, message}) {
  console.log('pl', get(message, 'message.quick_reply.payload') || get(message, 'postback.payload'))
  return new InboundMessage({
    senderId: message.sender.id,
    text: get(message, 'message.text'),
    payload: get(message, 'message.quick_reply.payload') || get(message, 'postback.payload'),
    location: get(message, 'message.attachments[0].payload.coordinates')
  })
}

export async function sendMessages ({outboundMessages, senderId}) {
  for (var message of outboundMessages) {
    await typingIndicator({senderId})
    await sleep.promise(config.DEFAULT_SLEEP)
    await sendMessage({message, senderId})
  }
}

function messageToJson (message) {
  switch (message.type) {
    case messageTypeEnum.text:
      return {
        text: message.text
      }
    case messageTypeEnum.quick_reply:
      return {
        text: message.text,
        quick_replies: message.buttons.map(buttonToJson)
      }
    case messageTypeEnum.buttons:
      return {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: message.text,
            buttons: message.buttons.map(buttonToJson)
          }
        }
      }
    case messageTypeEnum.image:
      return {
        attachment: {
          type: 'image',
          payload: {url: message.image}
        }
      }
    case messageTypeEnum.template:
      return {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: message.cards.map(cardToJson)
          }
        }
      }
  }
}

function cardToJson (card) {
  return {
    title: card.title,
    subtitle: card.subtitle,
    image_url: card.image,
    buttons: card.buttons ? card.buttons.map(buttonToJson) : null
  }
}

function buttonToJson (button) {
  switch (button.type) {
    case buttonTypeEnum.text:
      if (button.isQuickReply) {
        return {
          content_type: 'text',
          title: button.text,
          payload: button.payload
        }
      } else {
        return {
          type: 'postback',
          title: button.text,
          payload: button.payload
        }
      }
    case buttonTypeEnum.location:
      return {
        content_type: 'location'
      }
    case buttonTypeEnum.url:
      return {
        type: 'web_url',
        url: button.url,
        title: button.text
      }
    case buttonTypeEnum.call:
      return {
        type: 'phone_number',
        title: button.text,
        payload: button.phone
      }
  }
}

export async function sendMessage ({message, senderId}) {
  const body = {
    recipient: {id: senderId},
    message: messageToJson(message)
  }
  await sendToFb({body})
}

export async function typingIndicator ({senderId}) {
  const body = {
    recipient: {id: senderId},
    sender_action: 'typing_on'
  }

  await sendToFb({body})
}

async function sendToFb ({body}) {
  const uri = `${FB_ENDPOINT}?access_token=${config.FB_ACCESS_TOKEN}`

  console.log('sending message to uri', uri)
  console.log(JSON.stringify(body, null, 2))

  await request({
    method: 'POST',
    json: true,
    headers: [{name: 'content-type', value: 'application/json'}],
    uri,
    body
  })
}
