const bot = {}
bot.config = require('./config')
bot.git = require('simple-git')()

bot.discord = require('./modules/bot/discordbot').init(bot, () => {
  bot.irc = require('./modules/bot/prebot').init(bot)
  bot.rss = require('./modules/bot/rssbot').init(bot)

  require('./modules/hookstdout')(bot)
  require('./modules/cleanup')(bot)
})
