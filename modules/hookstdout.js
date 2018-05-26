const fs = require('fs')

module.exports = bot => {
  process.stdout.w = process.stdout.write
  let log = fs.createWriteStream('./node.log')
  process.stdout.write = process.stderr.write = out => {
    process.stdout.w(out)
    out = out.replace(/\u001B\[\d+m/g, '')
    log.write(out)
    if (bot.discord) {
      if (bot.discord.channels) {
        if (bot.discord.channels.dev) {
          if (out.length < 2000) {
            bot.discord.channels.dev.send(`\`\`\`bat\n${out}\`\`\``)
          } else {
            bot.discord.channels.dev.send(`\`\`\`bat\n${out.slice(0, 1962)}...\n[Log too big to Display]\`\`\``)
          }
        }
      }
    }
  }
}
