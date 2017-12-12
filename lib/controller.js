import StateManager from './stateManager'
import {sendMessages, typingIndicator} from './facebook'
import actionProcessor from './actions'
import getMessagesFromYaml from './yamlProcessor'

export default async function controller (inboundMessage) {
  const userId = inboundMessage.userId
  const senderId = inboundMessage.senderId
  const stateManager = new StateManager({
    userId
  })

  await typingIndicator({senderId})

  await stateManager.load()

  let intent = inboundMessage.intent || stateManager.nextIntent()

  const actionData = await actionProcessor({intent, stateManager, inboundMessage})
  intent = actionData.intent || intent

  const outboundMessages = getMessagesFromYaml({intent, actionData})

  await sendMessages({
    outboundMessages,
    senderId
  })

  stateManager.recordSentMessages(outboundMessages)

  await stateManager.save()
}
