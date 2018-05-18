const fs = require('fs')
const config = require('./config')

const discord = require('./modules/discordbot').init(config)

// require('./modules/bot').init(discord)
require('./modules/prebot').init(discord)
require('./modules/rssbot').init(discord)

process.stdout.w = process.stdout.write
let access = fs.createWriteStream('./node.log')
process.stdout.write = process.stderr.write = (...args) => {
  let [out] = args
  access.write(out)
  process.stdout.w(out)
}
