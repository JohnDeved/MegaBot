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
              this.bot.work += 10
              msg.content = msg.content.replace(regex, '').trim()
              return this.commands[command](msg)
            }
          }
        }
      },

      request: msg => {
        let args = msg.content.split(';')
        args.forEach((el, i) => { args[i] = el.trim() })
        const [type, title, quality, host, link] = args

        const embedErr = new discord.RichEmbed()
          .addField('Usage:', '!request <request type>; <title>; <quality>; <preferred host>; <relevant link>')
          .addField('Example:', '!request Movie; Monsters Inc.; 1080p or higher, x265; MEGA; http://www.imdb.com/title/tt1319735')
          .setColor('RED')

        if (args.length < 5) {
          return msg.reply('You didn\'t fill out all of the items!', {embed: embedErr})
        }

        if (!/[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/.test(link)) {
          return msg.reply('invalide parameter: <relevant link>', {embed: embedErr})
        }

        const embed = new discord.RichEmbed()
          .setAuthor(`New Request`, 'https://i.imgur.com/Rgqkjde.png')
          .setThumbnail(msg.author.avatarURL)
          .addField('Requester:', msg.author.toString())
          .addField('Type:', type)
          .addField('Title:', title)
          .addField('Quality:', quality)
          .addField('Preferred Host:', host)
          .addField('Relevant Link:', link)

        this.channels.requested.send({embed}).then(request => {
          embed.addField('Request ID:', `${msg.id}-${request.id}`)
          request.edit({embed})
        })
      },

      filled: msg => {
        let args = msg.content.split(';')
        args.forEach((el, i) => { args[i] = el.trim() })
        let [requestId, cryptobin, title, notes] = args
        let [messageId, embedId] = requestId.split('-')

        const embedErr = new discord.RichEmbed()
          .addField('Usage:', '!filled <request id>; <cryptobin-url>; <title>; optimal: <notes>')
          .addField('Example:', '!filled 427912129794801664-427912129794805678; https://cryptobin.co/e2e4j6w6; tv show; reddit link => ...')
          .setColor('RED')

        if (args.length < 3) {
          return msg.reply('You didn\'t fill out all of the items!', {embed: embedErr})
        }

        if (!/http(s)?:\/\/cryptobin\.co\/[\w\d]{8}/.test(cryptobin)) {
          if (/[\w\d]{8}/.test(cryptobin)) {
            cryptobin = `https://cryptobin.co/${cryptobin}`
          } else {
            return msg.reply('invalide parameter: <cryptobin-url>', {embed: embedErr})
          }
        }

        const embed = new discord.RichEmbed()
          .setAuthor(`New Release`, 'https://i.imgur.com/y2K1AVi.png')
          .setThumbnail(msg.author.avatarURL)
          .addField('Filled By:', msg.author.toString())
          .addField('Title:', title)
          .addField('Cryptobin:', cryptobin)
          .addField('Password:', '```megalinks```')

        if (notes) {
          embed.addField('Notes:', notes)
        }

        this.channels.filled.send({embed})

        this.channels.requested.fetchMessage(embedId).then(requestMsg => {
          let requestEmbed = requestMsg.embeds[0]
          delete requestEmbed.thumbnail.embed
          requestEmbed.fields.forEach(field => {
            delete field.embed
          })

          if (requestEmbed.fields.length + 5 > 25) { return }

          let newEmbed = new discord.RichEmbed({
            thumbnail: requestEmbed.thumbnail,
            fields: requestEmbed.fields
          })

          newEmbed.setColor('GREEN')
            .addBlankField()
            .addField('Filled By:', msg.author.toString())
            .addField('Cryptobin:', cryptobin)
            .addField('Password:', '```megalinks```')

          if (notes) {
            newEmbed.addField('Notes:', notes)
          }
          requestMsg.edit({embed: newEmbed})
        })
      }
    }

    this.commands = {
      request: this.handle.request,
      fill: this.handle.filled,
      filled: this.handle.filled
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
