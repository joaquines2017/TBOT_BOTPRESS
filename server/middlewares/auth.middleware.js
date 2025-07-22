const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'clave-secreta-tbot' // ⚠️ En producción usar variables de entorno

exports.verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.usuario = decoded // lo usamos luego en control de rol
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' })
  }
}

exports.verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' })
  }
  next()
}

// Middleware para verificar si el usuario puede editar el recurso
exports.verificarPropietarioOAdmin = (req, res, next) => {
  const userIdFromParams = parseInt(req.params.id)
  const currentUserId = req.usuario.id
  const isAdmin = req.usuario.rol === 'admin'
  
  if (!isAdmin && userIdFromParams !== currentUserId) {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' })
  }
  
  next()
}
