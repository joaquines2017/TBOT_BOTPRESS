// routes/ticket.routes.js

const express = require('express')
const router = express.Router()
const ticketController = require('../controllers/ticket.controller')

router.get('/tickets', ticketController.getAllTickets)
router.get('/kpi/por-prioridad', ticketController.kpiPorPrioridad)
router.get('/kpi/por-tecnico', ticketController.kpiPorTecnico)
router.get('/kpi/por-oficina', ticketController.kpiPorOficina)
router.get('/kpi/por-tipo', ticketController.kpiPorTipo)
router.get('/kpi/por-canal', ticketController.kpiPorCanal)
router.get('/kpi/por-hora', ticketController.kpiPorHora)
router.get('/kpi/tendencia', ticketController.kpiTendencia)
router.get('/kpi/tendencia-mensual', ticketController.kpiTendenciaMensual)
router.get('/kpi/criticos', ticketController.kpiCriticos)
router.get('/kpi/ranking-tecnicos', ticketController.kpiRankingTecnicos)
router.get('/kpi/por-estado', ticketController.kpiPorEstado)
router.get('/kpi/tecnico-mensual', ticketController.kpiTecnicoMensual)
router.get('/kpi/stock-por-dia', ticketController.kpiStockPorDia)

module.exports = router
