const irc = require('irc')
const chalk = require('chalk')

class PreBot {
  constructor () {
    this.client = new irc.Client('irc.opentrackers.org', 'Nodeone', {channels: ['#pre']})
    this.handleIrc = (from, to, msg) => {
      msg = msg.replace(/[\x02\x1F\x0F\x16]|\x03(\d\d?(,\d\d?)?)?/g, '')
      if (/^\[NUKE\]/.test(msg)) { return console.log(msg) }
      if (/^\[UNNUKE\]/.test(msg)) { return console.log(msg) }
      if (/^\[PRE\] \[([^\]]+)\] (.+)-(.+)$/.test(msg)) {
        this.discord.fnc.release(msg)
      } else {
        console.log(msg)
      }
    }
  }

  init (discord) {
    this.discord = discord
    this.client.addListener('registered', msg => console.log('Connected to', chalk.green(msg.server)))
    this.client.addListener('error', msg => console.log('irc error: ', chalk.red(msg)))
    this.client.addListener('message', this.handleIrc)

    return this
  }
}

module.exports = new PreBot()
