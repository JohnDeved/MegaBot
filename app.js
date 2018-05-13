const config = require('./config')
const discord = require('./modules/discordbot').init(config)

// require('./modules/bot').init(discord)
require('./modules/prebot').init(discord)
require('./modules/rssbot').init(discord)
