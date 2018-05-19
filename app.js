const fs = require('fs')
const config = require('./config')
const nodeCleanup = require('node-cleanup')

const discord = require('./modules/discordbot').init(config)

// require('./modules/bot').init(discord)
const irc = require('./modules/prebot').init(discord)
require('./modules/rssbot').init(discord)

process.stdout.w = process.stdout.write
let log = fs.createWriteStream('./node.log')
process.stdout.write = process.stderr.write = (...args) => {
  let [out] = args
  process.stdout.w(out)
  log.write(out.replace(/\u001B\[\d+m/g, ''))
}

nodeCleanup(function (exitCode, signal) {
  console.log('starting Cleanup')
  irc.client.disconnect('Ill be back.', () => {
    console.log('Disconected Irc')
  })
})
