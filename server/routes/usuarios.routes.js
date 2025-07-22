const express = require('express')
const router = express.Router()
const usuariosController = require('../controllers/usuarios.controller')
const authMiddleware = require('../middlewares/auth.dev.middleware') // Usar middleware de desarrollo

// Rutas para gestión de usuarios (solo admin)
router.get('/', authMiddleware.verificarToken, authMiddleware.verificarAdmin, usuariosController.getUsuarios)
router.get('/inactivos', authMiddleware.verificarToken, authMiddleware.verificarAdmin, usuariosController.getUsuariosInactivos)
router.post('/', authMiddleware.verificarToken, authMiddleware.verificarAdmin, usuariosController.crearUsuario)
router.put('/:id', authMiddleware.verificarToken, authMiddleware.verificarAdmin, usuariosController.editarUsuario)
router.put('/:id/desactivar', authMiddleware.verificarToken, authMiddleware.verificarAdmin, usuariosController.desactivarUsuario)
router.put('/:id/reactivar', authMiddleware.verificarToken, authMiddleware.verificarAdmin, usuariosController.reactivarUsuario)
router.get('/:id/auditoria', authMiddleware.verificarToken, authMiddleware.verificarAdmin, usuariosController.getAuditoriaUsuario)

// Rutas para perfil de usuario (usuario propietario o admin)
router.get('/:id/perfil', authMiddleware.verificarToken, authMiddleware.verificarPropietarioOAdmin, usuariosController.obtenerPerfil)
router.put('/:id/perfil', authMiddleware.verificarToken, authMiddleware.verificarPropietarioOAdmin, usuariosController.editarPerfil)

module.exports = router