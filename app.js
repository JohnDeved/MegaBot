const config = require('./config')

const discord = require('./modules/discordbot').init(config.token)
const irc = require('./modules/prebot').init(discord)
