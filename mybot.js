/*
var embed = new Discord.MessageEmbed(<embed stuff>)
let sentmsg = await channel.send(embed)
<check stuff>
sentmsg.edit(embed.setColor('RED'))
*/

global.Buffer = global.Buffer || require('buffer').Buffer

if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return new Buffer(str, 'binary').toString('base64')
  }
}

if (typeof atob === 'undefined') {
  global.atob = function (b64Encoded) {
    return new Buffer(b64Encoded, 'base64').toString('binary')
  }
}

const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config.json')

client.login(config.token)
client.on('error', e => {
  console.log('Uh oh! Error!')
})
isSaraOnline = true

client.on('message', (message) => {
  if (message.author.bot) return
  if (message.channel.parent.id === '427530321869799428' || message.channel.parent.id === '427531038991056897' || message.channel.parent.id === '360848285679747072') {
    if (message.content.startsWith('!')) {
      const megarequestedChannel = client.channels.get('346697601829175297')

      function postCommand (msguser, msgavatar) {
        console.log('makin a request')
        megarequestedChannel.send({embed: {
          author: {

            name: msguser,
            icon_url: msgavatar
          },
          description: (`Request type: ${args[0]}\nTitle: ${args[1]}\nQuality/specs: ${args[2]}\nPreferred host: ${args[3]}\nRequest ID: ${message.id}\nPlease fill the request in ${message.guild.channels.get('427552767947833345')} by using the \`!filled\` command!`),
          color: 0x32CD32
        }})

        movieTitle = args[1].split(/\s+/g)
        movieTitle = movieTitle.join('%20')
        message.reply(`Your request has been posted in the  ${client.channels.get('346697601829175297')} channel. While you wait for someone to answer, try searching for it at <http://megasearch.co/?q=${movieTitle}&h=0&c=0&s=1&a=&m1=&m2=>`)
      }

      args = [undefined, undefined, undefined, undefined, undefined]
      args = message.content.slice(config.prefix.length).trim().split(/\s+/g)
      const command = args.shift()
      if (command.match(/request/gi)) {
        if (message.channel.id !== '427553368257462272') {
          let tempMessage = message.channel.send(`Please place all requests in ${message.guild.channels.get('427553368257462272')} :)`)
            .then(msg => {
              setTimeout(function () { msg.delete() }, 10000)
            })
        } else {
          args = args.join(' ')
          args = args.split(/;/g)
          var anythingUndefined = false
          for (i = 0; i < 5; i++) {
            if (args[i] === undefined) {
              anythingUndefined = true
            }
          }
          if (anythingUndefined) {
            message.channel.send('You didn\'t fill out all of the items! Usage is as follows:')
            message.channel.send({embed: {
              description: '!request <request type>; <title>; <quality>; <preferred host>; <IMDB link> \nExample: !request Movie; Monsters Inc.; 1080p or higher, x265; MEGA;http://www.imdb.com/title/tt1319735',
              color: 0xd007da
            }})
          } else {
            let requestEmbed = new Discord.MessageEmbed().setTitle(args[1]).setColor('GREEN').setDescription(`*Request type*.....: ${args[0]}\nTitle...........: ${args[1]}\nQuality/specs...: ${args[2]}\nPreferred host....: ${args[3]}\nRelevant Link....: ${args[4]}\nPlease fill the request in ${message.guild.channels.get('427552767947833345')} by using the \`!filled\` command!\nRequest ID: ${message.id}`).setAuthor(message.author.username, message.author.avatarURL)

            megarequestedChannel.send(requestEmbed)
              .then(msg => {
                let embeddedDesc = msg.embeds[0].description
                embeddedDesc += '-' + msg.id
                msg.edit(requestEmbed.setDescription(embeddedDesc))
              })

            movieTitle = args[1].split(/\s+/g)
            movieTitle = movieTitle.join('%20')
            message.reply(`Your request has been posted in the  ${client.channels.get('346697601829175297')} channel. While you wait for someone to answer, try searching for it at <http://megasearch.co/?q=${movieTitle}&h=0&c=0&s=1&a=&m1=&m2=>`)
          }
        }
      } else if (command.match(/remove|rm/gi) && message.author.id === '361088614735544320') {
        if (args[0] == '-c') {
          if (args[1] == '-a') {
            args.shift()
            args.shift()
            args.forEach(currentMsg => {
              message.channel.messages.fetch(currentMsg)
                .then(msg => {
                  msg.delete()
                  message.reply('deleted!')
                    .then(delMsg => {
                      setTimeout(function () { delMsg.delete() }, 1500)
                    })
                })
            })
          } else {
            message.channel.messages.fetch(args[1])
              .then(msg => {
                msg.delete()
                message.reply('deleted!')
                  .then(delMsg => {
                    setTimeout(function () { delMsg.delete() }, 1500)
                  })
              })
          }
        } else {
          megarequestedChannel.messages.fetch(args[0])
            .then(msg => {
              msg.delete()
              message.reply('deleted!')
                .then(delMsg => {
                  delMsg.delete()
                })
            })
        }
      } else if (command.match(/faq/gi)) {
        message.channel.send('https://www.reddit.com/r/megalinks/comments/8799w6/update_subreddit_status_weekly_discussion_thread/')
      } else if (command.match(/test/gi)) {
        mentionsArray = message.mentions.members.array()
        mentionsArray.forEach(function (a) {
          message.reply(a)
        })
      } else if (command.match(/post/gi)) {
        args = args.join(' ')
        args = args.split(/;/g)
        var anythingUndefined = false
        for (i = 0; i < 4; i++) {
          if (args[i] === undefined) {
            anythingUndefined = true
          }
        }
        if (anythingUndefined) {
          message.channel.send('You didn\'t fill out all of the items! Usage is as follows:')
          message.channel.send({embed: {
            description: '!request <request type>; <title>; <quality>; <preferred host>; <OPTIONAL-relevant-link>\nExample: !request Movie; Monsters Inc.; 1080p or higher, x265; MEGA',
            color: 0xd007da
          }})
        } else {
          msgauth = message.channel.messages.fetch(args[4])
            .then(msgauth => {
              let msguser = msgauth.author.username
              let msgavatar = msgauth.author.avatarURL
              postCommand(msguser, msgavatar)
            })
        }
      } else if (command.match(/filled/gi)) {
        if (message.channel.id !== '427552767947833345') {
          message.reply('Please use that over in ' + message.guild.channels.get('427552767947833345'))
          return
        }
        args = args.join(' ')
        args = args.split(/;/g)
        var anythingUndefined = false
        for (i = 0; i < 3; i++) {
          if (args[i] === undefined) {
            anythingUndefined = true
          }
        }
        if (anythingUndefined) {
          message.channel.send('You didn\'t fill out all of the items! Usage is as follows:')
          message.channel.send({embed: {
            description: '!filled <request id>; <cryptobin-id>;<title>\n\nExample: !filled 427912129794801664; e2e4j6w6; megalinks subreddit tv show',
            color: 0xd007da
          }})
        } else {
          requestMessages = args[0].split('-') // First is the request Message, second is Request Embed
          message.guild.channels.get('427553368257462272').messages.fetch(requestMessages[0])
            .then(msg => {
              message.channel.send(filledEmbed)
              message.channel.send(`Requester: ${msg.author.toString()}`)
            })
          let filledEmbed = new Discord.MessageEmbed().setAuthor(message.author.username, message.author.avatarURL).setDescription(`Description: ${args[2]}\nCryptobin Link: http://cryptobin.co/${args[1]}\nCryptobin Password: \`megalinks\``).setColor(0xd007da)

          megarequestedChannel.messages.fetch(requestMessages[1])
            .then(requestMessage => {
              let requestEmbedDesc = requestMessage.embeds[0].description
              requestEmbedDesc += `\n\nFILLED!\nCryptobin Link: http://cryptobin.co/${args[1]}\nPassword: megalinks\nFilled By: ${message.author}`
              let requestEmbed = requestMessage.embeds[0]
              newRequestEmbed = new Discord.MessageEmbed(requestEmbed)
              // requestMessage.edit({ embed: newRequestEmbed.setDescription(requestEmbedDesc) });
              reqMsgCnt = requestMessage.content
              requestMessage.edit({ embed: newRequestEmbed.setDescription(requestEmbedDesc).setColor('RED') })

              // METOO FUNCTION
              // smug = 344929824642433027
              if (requestMessage.reactions.users.length > 1) {
                message.channel.send('test')
              }
            })
        }
      } else if (command.match(/appendMessage/g)) {
        if (message.author.id === '361088614735544320') {
          // args[0] is the message id
          args.shift()
          megarequestedChannel.messages.fetch(args[0])
            .then(editMsg => {
              const editMsgEmbed = megarequestedChannel.embeds[0]
              const editMsgEmbedDesc = editMsgEmbed.description
              let newRequestEmbedDesc = editMsgEmbedDesc + args.join(' ')
              let newRequestEmbed = new Discord.MessageEmbed(newRequestEmbed)
              editMsg.edit({embed: newRequestEmbed.setDescription(newRequestEmbedDesc)})
            })
        }
      } else if (command.match(/encode/gi)) {
        message.reply(btoa(args.join(' ')))
      } else if (command.match(/decode/gi)) {
        message.reply(atob(args[0]))
      }
    } else if (message.content.match(/request type/gi) && message.channel === '427553368257462272') {
      message.reply('Please use the `!request` command')
    }
  }
})

// TODO: reactions = !metoo?
// TODO: mandatory IMDB?
// TODO: use user id instead of message id just in case of deletion
// TODO: REACTIONS FOR !metoo
// TODO: WHITESPACING FIX? MAKE THE COLONS LINE UP
