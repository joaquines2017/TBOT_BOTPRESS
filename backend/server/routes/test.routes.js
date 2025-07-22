const express = require('express');
const router = express.Router();
const { getTestMessage } = require('../controllers/test.controllers');
const ticketController = require('../controllers/ticket.controller')

// Ruta de prueba
router.get('/test', getTestMessage);
router.get('/kpi/por-oficina', ticketController.kpiPorOficina);

module.exports = router;
