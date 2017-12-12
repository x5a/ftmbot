import {get} from 'lodash'

export class InboundMessage {
  constructor ({senderId, recipientId, text = null, payload = null, location = null}) {
    this.senderId = senderId
    this.text = text
    console.log('p', payload)
    this.payload = payload ? JSON.parse(payload) : null
    this.location = location
  }

  get userId () {
    return this.senderId
  }

  get intent () {
    return get(this.payload, 'intent')
  }
}

export const messageTypeEnum = {
  text: 1,
  quick_reply: 2,
  buttons: 3,
  image: 4,
  template: 5
}

export class OutboundMessage {
  constructor ({text, buttons, image, cards, type, ...additional}) {
    let isQuickReply = true
    if (type === 'buttons') {
      isQuickReply = false
    }

    this.text = text
    this.buttons = buttons ? buttons.map(function (obj) { return new Button(obj, isQuickReply) }) : null
    this.image = image
    this.cards = cards ? cards.map(function (obj) { return new Card(obj) }) : null
    this.type = type ? messageTypeEnum[type] : this.getType()

    this.stateUpdates = {
      nextIntent: additional.default_next_intent
    }
  }

  getType () {
    if (this.image) {
      return messageTypeEnum.image
    } else if (this.buttons) {
      return messageTypeEnum.quick_reply
    } else if (this.text) {
      return messageTypeEnum.text
    } else if (this.cards) {
      return messageTypeEnum.template
    } else {
      throw new Error('This is not a valid message')
    }
  }
}

export const buttonTypeEnum = {
  text: 1,
  location: 2,
  url: 3,
  call: 4
}

export class Button {
  constructor ({text, url, phone, postback, type = 'text'}, isQuickReply) {
    this.type = buttonTypeEnum[type]
    this.text = text
    this.url = url
    this.phone = phone
    this.postback = postback
    this.isQuickReply = isQuickReply
  }

  get payload () {
    if (this.postback) {
      return JSON.stringify(this.postback)
    }
    return '{}'
  }
}

export class Card {
  constructor ({image, title, subtitle, buttons}) {
    this.image = image
    this.title = title
    this.subtitle = subtitle
    this.buttons = buttons ? buttons.map(function (obj) { return new Button(obj) }) : null
  }
}
