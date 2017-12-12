import redis from 'thunk-redis'
import {assign} from 'lodash'

const redisClient = redis.createClient({
  database: 1,
  usePromise: true
})


export default class StateManager {
  constructor ({userId}) {
    this.userId = userId
    this.data = {}
  }

  get key () {
    return `user_${this.userId}`
  }

  get rawData () {
    return JSON.stringify(this.data)
  }

  async load () {
    let rawData = await redisClient.get(this.key)
    if (rawData) {
      this.data = JSON.parse(rawData)
      console.log('state:', this.data)
    }
  }

  async save () {
    await redisClient.set(this.key, this.rawData)
  }

  nextIntent () {
    return this.data.nextIntent
  }

  resetTemporaryState () {
    this.data.nextIntent = null
  }

  recordSentMessages (outboundMessages) {
    this.resetTemporaryState()
    for (let outboundMessage of outboundMessages) {
      if (outboundMessage.stateUpdates) {
        assign(this.data, outboundMessage.stateUpdates)
      }
    }
  }
}
