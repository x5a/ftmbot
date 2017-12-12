import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'

import routes from './routes'
import config from './config'

const app = express()
app.use(bodyParser.json())
app.use(morgan(config.LOGGER_STRING))
app.use(routes)

app.listen(config.PORT, function () {
  console.log(`FTMBOT listening on port ${config.PORT}`)
})
