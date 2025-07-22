const axios = require('axios')

const API_URL = 'https://incidentes.mpftucuman.gob.ar'
const API_KEY = 'caa5569e969a7a7dd08f2dd1268579aceb93b3f4'

const getTickets = async (req, res) => {
  try {
    console.log('🔍 Query parameters recibidos:', req.query)
    
    const {
      id,
      estado,
      prioridad,
      asignado,
      empleado,
      oficina,
      nroContacto,
      fechaInicio,
      fechaFin,
      palabraClave,
      limit = 100,
      offset = 0
    } = req.query

    // Construir parámetros para la consulta de Redmine
    let params = `project_id=33&limit=${limit}&offset=${offset}`
    
    // Aplicar filtros que soporta la API de Redmine directamente
    if (id) {
      params += `&issue_id=${id}`
      console.log(`📌 Filtro por ID: ${id}`)
    }
    
    if (estado) {
      const statusId = getStatusId(estado)
      if (statusId) {
        params += `&status_id=${statusId}`
        console.log(`📌 Filtro por estado: ${estado} (ID: ${statusId})`)
      }
    }
    
    if (prioridad) {
      const priorityId = getPriorityId(prioridad)
      if (priorityId) {
        params += `&priority_id=${priorityId}`
        console.log(`📌 Filtro por prioridad: ${prioridad} (ID: ${priorityId})`)
      }
    }
    
    if (asignado) {
      // Si es un número, es un ID, si no, lo buscamos localmente
      if (!isNaN(asignado)) {
        params += `&assigned_to_id=${asignado}`
        console.log(`📌 Filtro por asignado ID: ${asignado}`)
      } else {
        console.log(`📌 Filtro por asignado nombre: ${asignado} (se aplicará localmente)`)
      }
    }
    
    if (fechaInicio) {
      // Redmine espera formato YYYY-MM-DD o YYYY-MM-DD%2000:00:00
      const fechaInicioFormatted = fechaInicio.includes('T') ? fechaInicio.split('T')[0] : fechaInicio
      params += `&created_on>=${fechaInicioFormatted}%2000:00:00`
      console.log(`📌 Filtro fecha inicio: ${fechaInicio} -> ${fechaInicioFormatted}%2000:00:00`)
    }
    
    if (fechaFin) {
      // Para fecha fin, agregar 23:59:59 para incluir todo el día
      const fechaFinFormatted = fechaFin.includes('T') ? fechaFin.split('T')[0] : fechaFin
      params += `&created_on<=${fechaFinFormatted}%2023:59:59`
      console.log(`📌 Filtro fecha fin: ${fechaFin} -> ${fechaFinFormatted}%2023:59:59`)
    }
    
    if (palabraClave) {
      params += `&subject=~${encodeURIComponent(palabraClave)}`
      console.log(`🔍 Filtro palabra clave: ${palabraClave}`)
    }

    console.log('🌐 URL completa Redmine:', `${API_URL}/issues.json?${params}`)

    // Hacer la consulta a Redmine
    const response = await axios.get(`${API_URL}/issues.json?${params}`, {
      headers: { 'X-Redmine-API-Key': API_KEY },
    })

    let tickets = response.data.issues || []
    console.log(`📥 Tickets obtenidos de Redmine: ${tickets.length}`)

    // Aplicar filtros adicionales que no soporta la API (filtros locales)
    if (asignado && isNaN(asignado)) {
      tickets = tickets.filter(ticket => 
        ticket.assigned_to?.name?.toLowerCase().includes(asignado.toLowerCase())
      )
      console.log(`👤 Filtro por asignado nombre "${asignado}": ${tickets.length} tickets`)
    }

    if (empleado) {
      tickets = tickets.filter(ticket => 
        ticket.custom_fields?.some(field => 
          field.name === 'Empleado' && 
          field.value?.toLowerCase().includes(empleado.toLowerCase())
        )
      )
      console.log(`👤 Filtro por empleado "${empleado}": ${tickets.length} tickets`)
    }

    if (oficina) {
      tickets = tickets.filter(ticket => 
        ticket.custom_fields?.some(field => 
          field.name === 'Oficina' && 
          field.value?.toLowerCase().includes(oficina.toLowerCase())
        )
      )
      console.log(`🏢 Filtro por oficina "${oficina}": ${tickets.length} tickets`)
    }

    if (nroContacto) {
      tickets = tickets.filter(ticket => 
        ticket.custom_fields?.some(field => 
          field.name === 'Nro de Contacto' && 
          field.value?.includes(nroContacto)
        )
      )
      console.log(`📞 Filtro por contacto "${nroContacto}": ${tickets.length} tickets`)
    }

    // FILTRO LOCAL DE FECHAS - IMPORTANTE: Aplicar SIEMPRE si hay fechas
    if (fechaInicio || fechaFin) {
      const ticketsAntes = tickets.length
      console.log(`📅 Aplicando filtro LOCAL de fechas. Tickets antes: ${ticketsAntes}`)
      
      tickets = tickets.filter(ticket => {
        const fechaCreacion = new Date(ticket.created_on)
        
        // Debug: mostrar fecha del ticket
        const fechaTicketStr = fechaCreacion.toISOString().split('T')[0]
        
        let cumpleFecha = true
        
        if (fechaInicio) {
          const fechaInicioDate = new Date(fechaInicio + 'T00:00:00')
          if (fechaCreacion < fechaInicioDate) {
            cumpleFecha = false
            console.log(`❌ Ticket #${ticket.id} (${fechaTicketStr}) antes de ${fechaInicio}`)
          }
        }
        
        if (fechaFin && cumpleFecha) {
          const fechaFinDate = new Date(fechaFin + 'T23:59:59')
          if (fechaCreacion > fechaFinDate) {
            cumpleFecha = false
            console.log(`❌ Ticket #${ticket.id} (${fechaTicketStr}) después de ${fechaFin}`)
          }
        }
        
        if (cumpleFecha) {
          console.log(`✅ Ticket #${ticket.id} (${fechaTicketStr}) INCLUIDO`)
        }
        
        return cumpleFecha
      })
      
      console.log(`📅 Filtro LOCAL de fechas aplicado: ${ticketsAntes} -> ${tickets.length} tickets`)
      
      if (fechaInicio && fechaFin) {
        console.log(`📅 Rango aplicado: ${fechaInicio} a ${fechaFin}`)
      } else if (fechaInicio) {
        console.log(`📅 Desde: ${fechaInicio}`)
      } else if (fechaFin) {
        console.log(`📅 Hasta: ${fechaFin}`)
      }
    }

    console.log(`✅ Total tickets finales después de todos los filtros: ${tickets.length}`)

    // Devolver respuesta en el formato esperado por el frontend
    res.json({
      issues: tickets,
      total_count: response.data.total_count || tickets.length,
      offset: parseInt(offset),
      limit: parseInt(limit)
    })

  } catch (error) {
    console.error('❌ Error al obtener tickets de Redmine:', error.message)
    if (error.response) {
      console.error('❌ Respuesta de Redmine:', error.response.status, error.response.data)
    }
    res.status(500).json({ error: 'No se pudieron obtener los tickets.' })
  }
}

// Funciones auxiliares para mapear nombres a IDs
const getStatusId = (statusName) => {
  const statusMap = {
    'Nueva': 1,
    'nueva': 1,
    'En curso': 2,
    'en curso': 2,
    'En Curso': 2,
    'Resuelta': 3,
    'resuelta': 3,
    'Rechazada': 4,
    'rechazada': 4,
    'Cerrada': 5,
    'cerrada': 5
  }
  
  const id = statusMap[statusName]
  console.log(`🗂️ Mapeo estado "${statusName}" -> ID: ${id}`)
  return id || null
}

const getPriorityId = (priorityName) => {
  const priorityMap = {
    'Baja': 1,
    'baja': 1,
    'Normal': 2,
    'normal': 2,
    'Alta': 3,
    'alta': 3,
    'Urgente': 4,
    'urgente': 4,
    'Inmediata': 5,
    'inmediata': 5
  }
  
  const id = priorityMap[priorityName]
  console.log(`⚡ Mapeo prioridad "${priorityName}" -> ID: ${id}`)
  return id || null
}

// Crear ticket
const createTicket = async (req, res) => {
  try {
    const { subject, description, assigned_to_id, priority_id } = req.body

    const ticketData = {
      issue: {
        project_id: 33,
        subject: subject,
        description: description || '',
        assigned_to_id: assigned_to_id || null,
        priority_id: priority_id || 2,
        status_id: 1
      }
    }

    const response = await axios.post(`${API_URL}/issues.json`, ticketData, {
      headers: {
        'X-Redmine-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    })

    res.status(201).json(response.data)
  } catch (error) {
    console.error('Error al crear ticket:', error.message)
    res.status(500).json({ error: 'No se pudo crear el ticket.' })
  }
}

// Actualizar ticket (estado, prioridad, asignado, etc.)
const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status_id, priority_id, assigned_to_id, notes } = req.body

    console.log(`📝 Actualizando ticket #${id}:`, req.body)

    const updateData = {
      issue: {}
    }

    // Solo incluir campos que se están actualizando
    if (status_id) {
      updateData.issue.status_id = parseInt(status_id)
      console.log(`   Estado -> ${status_id}`)
    }
    
    if (priority_id) {
      updateData.issue.priority_id = parseInt(priority_id)
      console.log(`   Prioridad -> ${priority_id}`)
    }
    
    if (assigned_to_id) {
      if (assigned_to_id === '' || assigned_to_id === 'null') {
        updateData.issue.assigned_to_id = null // Desasignar
        console.log(`   Asignado -> Sin asignar`)
      } else {
        updateData.issue.assigned_to_id = parseInt(assigned_to_id)
        console.log(`   Asignado -> ${assigned_to_id}`)
      }
    }
    
    if (notes) {
      updateData.issue.notes = notes
    }

    console.log(`📡 Enviando a Redmine:`, JSON.stringify(updateData, null, 2))

    const response = await axios.put(`${API_URL}/issues/${id}.json`, updateData, {
      headers: {
        'X-Redmine-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    })

    console.log(`✅ Ticket #${id} actualizado exitosamente`)
    res.json({ message: 'Ticket actualizado exitosamente', data: response.data })
  } catch (error) {
    console.error(`❌ Error al actualizar ticket #${req.params.id}:`, error.message)
    if (error.response) {
      console.error('   Respuesta de error:', error.response.data)
    }
    res.status(500).json({ error: 'No se pudo actualizar el ticket.' })
  }
}

// Obtener miembros del proyecto
const getMiembros = async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/projects/33/memberships.json`, {
      headers: { 'X-Redmine-API-Key': API_KEY },
    })
    // Extraer solo el array de memberships
    const miembros = response.data.memberships || []
    res.json(miembros)
  } catch (error) {
    console.error('Error al obtener miembros:', error.message)
    res.status(500).json([]) // Devolver array vacío en caso de error
  }
}

// Obtener prioridades
const getPrioridades = async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/enumerations/issue_priorities.json`, {
      headers: { 'X-Redmine-API-Key': API_KEY },
    })
    // Extraer solo el array de prioridades
    const prioridades = response.data.issue_priorities || []
    res.json(prioridades)
  } catch (error) {
    console.error('Error al obtener prioridades:', error.message)
    res.status(500).json([]) // Devolver array vacío en caso de error
  }
}

// Función para obtener los estados reales de Redmine
const getRedmineStatuses = async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/issue_statuses.json`, {
      headers: { 'X-Redmine-API-Key': API_KEY },
    })
    res.json(response.data.issue_statuses)
  } catch (error) {
    console.error('❌ Error al obtener estados de Redmine:', error.message)
    res.status(500).json({ error: 'No se pudieron obtener los estados.' })
  }
}

// Función para obtener las prioridades reales de Redmine
const getRedminePriorities = async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/enumerations/issue_priorities.json`, {
      headers: { 'X-Redmine-API-Key': API_KEY },
    })
    res.json(response.data.issue_priorities)
  } catch (error) {
    console.error('❌ Error al obtener prioridades de Redmine:', error.message)
    res.status(500).json({ error: 'No se pudieron obtener las prioridades.' })
  }
}

module.exports = {
  getTickets,
  createTicket,
  updateTicketStatus,
  getMiembros,
  getPrioridades,
  getRedmineStatuses,
  getRedminePriorities
}