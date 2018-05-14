const discord = require('discord.js')
const cheerio = require('cheerio')
const request = require('request')

class Discord {
  constructor () {
    this.client = new discord.Client()

    /*
     * -- Define Functions --
     */
    this.fnc = {
      ready: msg => {
        /*
         * -- Define Channels --
         */
        this.channels = {}
        for (let channel in this.config.channels) {
          this.channels[channel] = this.client.channels.find('name', this.config.channels[channel])
        }
      },

      message: msg => {
        if (msg.channel === this.channels.megabot) {
          // check for valide command
          for (var command in this.commands) {
            let regex = new RegExp(`^!${command}\\b`)
            if (regex.test(msg.content)) {
              // this.bot.work += 10
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
            secret: this.config.coinhive,
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

      preRelease: msg => {
        let [, type, release, group] = msg.match(/^\(PRE\) \(([^)]+)\) (.+-(.+))$/)

        if (/xxx/i.test(type)) {
          return console.log('exclude xxx:', msg)
        } else if (/(german|swesub|dutch|danish|flemish|spanish|italian|french|finnish|polish|norwegian)/i.test(release)) {
          return console.log('exclude foreign:', msg)
        }

        const embed = new discord.RichEmbed()
          .setAuthor(`New Pre Release`, 'https://i.imgur.com/y2K1AVi.png')
          .addField('Type:', `\`${type}\``)
          .addField('Release:', `\`${release}\``)

        this.fnc.shortUrl(`https://layer13.net/browse?q=@grp ${group}`).then(url => {
          embed.addField('Group:', `\`${group}\` - ${url}`)
          this.fnc.shortUrl(`https://www.srrdb.com/release/details/${release}`).then(url => {
            embed.addField('Srrdb:', url)
            this.fnc.shortUrl(`https://layer13.net/browse?q=${release}`).then(url => {
              embed.addField('Layer13:', url)
              this.fnc.shortUrl(`https://torrentz2.eu/search?f=${release}`).then(url => {
                embed.addField('Torrent:', url)
                this.channels.pre.send({embed})
              })
            })
          })
        })
      },

      rssRelease: rss => {
        const $ = cheerio.load(rss.summary)

        const embed = new discord.RichEmbed()
          .setAuthor(`New Release by ${rss.author}`, 'https://i.imgur.com/y2K1AVi.png', `https://snahp.it/author/${rss.author}`)
          .setThumbnail($('img').attr('src'))
          .setTitle(rss.title)
          .setURL(rss.guid)
          .setFooter(rss.categories.join(', '))

        this.channels.rss.send({embed})
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
          .addField('Usage:', '```!request \n<request type>; \n<title>; \n<quality>; \n<preferred host>; \n<relevant link>```')
          .addField('Example:', '```!request \nMovie; \nMonsters Inc.; \n1080p or higher, x265; \nMEGA; \nhttp://www.imdb.com/title/tt1319735```')
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
          msg.reply(`Your Request ID is \`${request.id}\``)
          embed.addField('Request ID:', `\`${request.id}\``)
          request.edit({embed})
        })
      },

      filled: msg => {
        // parse command
        let args = this.fnc.parseArgs(msg)
        let [requestId, link, title, notes] = args

        const embedErr = new discord.RichEmbed()
          .addField('Usage:', '```!fill <request id>; \n<links.snahp.it-url>; \n<title>; \noptional:<notes>```')
          .addField('Example:', '```!fill \n427912129794805678; \nhttps://links.snahp.it/duTOXhxpe9qO8g3m93LfGuJ8gFbRMUb1zjK; \ntv show; \nThe Password is Cupcake```')
          .setColor('RED')

        // check if request id is valide
        if (!/^\d{18}$/.test(requestId)) {
          return msg.reply('invalide parameter: <request id>', {embed: embedErr})
        }

        // check if has enough args
        if (args.length < 3) {
          return msg.reply('You didn\'t fill out all of the items!', {embed: embedErr})
        }

        // check if parameter is valide site url or valide id
        if (!/^http(s)?:\/\/links\.snahp\.it\/[\w\d]{35}$/.test(link)) {
          if (/^[\w\d]{35}$/.test(link)) {
            link = `https://links.snahp.it/${link}`
          } else {
            return msg.reply('invalide parameter: <links.snahp.it-url>', {embed: embedErr})
          }
        }

        const embed = new discord.RichEmbed()
          .setAuthor(`New Release`, 'https://i.imgur.com/y2K1AVi.png')
          .setThumbnail(msg.author.avatarURL)
          .addField('Filled By:', msg.author.toString())
          .addField('Title:', title)
          .addField('Link:', link)

        // check if has notes parameter
        if (notes) {
          embed.addField('Notes:', notes)
        }

        this.channels.filled.send({embed})
        msg.reply(`Thank you for your Submission!`)

        this.channels.requested.fetchMessage(requestId).then(requestMsg => {
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
            .addField('Link:', link)

          if (notes) {
            newEmbed.addField('Notes:', notes)
          }
          requestMsg.edit({embed: newEmbed})
        }).catch(console.error)
      },

      help: msg => {
        const embedErr = new discord.RichEmbed()
          .addField('Request:', '`!request` | `!r`')
          .addField('Fill Request:', '`!fill` | `!filled` | `!f`')
          .addField('Report Bugs:', '<@124948849893703680>')
          .setFooter('https://github.com/JohnDeved/MegaBot')

        return msg.reply({embed: embedErr})
      }
    }

    this.commands = {
      /*
       * -- Define Commands --
       */
      help: this.fnc.help,

      r: this.fnc.request,
      request: this.fnc.request,

      f: this.fnc.filled,
      fill: this.fnc.filled,
      filled: this.fnc.filled
    }
  }

  init (config) {
    this.config = config
    this.client.login(this.config.token)

    this.client.on('error', console.error)
    this.client.on('ready', this.fnc.ready)
    this.client.on('message', this.fnc.message)

    return this
  }
}

module.exports = new Discord()
