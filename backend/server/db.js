const { Pool } = require('pg')

const pool = new Pool({
  user: 'admin',
  host: 'postgres',
  database: 'web-tbot',
  password: 'Kdmf8394',
  port: 5432,
})

module.exports = pool