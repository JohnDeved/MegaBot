const fs = require('fs')
const nodeCleanup = require('node-cleanup')

const bot = {}
bot.config = require('./config')
bot.git = require('simple-git')()

bot.discord = require('./modules/discordbot').init(bot)

bot.irc = require('./modules/prebot').init(bot)
bot.rss = require('./modules/rssbot').init(bot)

process.stdout.w = process.stdout.write
let log = fs.createWriteStream('./node.log')
process.stdout.write = process.stderr.write = out => {
  process.stdout.w(out)
  out = out.replace(/\u001B\[\d+m/g, '')
  log.write(out)
  if (bot.discord) {
    if (bot.discord.channels) {
      if (bot.discord.channels.dev) {
        bot.discord.channels.dev.send(`\`\`\`JSON\n${out}\`\`\``)
      }
    }
  }
}

nodeCleanup((exitCode, signal) => {
  bot.irc.client.disconnect('Ill be back.')
  process.kill(process.pid)
})
