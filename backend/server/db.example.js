const { Pool } = require('pg')

const pool = new Pool({
  user: 'postgres',          // Usuario de PostgreSQL
  host: 'localhost',         // Host de la base de datos
  database: 'web-tbot',      // Nombre de la base de datos
  password: 'tu_password',   // ⚠️ CAMBIAR: Tu contraseña de PostgreSQL
  port: 5432,               // Puerto de PostgreSQL
})

module.exports = pool
