const RssFeedEmitter = require('rss-feed-emitter')

class RssBot {
  constructor () {
    this.feeder = new RssFeedEmitter({ userAgent: 'Googlebot' })
  }

  init (bot) {
    this.bot = bot
    this.discord = this.bot.discord
    this.config = this.bot.config

    this.config.rss.forEach(rss => {
      this.feeder.add({
        url: rss.link,
        refresh: rss.interval
      })
    })

    console.info('Listening to RSS Feed now')
    this.feeder.on('new-item', item => {
      let rss = this.config.rss.find(obj => obj.link === item.meta.link)
      item.config = rss
      this.discord.fnc.rssRelease[rss.name](item)
    })

    return this
  }
}

module.exports = new RssBot()
