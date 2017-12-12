import yaml from 'js-yaml'
import {memoize} from 'lodash'
import fs from 'fs'
import path from 'path'
import handlebars from 'handlebars'

import {OutboundMessage} from './messages'

const ACTION_FILE = 'actions.yaml'

const template = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, ACTION_FILE), 'utf8')
)

export default function getMessagesFromYaml ({intent, actionData}) {
  let action = intent || 'default'

  const rawTemplates = template(actionData.template)
  const allActions = yaml.safeLoad(rawTemplates)

  const intentAction = allActions.actions[action]

  console.log('raw action', JSON.stringify(intentAction, null, 2))
  if (!intentAction) {
    throw new Error(`no intent for action '${action}'`)
  }

  return intentAction.map(function (obj) { return new OutboundMessage(obj) })
}
