const discord = require('discord.js')
const cheerio = require('cheerio')
const request = require('request')
const stringify = require('json-stringify-safe')

class Discord {
  constructor () {
    this.client = new discord.Client()

    /*
     * -- Define Functions --
     */
    this.fnc = {
      ready: msg => {
        this.client.user.setAvatar('./static/logo.png')
        this.client.user.setUsername('MegaBot')
        this.bot.git.revparse(['HEAD'], (err, hash) => {
          if (err) { return console.error(err) }
          this.client.user.setActivity(`Chat | ${hash.slice(0, 7)}`, { type: 'LISTENING' })
        })
        this.channels = {}
        for (let channel in this.config.channels) {
          this.channels[channel] = this.client.channels.find('name', this.config.channels[channel])
        }
      },

      message: msg => {
        if (msg.channel === this.channels.megabot) {
          // check for valide command
          for (var command in this.commands) {
            let regex = new RegExp(`^!${command}\\b`, 'i')
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

      rssRelease: {
        blog: rss => {
          const $ = cheerio.load(rss.summary)

          const embed = new discord.RichEmbed()
            .setAuthor(`New Release by ${rss.author}`, 'https://i.imgur.com/y2K1AVi.png', `https://snahp.it/author/${rss.author}`)
            .setThumbnail($('img').attr('src'))
            .setTitle(rss.title)
            .setURL(rss.guid)
            .setFooter(rss.categories.join(', '))

          this.channels.rssBlog.send({embed})
        },
        forum: rss => {
          const embed = new discord.RichEmbed()
            .setTitle(rss.title)
            .setURL(rss.guid)

          this.channels.rssForum.send({embed})
        }
      },

      embed2json: embed => {
        embed = stringify(embed, null, 2)
        embed = JSON.parse(embed)

        let embedJson = {}
        embedJson.fields = embed.fields

        if (embed.author) {
          embedJson.author = {}
          embedJson.author.name = embed.author.name
          embedJson.author.url = embed.author.url
          embedJson.author.icon_url = embed.author.iconURL
        }

        embedJson.thumbnail = embed.thumbnail

        return embedJson
      },

      parseArgs: msg => {
        let args = msg.content.split(';')
        args = args.map(el => el.trim())
        args = args.filter(el => el !== '')
        return args
      },

      addID: (msg, embed, isRequest) => {
        if (!embed.fields.find(x => /^(Fill ID|Request ID):$/.test(x.name))) {
          embed.addField(isRequest ? 'Request ID:' : 'Fill ID:', `\`${msg.id}\``)
        }
        setTimeout(() => {
          msg.edit({embed}).then(msg => {
            setTimeout(() => {
              if (!msg.embeds[0].fields.find(x => /^(Fill ID|Request ID):$/.test(x.name))) {
                console.log(msg.id, 'missing ID field')
                this.fnc.addID(msg, embed, isRequest)
              }
            }, 1000)
          }).catch(console.error)
        }, 1000)
      },

      request: msg => {
        let args = this.fnc.parseArgs(msg)
        const [type, title, quality, host, link] = args

        const embedErr = new discord.RichEmbed()
          .addField('Usage:', '```!request <request type>; \n<title>; \n<quality>; \n<preferred host>; \n<relevant link>```')
          .addField('Example:', '```!request Movie; \nMonsters Inc.; \n1080p or higher, x265; \nMEGA; \nhttp://www.imdb.com/title/tt1319735```')
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
          setTimeout(() => {
            this.fnc.addID(request, embed, true)
          }, 1000)
        })
      },

      unwatch: msg => this.fnc.watch(msg, true),
      watch: (msg, isUnwatch) => {
        let args = this.fnc.parseArgs(msg)
        let [id] = args

        const embedErr = new discord.RichEmbed()
          .addField('Usage:', '```!' + (isUnwatch ? 'un' : '') + 'watch <request id>```')
          .addField('Example:', '```!' + (isUnwatch ? 'un' : '') + 'watch 427912129794805678```')
          .setColor('RED')

        if (!/^\d{18}$/.test(id)) {
          return msg.reply('invalide parameter: <request id>', {embed: embedErr})
        }

        this.channels.requested.fetchMessage(id).then(request => {
          let embed = this.fnc.embed2json(request.embeds[0])

          if (embed.fields[0].value === msg.author.toString()) {
            return msg.reply('As the Author of this Request you will allready be notified if the Request is Filled!')
          }

          let i = embed.fields.findIndex(x => x.name === 'Watchers:')

          let watchers = []
          if (i !== -1) {
            watchers = embed.fields[i].value.split(', ')
            if (watchers.indexOf(msg.author.toString()) !== -1) {
              if (isUnwatch) {
                watchers = watchers.filter(x => x !== msg.author.toString())
              } else {
                return msg.reply('You are allready Watching this Request! :thinking:')
              }
            } else if (isUnwatch) {
              return msg.reply('You are not a Watcher!')
            } else {
              watchers.push(msg.author.toString())
            }

            embed.fields[i].value = watchers.join(', ')
          } else {
            if (isUnwatch) {
              return msg.reply('There are no Watchers!')
            } else {
              watchers.push(msg.author.toString())
              embed.fields.push({
                name: 'Watchers:',
                value: watchers.join(', ')
              })
            }
          }

          embed.fields = embed.fields.filter(x => x.value !== '')

          request.edit({embed})
          if (isUnwatch) {
            return msg.reply(`You are no longer watching the Request \`${request.id}\``)
          } else {
            return msg.reply(`You are now gonna be notified if the Request \`${request.id}\` gets Filled! :thumbsup:`)
          }
        }).catch(err => {
          console.error(err)
          return msg.reply('Sry, I couldnt find a Message with that ID! :slight_frown:')
        })
      },

      filled: msg => {
        // parse command
        let args = this.fnc.parseArgs(msg)
        let [requestId, link, title, notes] = args

        const embedErr = new discord.RichEmbed()
          .addField('Usage:', '```!fill <request id>; \n<links.snahp.it-url>; \n<title>; \noptional:<notes>```')
          .addField('Example:', '```!fill 427912129794805678; \nhttps://links.snahp.it/duTOXhxpe9qO8g3m93LfGuJ8gFbRMUb1zjK; \ntv show; \nThe Password is Cupcake```')
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
          } else if (!/^http(s)?:\/\/forum\.snahp\.it\/viewtopic\.php\?(f=\d+|&|t=\d+|p=\d+|#p\d+)+$/.test(link)) {
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

        this.channels.filled.send({embed}).then(fill => {
          msg.reply(`Thank you for your Submission! :thumbsup: Your Fill ID is \`${fill.id}\``)
          setTimeout(() => {
            this.fnc.addID(fill, embed, false)
          }, 1000)

          this.channels.requested.fetchMessage(requestId).then(requestMsg => {
            let requestEmbed = requestMsg.embeds[0]

            let watchers = requestEmbed.fields.find(x => x.name === 'Watchers:')
            if (watchers) {
              watchers = watchers.value.split(', ')
              watchers.push(requestEmbed.fields[0].value)
            } else {
              watchers = requestEmbed.fields.find(x => x.name === 'Requester:')
              watchers = [watchers.value]
            }
            console.log(watchers)
            watchers.forEach(watcher => {
              let [userId] = watcher.match(/\d+/)
              let user = this.client.users.get(userId)
              user.send('Good News _Everyone_! Looks like Somebody filled your Request!', {embed})
            })

            // remove json circular structures
            requestEmbed = this.fnc.embed2json(requestEmbed)

            // check if embed has enough space for the new fields
            if (requestEmbed.fields.length + 5 > 25) { return }

            // create new embed using existing json data
            let newEmbed = new discord.RichEmbed(requestEmbed)

            // add Filled fields & Set color
            newEmbed.setColor('GREEN')
              .addBlankField()
              .addField('Filled By:', msg.author.toString())
              .addField('Link:', link)

            if (notes) {
              newEmbed.addField('Notes:', notes)
            }
            requestMsg.edit({embed: newEmbed})
          }).catch(err => {
            console.error(err)
            msg.reply(`Ups! Looks like there is no Request with that ID. :thinking: \nI still posted it in ${this.channels.filled.toString()} tho. If you want to Delete it, use the \`!remove\` command!`)
          })
        })
      },

      remove: msg => {
        let args = this.fnc.parseArgs(msg)
        let [id, force] = args

        const embedErr = new discord.RichEmbed()
          .addField('Usage:', '```!remove <request/fill id>```')
          .addField('Example:', '```!remove 427912129794805678```')
          .setColor('RED')

        if (!/^\d{18}$/.test(id)) {
          return msg.reply('invalide parameter: <request id>', {embed: embedErr})
        }

        let deleteMessage = message => {
          if (!message.deletable) {
            return msg.reply('Sry, i couldnt delete that Message! :slight_frown:')
          }

          message.user = message.embeds[0].fields[0].value
          if (message.user !== msg.author.toString()) {
            if (force === '-f' && ['124948849893703680', '314691826164695040'].indexOf(msg.author.id) !== -1) {
              msg.reply(`Not your Post but Granted!`)
            } else {
              return msg.reply(`Hold on! That doesnt look like Your Request/Fill! :thinking: \nThis was made by ${message.user}. Maybe try contacting an Admin to delete this?`)
            }
          }

          message.delete().then(() => {
            msg.reply('Message has been Deleted!')
          })
        }

        this.channels.requested.fetchMessage(id).then(deleteMessage).catch(() => {
          this.channels.filled.fetchMessage(id).then(deleteMessage).catch(() => {
            return msg.reply('Sry, I couldnt find a Message with that ID! :slight_frown:')
          })
        })
      },

      pull: msg => {
        if (['124948849893703680', '314691826164695040'].indexOf(msg.author.id) !== -1) {
          this.bot.git.pull((err, pull) => {
            if (err) { return console.error(err) }
            msg.reply(`\`\`\`JSON\n${JSON.stringify(pull, null, 2)}\`\`\``)
          })
          this.bot.git.log(['--oneline', '-1'], (err, log) => {
            if (err) { return console.error(err) }
            msg.reply(`\`\`\`js\n'${log.latest.hash}'\`\`\``)
          })
          this.bot.git.revparse(['HEAD'], (err, hash) => {
            if (err) { return console.error(err) }
            msg.reply(`\`\`\`js\n'${hash.trim()}'\`\`\``)
          })
        }
      },

      restart: msg => {
        if (['124948849893703680', '314691826164695040'].indexOf(msg.author.id) !== -1) {
          msg.reply('restarting').then(() => {
            process.exit(0)
          })
        }
      },

      help: msg => {
        const embedErr = new discord.RichEmbed()
          .addField('Request:', '`!r` | `!request`')
          .addField('Fill Request:', '`!f` | `!fill` | `!filled`')
          .addField('Delete Your Request/Fill:', '`!rm` | `!remove`')
          .addField('Watch Request:', '`!w` | `!watch`')
          .addField('Unwatch Request:', '`!uw` | `!unwatch`')
          .addField('Report Bugs:', '<@124948849893703680>')
          .setFooter('https://github.com/JohnDeved/MegaBot')

        return msg.reply({embed: embedErr})
      }
    }

    this.commands = {
      /*
       * -- Define Commands --
       */
      h: this.fnc.help,
      help: this.fnc.help,

      r: this.fnc.request,
      request: this.fnc.request,

      f: this.fnc.filled,
      fill: this.fnc.filled,
      filled: this.fnc.filled,

      w: this.fnc.watch,
      watch: this.fnc.watch,

      uw: this.fnc.unwatch,
      unwatch: this.fnc.unwatch,

      rm: this.fnc.remove,
      remove: this.fnc.remove,

      pull: this.fnc.pull,
      restart: this.fnc.restart
    }
  }

  init (bot) {
    this.bot = bot
    this.config = this.bot.config
    this.client.login(this.config.token)

    this.client.on('error', console.error)
    this.client.on('ready', this.fnc.ready)
    this.client.on('message', this.fnc.message)

    return this
  }
}

module.exports = new Discord()
