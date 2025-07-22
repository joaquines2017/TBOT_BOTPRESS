// Middleware para desarrollo que simula autenticación
const mockAuthMiddleware = (req, res, next) => {
  // En desarrollo, simular un usuario admin
  req.usuario = {
    id: 1,
    nombre: 'Admin',
    apellido: 'Sistema',
    usuario: 'admin',
    email: 'admin@sistema.com',
    rol: 'admin'
  }
  next()
}

const verificarTokenDev = (req, res, next) => {
  // En desarrollo, siempre usar mock para simplificar
  return mockAuthMiddleware(req, res, next)
}

const verificarAdminDev = (req, res, next) => {
  // En desarrollo, siempre permitir acceso admin
  if (req.usuario && req.usuario.rol === 'admin') {
    return next()
  }
  
  // Usar el middleware real para otros casos
  const authMiddleware = require('./auth.middleware')
  return authMiddleware.verificarAdmin(req, res, next)
}

module.exports = {
  verificarToken: verificarTokenDev,
  verificarAdmin: verificarAdminDev,
  verificarPropietarioOAdmin: mockAuthMiddleware
}
