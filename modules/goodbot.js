const discord = require('discord.js')

class GoodBot {
  constructor () {
    this.client = new discord.Client()
    this.config = require('../config')

    this.parents = {
      general: '427530321869799428',
      mega: '427531038991056897',
      other: '360848285679747072'
    }

    this.channels = {
      request: this.client.channels.get('346697601829175297')
    }

    this.handle = {
      message: msg => {
        // check if channel.parent.id is in this.channels
        if (Object.values(this.parents).indexOf(msg.channel.parent.id) !== -1) {
          // check if msg has "!" prefix
          if (/^!/.test(msg.content)) {

          }
        }
      }
    }
  }

  init () {
    this.client.login(this.config.token)

    this.client.on('error', console.error)
    this.client.on('message', this.handle.message)

    console.info('Im Awake! >.<')
  }
}

module.exports = new GoodBot()
