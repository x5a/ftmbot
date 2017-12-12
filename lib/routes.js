import router from 'express-promise-router'

import {parseEntry} from './facebook'
import controller from './controller'
import config from './config'

const ENDPOINT = '/api/v1/fb'

const routes = router()

routes.get(ENDPOINT, async function (req, res) {
  console.log('verify request')

  if (req.query['hub.verify_token'] === config.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  } else {
    res.send('Error, wrong validation token')
  }
})

routes.post(ENDPOINT, async function (req, res) {
  console.log(JSON.stringify(req.body, null, 2))
  res.sendStatus(200)
  await Promise.all(parseEntry(req.body).map(controller))
})

export default routes
