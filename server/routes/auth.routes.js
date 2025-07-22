const express = require('express');
const router = express.Router();
const { login, verificarToken, logout, listUsers, createAdmin, resetAdminPassword } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/login', login);
router.get('/verify', authMiddleware.verificarToken, verificarToken);
router.post('/logout', logout);

// Rutas de utilidad para debugging
router.get('/list-users', listUsers);
router.post('/create-admin', createAdmin);
router.post('/reset-admin-password', resetAdminPassword);

module.exports = router;
