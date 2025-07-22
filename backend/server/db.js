const { Pool } = require('pg')

const pool = new Pool({
  user: 'postgres',
  host: 'host.docker.internal',
  database: 'web-tbot',
  password: 'indio14!',
  port: 5432,
})

module.exports = pool