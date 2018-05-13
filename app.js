const config = require('./config')
const discord = require('./modules/discordbot').init(config.token)

require('./modules/prebot').init(discord)
require('./modules/rssbot').init(discord)
