const nodeCleanup = require('node-cleanup')

module.exports = bot => {
  nodeCleanup((exitCode, signal) => {
    bot.irc.client.disconnect('Ill be back.')
    process.kill(process.pid)
  })
}
