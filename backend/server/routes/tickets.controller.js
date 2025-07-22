const express = require('express')
const router = express.Router()
const axios = require('axios')

// Ruta para obtener tickets con filtros opcionales de fecha
router.get('/tickets', async (req, res) => {
  try {
    const { from, to } = req.query

    // Llamada a Redmine o fuente de datos simulada
    const response = await axios.get('http://localhost:3001/api/redmine/tickets')
    const allTickets = response.data

    if (!from || !to) {
      return res.json(allTickets)
    }

    const fromDate = new Date(from)
    const toDate = new Date(to)

    const filtered = allTickets.filter(ticket => {
      const created = new Date(ticket.created_on)
      return created >= fromDate && created <= toDate
    })

    res.json(filtered)
  } catch (error) {
    console.error('Error al obtener tickets filtrados:', error)
    res.status(500).json({ error: 'Error al obtener tickets filtrados' })
  }
})

module.exports = router
