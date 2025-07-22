const express = require('express')
const router = express.Router()
const redmineService = require('../services/redmine.service')

router.get('/tickets', redmineService.getTickets)
router.post('/tickets', redmineService.createTicket)
router.put('/tickets/:id', redmineService.updateTicketStatus)
router.get('/prioridades', redmineService.getPrioridades)
router.get('/miembros', redmineService.getMiembros)
router.get('/estados', redmineService.getRedmineStatuses)
router.get('/prioridades-redmine', redmineService.getRedminePriorities)

module.exports = router