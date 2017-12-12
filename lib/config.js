import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'

const CONFIG_FILE = '../config.yaml'

let config = {}

// Get document, or throw exception on error
try {
  console.log()
  config = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8'))
  console.log(config)
} catch (e) {
  console.log(e)
}

export default config
