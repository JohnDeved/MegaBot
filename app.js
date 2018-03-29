const config = require('./config')

require('./modules/discordbot').init(config.token)
