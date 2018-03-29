const chalk = require('chalk')
require('draftlog').into(console)

class Bot {
  constructor () {
    this.random = () => Math.ceil(Math.random() * 10)
    this.timeout = 1000
    this.mood = 'awake'
    this.work = 10
    this.frame = 0
    this.animate = {
      awake: {
        text: () => 'Im Awake!',
        face: () => this.random() === 5 ? '(>.<)' : '(o.o)'
      },
      sleepy: {
        text: () => 'Im not tired!',
        face: () => this.random() === 5 ? '(-_-)' : '(._.)'
      },
      sleeping: {
        text: () => this.frame !== 0 ? 'z'.repeat(this.frame) : '',
        face: () => this.random() === 5 ? '(-o-)' : '(-~-)'
      }
    }
    this.speak = () => `${this.animate[this.mood].face()} ${this.animate[this.mood].text()}`
    this.console = console.draft(chalk.bold.bgBlackBright('--Login--'), '...')
    this.refresh = () => {
      this.frame !== 3 ? this.frame++ : this.frame = 0
      this.work !== 0 && this.work--
      if (this.work === 0) {
        this.mood = 'sleeping'
      } else if (this.work < 5) {
        this.mood = 'sleepy'
      } else {
        this.mood = 'awake'
      }
      let text = this.speak()
      this.console(chalk.bold[this.mood !== 'sleeping' ? 'bgGreen' : 'bgYellow'](this.name), text)
    }
  }

  init (client) {
    this.client = client
    this.name = this.client.user.tag
    this.client.user.setActivity('Chat', { type: 'LISTENING' })
    setInterval(this.refresh, this.timeout)
  }
}

module.exports = new Bot()
