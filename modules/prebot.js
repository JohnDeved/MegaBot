const irc = require('irc')
const chalk = require('chalk')

class PreBot {
  constructor () {
    this.handleIrc = (from, to, msg) => {
      msg = msg.replace(/[\x02\x1F\x0F\x16]|\x03(\d\d?(,\d\d?)?)?/g, '')
      if (/^\(NUKE\)/.test(msg)) { return console.log(msg) }
      if (/^\(UNNUKE\)/.test(msg)) { return console.log(msg) }
      if (/^\(PRE\) \(([^)]+)\) (.+)-(.+)$/.test(msg)) {
        this.discord.fnc.preRelease(msg)
      } else {
        console.log(msg)
      }
    }
  }

  init (discord) {
    this.discord = discord
    this.config = this.discord.config
    this.client = new irc.Client(this.config.irc.ip, this.config.irc.userName, this.config.irc)
    this.client.addListener('registered', msg => console.log('Connected to', chalk.green(msg.server), 'as', chalk.green(this.client.nick)))
    this.client.addListener('error', msg => console.log(chalk.red('irc error: '), msg))
    this.client.addListener('message', this.handleIrc)

    return this
  }
}

module.exports = new PreBot()
