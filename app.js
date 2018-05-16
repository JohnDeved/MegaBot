const fs = require('fs')
const Log = require('log')
const path = require('path')
const config = require('./config')

const discord = require('./modules/discordbot').init(config)

// require('./modules/bot').init(discord)
require('./modules/prebot').init(discord)
require('./modules/rssbot').init(discord)

const log = new Log('info', fs.createWriteStream('./node.log'))
global.consolelog = console.log
let handleLog = (...args) => {
  global.consolelog(...args)
  log.info(...args)
}
console.log = handleLog
console.error = handleLog
