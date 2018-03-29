const discord = require('discord.js')

class GoodBot {
  constructor () {
    this.client = new discord.Client()
    this.bot = require('./bot')

    this.handle = {
      ready: msg => {
        this.channels = {
          request: this.client.channels.find('name', 'megarequest'),
          requested: this.client.channels.find('name', 'megarequested'),
          filled: this.client.channels.find('name', 'megafilled')
        }

        this.bot.init(this.client)
      },

      message: msg => {
        // check if channel.parent.id is in this.channels
        if (msg.channel.type === 'text') {
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
    }

    this.commands = {
      request: msg => {
        this.bot.work += 10

        let args = msg.content.split(';')
        args.forEach((el, i) => { args[i] = el.trim() })

        if (args.length < 5) {
          const embed = new discord.RichEmbed()
            .addField('Usage:', '!request <request type>; <title>; <quality>; <preferred host>; <IMDB link>')
            .addField('Example:', '!request Movie; Monsters Inc.; 1080p or higher, x265; MEGA; http://www.imdb.com/title/tt1319735')

          msg.reply('You didn\'t fill out all of the items!', {embed})
        } else {
          const [type, title, quality, host, imdb] = args

          const embed = new discord.RichEmbed()
            .setAuthor(`New request by ${msg.author.tag}`, 'https://i.imgur.com/eXG2mCc.png')
            .setThumbnail(msg.author.avatarURL)
            .addField('Type:', type)
            .addField('Title:', title)
            .addField('Quality:', quality)
            .addField('Preferred Host:', host)
            .addField('Relevant Link:', imdb)

          this.channels.requested.send({embed}).then(request => {
            embed.addField('Request ID:', `${msg.id}-${request.id}`)
            request.edit({embed})
          })
        }
      },

      test1: msg => msg.reply('1'),
      test2: msg => msg.reply('2'),
      test3: msg => msg.reply('3')
    }
  }

  init (token) {
    this.client.login(token)

    this.client.on('error', console.error)
    this.client.on('ready', this.handle.ready)
    this.client.on('message', this.handle.message)
  }
}

module.exports = new GoodBot()
