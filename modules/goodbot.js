const discord = require('discord.js')

class GoodBot {
  constructor () {
    this.client = new discord.Client()
    this.config = require('../config')

    this.parents = {
      general: '427530321869799428',
      mega: '427531038991056897',
      other: '360848285679747072',
      test: '428538257278631936'
    }

    this.handle = {
      ready: msg => {
        console.log(`Logged in as ${this.client.user.tag}!`)

        this.channels = {
          // request: this.client.channels.get('346697601829175297')
          request: this.client.channels.get('428565997788725278')
        }
      },

      message: msg => {
        console.log(msg)

        // check if channel.parent.id is in this.channels
        if (msg.channel.type === 'text') {
          if (Object.values(this.parents).indexOf(msg.channel.parent.id) !== -1) {
            // check for valide command
            for (var command in this.commands) {
              let regex = new RegExp(`^!${command}`)
              if (regex.test(msg.content)) {
                msg.content = msg.content.replace(regex, '').trim()
                return this.commands[command](msg)
              }
            }
          }
        }
      },

      request: msg => {
        let args = msg.content.split(';')
        args.forEach((el, i) => { args[i] = el.trim() })

        if (args.length < 5) {
          const embed = new discord.RichEmbed()
            .addField('Usage:', '!request <request type>; <title>; <quality>; <preferred host>; <IMDB link>')
            .addField('Example:', '!request Movie; Monsters Inc.; 1080p or higher, x265; MEGA; http://www.imdb.com/title/tt1319735')

          msg.reply('You didn\'t fill out all of the items!', {embed})
        } else {
          let [type, title, quality, host, imdb] = args
          this.channels.request.send(JSON.stringify(args))
        }
      }
    }

    this.commands = {
      request: this.handle.request,
      test1: msg => msg.reply('1'),
      test2: msg => msg.reply('2'),
      test3: msg => msg.reply('3')
    }
  }

  init () {
    this.client.login(this.config.token)

    this.client.on('error', console.error)
    this.client.on('ready', this.handle.ready)
    this.client.on('message', this.handle.message)

    console.info('Im Awake! >.<')
  }
}

module.exports = new GoodBot()
