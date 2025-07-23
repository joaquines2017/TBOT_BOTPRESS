//conexion DB
const db = require('./db');

db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error al conectar con PostgreSQL:', err);
  } else {
    console.log('✅ Conexión a PostgreSQL exitosa:', res.rows[0]);
  }
});
//conecion DB

const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3003;

// Función para escribir logs a archivo
const writeLog = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync('server.log', logMessage);
};

// Middleware
app.use(cors({
  origin: ['http://localhost:3002', 'http://backend:3003', 'https://incidentes.mpftucuman.gob.ar:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Servir archivos estáticos (para herramientas de admin)
app.use('/admin-tools', express.static('.'));

// Ruta de salud básica
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor funcionando correctamente', 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Ruta de test para verificar conectividad
app.get('/api/test-connection', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Conexión exitosa al backend', 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Rutas
const testRoutes = require('./routes/test.routes');
const ticketRoutes = require('./routes/ticket.routes');
const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const redmineRoutes = require('./routes/redmine.routes');
const ticketsRoutes = require('./routes/tickets.controller')

app.use('/api/test', testRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/auth', authRoutes);

// Middleware de logging para usuarios
app.use('/api/usuarios', (req, res, next) => {
  console.log('📥 Petición recibida a /api/usuarios:', req.method, req.url);
  writeLog(`📥 Petición recibida a /api/usuarios: ${req.method} ${req.url}`);
  next();
});
app.use('/api/usuarios', usuariosRoutes);

app.use('/api/redmine', (req, res, next) => {
  console.log('📥 Petición recibida a /api/redmine:', req.method, req.url);
  writeLog(`📥 Petición recibida a /api/redmine: ${req.method} ${req.url}`);
  next();
});
app.use('/api/redmine', redmineRoutes);
app.use('/api/redmine', ticketRoutes)

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://tbot_backend:${PORT}`);
});
