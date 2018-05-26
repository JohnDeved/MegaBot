const spawn = require('child_process').spawn
const r = require('rethinkdb')

module.exports = bot => {
  bot.r = r
  const rethinkdb = spawn('./db/rethinkdb', ['-d', './db/data'])

  rethinkdb.stdout.on('data', data => console.log(data.toString().trim()))
  rethinkdb.stderr.on('data', data => console.error(data.toString().trim()))

  r.connect((err, tcp) => {
    if (err) { return console.error(err) }
    bot.db = tcp
    // console.log(tcp)
    console.info('Connected to DB', tcp.db, `${tcp.host}:${tcp.port}`)

    console.log(bot.config.db)
    bot.config.db.forEach(db => {
      r.dbCreate(db.name).run(bot.db).catch(err => {
        console.error(err.msg)
      }).then(() => {
        db.tables.forEach(table => {
          r.db(db.name).tableCreate(table).run(bot.db).catch(err => {
            console.error(err.msg)
          })
        })
      })
    })
  })
}
