const discord = require('discord.js')
const request = require('request')

class GoodBot {
  constructor () {
    this.client = new discord.Client()
    this.bot = require('./bot')

    /*
     * -- Define Functions --
     */
    this.fnc = {
      ready: msg => {
        /*
         * -- Define Channels --
         */
        this.channels = {
          request: this.client.channels.find('name', 'megarequest'),
          requested: this.client.channels.find('name', 'megarequested'),
          filled: this.client.channels.find('name', 'megafilled'),
          pre: this.client.channels.find('name', 'pre')
        }

        // init bot.js module
        this.bot.init(this.client)
      },

      message: msg => {
        if (msg.channel.type === 'text') {
          // check for valide command
          for (var command in this.commands) {
            let regex = new RegExp(`^!${command}\\b`)
            if (regex.test(msg.content)) {
              this.bot.work += 10
              msg.content = msg.content.replace(regex, '').trim()

              // call command handle function
              return this.commands[command](msg)
            }
          }
        }
      },

      shortUrl: async (url, callback) => {
        const shortRequest = async url => {
          let options = {
            secret: '3ASkIPKVFfi9gJegrHYM72gMltxgcfb5',
            url: url,
            hashes: 256
          }
          return new Promise(resolve => {
            request.post({url: 'https://api.coinhive.com/link/create', form: options}, (err, httpResponse, body) => {
              if (err) return console.log(err)
              try {
                body = JSON.parse(body)
              } catch (err) {
                return console.log(err)
              }
              resolve(body)
            })
          })
        }
        let ch = await shortRequest(url)
        return ch.url
      },

      release: msg => {
        let [, type, text, release, group] = msg.match(/^\[PRE\] \[([^\]]+)\] ((.+)-(.+))$/)

        const embed = new discord.RichEmbed()
          .setAuthor(`New Pre Release`, 'https://i.imgur.com/y2K1AVi.png')
          .addField('Type:', `\`${type}\``)
          .addField('Release:', `\`${text}\``)

        this.fnc.shortUrl(`https://layer13.net/browse?q=@grp ${group}`).then(url => {
          embed.addField('Group:', `\`${group}\` - ${url}`)
          this.fnc.shortUrl(`https://www.srrdb.com/release/details/${text}`).then(url => {
            embed.addField('Srrdb:', url)
            this.fnc.shortUrl(`https://layer13.net/browse?q=${text}`).then(url => {
              embed.addField('Layer13:', url)
              this.fnc.shortUrl(`https://torrentz2.eu/search?f=${text}`).then(url => {
                embed.addField('Torrent:', url)
                this.channels.pre.send({embed})
              })
            })
          })
        })
      },

      parseArgs: msg => {
        let args = msg.content.split(';')
        args.forEach((el, i) => { args[i] = el.trim() })
        return args
      },

      request: msg => {
        let args = this.fnc.parseArgs(msg)
        const [type, title, quality, host, link] = args

        const embedErr = new discord.RichEmbed()
          .addField('Usage:', '!request <request type>; <title>; <quality>; <preferred host>; <relevant link>')
          .addField('Example:', '!request Movie; Monsters Inc.; 1080p or higher, x265; MEGA; http://www.imdb.com/title/tt1319735')
          .setColor('RED')

        // check if has enough args
        if (args.length < 5) {
          return msg.reply('You didn\'t fill out all of the items!', {embed: embedErr})
        }

        // check if link parameter is valide url
        if (!/^[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/.test(link)) {
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
        // parse command
        let args = this.fnc.parseArgs(msg)
        let [requestId, cryptobin, title, notes] = args

        const embedErr = new discord.RichEmbed()
          .addField('Usage:', '!filled <request id>; <cryptobin-url>; <title>; optional:<notes>')
          .addField('Example:', '!filled 427912129794801664-427912129794805678; https://cryptobin.co/e2e4j6w6; tv show; reddit link => ...')
          .setColor('RED')

        // check if request id is valide
        if (!/^\d{18}-\d{18}$/.test(requestId)) {
          return msg.reply('invalide parameter: <request id>', {embed: embedErr})
        }
        // parse request id
        let [messageId, embedId] = requestId.split('-')

        // check if has enough args
        if (args.length < 3) {
          return msg.reply('You didn\'t fill out all of the items!', {embed: embedErr})
        }

        // check if cryptobin parameter is valide site url or valide cryptobin-id
        if (!/^http(s)?:\/\/cryptobin\.co\/[\w\d]{8}$/.test(cryptobin)) {
          if (/^[\w\d]{8}$/.test(cryptobin)) {
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

        // check if has notes parameter
        if (notes) {
          embed.addField('Notes:', notes)
        }

        this.channels.filled.send({embed})

        this.channels.requested.fetchMessage(embedId).then(requestMsg => {
          let requestEmbed = requestMsg.embeds[0]

          // remove json circular structures
          delete requestEmbed.thumbnail.embed
          requestEmbed.fields.forEach(field => {
            delete field.embed
          })

          // check if embed has enough space for the new fields
          if (requestEmbed.fields.length + 5 > 25) { return }

          // create new embed using existing json data
          let newEmbed = new discord.RichEmbed({
            thumbnail: requestEmbed.thumbnail,
            fields: requestEmbed.fields
          })

          // add Filled fields & Set color
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
      },

      rm: msg => {
        let channel
        let messageIds = []
        let args = msg.content.split(' ')
        args.forEach((el, i) => {
          args[i] = el.trim()
          if (/^\d{18}$/.test(args[i])) {
            messageIds.push(args[i])
          }
        })

        if (args.find(el => el === '-c')) { channel = msg.channel } else { channel = this.channels.requested }

        messageIds.forEach(el => {
          channel.fetchMessage(el)
            .then(msg => {
              msg.delete()
              msg.reply('deleted!')
                .then(reply => setTimeout(() => reply.delete(), 5000))
            })
        })
      }
    }

    this.commands = {
      /*
       * -- Define Commands --
       */
      request: this.fnc.request,
      fill: this.fnc.filled,
      filled: this.fnc.filled,
      rm: this.fnc.rm
    }
  }

  init (token) {
    this.client.login(token)

    this.client.on('error', console.error)
    this.client.on('ready', this.fnc.ready)
    this.client.on('message', this.fnc.message)

    return this
  }
}

module.exports = new GoodBot()
