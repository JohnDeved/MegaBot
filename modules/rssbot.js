const RssFeedEmitter = require('rss-feed-emitter')

class RssBot {
  constructor () {
    this.feeder = new RssFeedEmitter()
  }

  init (discord) {
    this.discord = discord
    this.config = this.discord.config

    this.feeder.add({
      url: this.config.rss,
      refresh: 2000
    })

    setTimeout(() => {
      this.feeder.on('new-item', (item) => {
        this.discord.fnc.rssRelease(item)
      })
    }, 10 * 1000)

    return this
  }
}

module.exports = new RssBot()
