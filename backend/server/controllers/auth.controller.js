const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'clave-secreta-tbot'; // ⚠️ Usar variable de entorno en producción

exports.login = async (req, res) => {
  try {
    const { usuario, contraseña } = req.body;

    console.log('🔐 [LOGIN] Intento de login:', { usuario, contraseñaLength: contraseña?.length });

    if (!usuario || !contraseña) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Buscar usuario en la base de datos con fallback robusto
    let result;
    let tableUsed = '';
    
    // Primero intentar con la tabla usuarios (más completa)
    try {
      result = await db.query(
        'SELECT id, nombre, apellido, usuario, email, password, rol, activo FROM usuarios WHERE usuario = $1',
        [usuario]
      );
      tableUsed = 'usuarios';
      console.log('✅ [LOGIN] Consulta exitosa en tabla usuarios');
    } catch (dbError) {
      console.log('⚠️ [LOGIN] Error en tabla usuarios, intentando usuarios_dashboard_compatible:', dbError.message);
      
      // Fallback: intentar con la tabla usuarios_dashboard_compatible (sin columna rol)
      try {
        result = await db.query(
          'SELECT id, nombre, apellido, usuario, email, password, activo FROM usuarios_dashboard_compatible WHERE usuario = $1',
          [usuario]
        );
        tableUsed = 'usuarios_dashboard_compatible';
        console.log('✅ [LOGIN] Consulta exitosa en tabla usuarios_dashboard_compatible');
      } catch (fallbackError) {
        console.log('❌ [LOGIN] Error también en tabla usuarios_dashboard_compatible:', fallbackError.message);
        throw fallbackError;
      }
    }

    console.log('👤 [LOGIN] Usuario encontrado en tabla:', tableUsed, '- ID:', result.rows.length > 0 ? result.rows[0]?.id : 'No encontrado');

    if (result.rows.length === 0) {
      console.log('❌ [LOGIN] Usuario no encontrado:', usuario);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verificar si el usuario está activo
    if (!user.activo) {
      console.log('❌ [LOGIN] Usuario inactivo:', usuario);
      return res.status(401).json({ error: 'Usuario inactivo' });
    }

    console.log('🔑 [LOGIN] Verificando contraseña para usuario:', usuario);
    console.log('🔑 [LOGIN] Hash en BD:', user.password?.substring(0, 20) + '...');

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(contraseña, user.password);
    
    console.log('🔑 [LOGIN] Resultado verificación:', passwordMatch ? '✅ CORRECTO' : '❌ INCORRECTO');

    if (!passwordMatch) {
      console.log('❌ [LOGIN] Contraseña incorrecta para usuario:', usuario);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        usuario: user.usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol || 'user' // Valor por defecto si no existe la columna rol
      },
      JWT_SECRET,
      { expiresIn: '8h' } // Token expira en 8 horas
    );

    // Responder con el token y datos del usuario (sin contraseña)
    const userData = {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      usuario: user.usuario,
      email: user.email,
      rol: user.rol || 'user' // Valor por defecto si no existe la columna rol
    };

    res.json({
      token,
      user: userData
    });
  } catch (error) {
    console.error('❌ [LOGIN] Error detallado en login:', error);
    console.error('❌ [LOGIN] Error name:', error.name);
    console.error('❌ [LOGIN] Error message:', error.message);
    
    // Enviar error más específico
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ 
        error: 'Base de datos no disponible',
        details: 'No se puede conectar a PostgreSQL'
      });
    } else if (error.code === '42P01') {
      res.status(500).json({ 
        error: 'Tabla de usuarios no encontrada',
        details: 'La tabla de usuarios no existe'
      });
    } else if (error.code === '42703') {
      res.status(500).json({ 
        error: 'Error de esquema de base de datos',
        details: 'Columna no encontrada en la tabla'
      });
    } else if (error.code === '28P01') {
      res.status(500).json({ 
        error: 'Error de autenticación en base de datos',
        details: 'Credenciales de BD incorrectas'
      });
    } else {
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message,
        code: error.code
      });
    }
  }
};

exports.verificarToken = async (req, res) => {
  try {
    console.log('🔍 [VERIFY] Iniciando verificación de token')
    
    // Si llegamos aquí, el token es válido (middleware verificarToken ya lo validó)
    const user = req.usuario;
    console.log('👤 [VERIFY] Usuario del token:', { id: user.id, usuario: user.usuario })
    
    console.log('🗃️ [VERIFY] Consultando base de datos...')
    
    // Verificar que el usuario sigue activo en la base de datos
    // Usar try-catch para manejar diferentes esquemas de BD con prioridad en tabla usuarios
    let result;
    let tableUsed = '';
    
    // Primero intentar con la tabla usuarios (más completa y con observaciones)
    try {
      result = await db.query(
        'SELECT id, nombre, apellido, usuario, email, rol, activo FROM usuarios WHERE id = $1',
        [user.id]
      );
      tableUsed = 'usuarios';
      console.log('✅ [VERIFY] Consulta exitosa en tabla usuarios')
    } catch (dbError) {
      console.log('⚠️ [VERIFY] Error en tabla usuarios, intentando usuarios_dashboard_compatible:', dbError.message)
      
      // Fallback: intentar con la tabla usuarios_dashboard_compatible (sin observaciones)
      try {
        result = await db.query(
          'SELECT id, nombre, apellido, usuario, email, rol, activo FROM usuarios_dashboard_compatible WHERE id = $1',
          [user.id]
        );
        tableUsed = 'usuarios_dashboard_compatible';
        console.log('✅ [VERIFY] Consulta exitosa en tabla usuarios_dashboard_compatible')
      } catch (fallbackError) {
        console.log('❌ [VERIFY] Error también en tabla usuarios_dashboard_compatible:', fallbackError.message)
        throw fallbackError
      }
    }

    console.log('🗃️ [VERIFY] Resultado de consulta en tabla:', tableUsed, '- Filas encontradas:', result.rows.length)
    console.log('🗃️ [VERIFY] Detalles:', { 
      usuario: result.rows.length > 0 ? result.rows[0].usuario : 'N/A',
      activo: result.rows.length > 0 ? result.rows[0].activo : 'N/A'
    })

    if (result.rows.length === 0) {
      console.log('❌ [VERIFY] Usuario no encontrado en BD')
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (!result.rows[0].activo) {
      console.log('❌ [VERIFY] Usuario inactivo en BD')
      return res.status(401).json({ error: 'Usuario inactivo' });
    }

    console.log('✅ [VERIFY] Verificación exitosa')
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('❌ [VERIFY] Error detallado en verificación de token:', error);
    console.error('❌ [VERIFY] Error name:', error.name);
    console.error('❌ [VERIFY] Error message:', error.message);
    console.error('❌ [VERIFY] Error stack:', error.stack);
    
    // Enviar error más específico
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ 
        error: 'Base de datos no disponible',
        details: 'No se puede conectar a PostgreSQL'
      });
    } else if (error.code === '42P01') {
      res.status(500).json({ 
        error: 'Tabla de usuarios no encontrada',
        details: 'La tabla usuarios_dashboard_compatible no existe'
      });
    } else if (error.code === '28P01') {
      res.status(500).json({ 
        error: 'Error de autenticación en base de datos',
        details: 'Credenciales de BD incorrectas'
      });
    } else {
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message,
        code: error.code
      });
    }
  }
};

exports.logout = async (req, res) => {
  // En un sistema con JWT, el logout se maneja en el cliente
  // eliminando el token del almacenamiento local
  res.json({ message: 'Sesión cerrada exitosamente' });
};

// Función para listar usuarios existentes (solo para debug)
exports.listUsers = async (req, res) => {
  try {
    console.log('📋 [LIST_USERS] Obteniendo lista de usuarios...');
    
    let result;
    let tableUsed = '';
    
    // Intentar primero con tabla usuarios
    try {
      result = await db.query('SELECT id, nombre, apellido, usuario, email, activo FROM usuarios ORDER BY id');
      tableUsed = 'usuarios';
    } catch (error) {
      // Fallback a usuarios_dashboard_compatible
      result = await db.query('SELECT id, nombre, apellido, usuario, email, activo FROM usuarios_dashboard_compatible ORDER BY id');
      tableUsed = 'usuarios_dashboard_compatible';
    }
    
    console.log(`📋 [LIST_USERS] Encontrados ${result.rows.length} usuarios en tabla: ${tableUsed}`);
    
    res.json({
      users: result.rows,
      table: tableUsed,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ [LIST_USERS] Error:', error);
    res.status(500).json({ error: 'Error al obtener usuarios', details: error.message });
  }
};

// Función para crear usuario administrativo
exports.createAdmin = async (req, res) => {
  try {
    console.log('👤 [CREATE_ADMIN] Creando usuario administrativo...');
    
    const adminData = {
      nombre: 'Administrador',
      apellido: 'Sistema',
      usuario: 'admin@web-tbot.com',
      email: 'admin@web-tbot.com',
      password: 'admin123', // Contraseña temporal
      activo: true
    };
    
    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
    
    let result;
    let tableUsed = '';
    
    // Intentar insertar en tabla usuarios
    try {
      result = await db.query(
        'INSERT INTO usuarios (nombre, apellido, usuario, email, password, rol, activo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [adminData.nombre, adminData.apellido, adminData.usuario, adminData.email, hashedPassword, 'admin', adminData.activo]
      );
      tableUsed = 'usuarios';
    } catch (error) {
      // Fallback a usuarios_dashboard_compatible
      result = await db.query(
        'INSERT INTO usuarios_dashboard_compatible (nombre, apellido, usuario, email, password, activo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [adminData.nombre, adminData.apellido, adminData.usuario, adminData.email, hashedPassword, adminData.activo]
      );
      tableUsed = 'usuarios_dashboard_compatible';
    }
    
    console.log(`✅ [CREATE_ADMIN] Usuario administrativo creado con ID: ${result.rows[0].id} en tabla: ${tableUsed}`);
    
    res.json({
      message: 'Usuario administrativo creado exitosamente',
      user: {
        id: result.rows[0].id,
        usuario: adminData.usuario,
        password: adminData.password, // Solo para mostrar la contraseña temporal
        table: tableUsed
      }
    });
    
  } catch (error) {
    console.error('❌ [CREATE_ADMIN] Error:', error);
    
    if (error.code === '23505') { // Duplicate key
      res.status(400).json({ error: 'El usuario administrativo ya existe' });
    } else {
      res.status(500).json({ error: 'Error al crear usuario administrativo', details: error.message });
    }
  }
};

// Función para resetear contraseña del admin
exports.resetAdminPassword = async (req, res) => {
  try {
    console.log('🔑 [RESET_ADMIN] Reseteando contraseña del administrador...');
    
    const newPassword = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Buscar usuario admin por ID o usuario
    let result = await db.query(
      'UPDATE usuarios SET password = $1 WHERE id = 1 OR usuario = $2 OR usuario = $3 RETURNING id, usuario, email',
      [hashedPassword, 'admin', 'admin@web-tbot.com']
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario administrador no encontrado' });
    }
    
    console.log(`✅ [RESET_ADMIN] Contraseña reseteada para usuario ID: ${result.rows[0].id}`);
    
    res.json({
      message: 'Contraseña del administrador reseteada exitosamente',
      user: {
        id: result.rows[0].id,
        usuario: result.rows[0].usuario,
        email: result.rows[0].email,
        newPassword: newPassword
      }
    });
    
  } catch (error) {
    console.error('❌ [RESET_ADMIN] Error:', error);
    res.status(500).json({ error: 'Error al resetear contraseña', details: error.message });
  }
};
