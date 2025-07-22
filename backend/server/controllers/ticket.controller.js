// controllers/ticket.controller.js

const db = require('../db');
const redmineService = require('../services/redmine.service')

exports.getAllTickets = async (req, res) => {
  try {
    const query = `
      SELECT
        issues.id,
        trackers.name AS tipo,
        enumerations.name AS prioridad,
        issue_statuses.name AS estado,
        users.firstname || ' ' || users.lastname AS asignado_a,
        issues.subject AS asunto,
        custom_values.value AS oficina,
        issues.created_on AS creado
      FROM issues
      LEFT JOIN trackers ON issues.tracker_id = trackers.id
      LEFT JOIN enumerations ON issues.priority_id = enumerations.id
      LEFT JOIN issue_statuses ON issues.status_id = issue_statuses.id
      LEFT JOIN users ON issues.assigned_to_id = users.id
      LEFT JOIN custom_values ON issues.id = custom_values.customized_id
        AND custom_values.custom_field_id = (
          SELECT id FROM custom_fields WHERE name ILIKE 'oficina' LIMIT 1
        )
      WHERE issues.project_id = 33
      ORDER BY issues.created_on DESC
      LIMIT 100;
    `;

    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener tickets:', error);
    res.status(500).json({ error: 'Error al obtener los tickets' });
  }
};

exports.kpiPorEstado = async (req, res) => {
  try {
    const tickets = await redmineService.getTicketsRaw()
    const kpi = {}
    tickets.forEach(ticket => {
      const estado = ticket.status?.name || 'Desconocido'
      kpi[estado] = (kpi[estado] || 0) + 1
    })
    const result = Object.entries(kpi).map(([estado, cantidad]) => ({ estado, cantidad }))
    res.json(result)
  } catch (error) {
    console.error('❌ Error al obtener KPI por estado:', error)
    res.status(500).json({ error: 'Error al obtener KPI por estado' })
  }
};

exports.kpiPorPrioridad = async (req, res) => {
  try {
    const tickets = await redmineService.getTicketsRaw()
    const kpi = {}
    tickets.forEach(ticket => {
      const prioridad = ticket.priority?.name || 'Sin Prioridad'
      kpi[prioridad] = (kpi[prioridad] || 0) + 1
    })
    const result = Object.entries(kpi).map(([prioridad, cantidad]) => ({ prioridad, cantidad }))
    res.json(result)
  } catch (error) {
    console.error('❌ Error al obtener KPI por prioridad:', error)
    res.status(500).json({ error: 'Error al obtener KPI por prioridad' })
  }
};

exports.kpiPorTecnico = async (req, res) => {
  try {
    const tickets = await redmineService.getTicketsRaw()
    const result = []
    tickets.forEach(ticket => {
      const tecnico = ticket.assigned_to?.name || 'Sin asignar'
      const fecha = ticket.created_on?.slice(0, 10) // "YYYY-MM-DD"
      result.push({ tecnico, fecha, cantidad: 1 })
    })
    // Agrupa por técnico y fecha
    const agrupado = {}
    result.forEach(({ tecnico, fecha, cantidad }) => {
      const key = tecnico + '|' + fecha
      if (!agrupado[key]) {
        agrupado[key] = { tecnico, fecha, cantidad: 0 }
      }
      agrupado[key].cantidad += cantidad
    })
    res.json(Object.values(agrupado))
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener KPI por técnico' })
  }
};

exports.kpiPorOficina = async (req, res) => {
  try {
    const tickets = await redmineService.getTicketsRaw()
    const kpi = {}
    tickets.forEach(ticket => {
      // Puede ser null si no tiene oficina
      const oficina = ticket.custom_fields?.find(f => f.name?.toLowerCase() === 'oficina')?.value || 'Sin oficina'
      kpi[oficina] = (kpi[oficina] || 0) + 1
    })
    const result = Object.entries(kpi).map(([oficina, cantidad]) => ({ oficina, cantidad }))
    res.json(result)
  } catch (error) {
    console.error('❌ Error al obtener KPI por oficina:', error)
    res.status(500).json({ error: 'Error al obtener KPI por oficina' })
  }
};

exports.kpiPorTipo = async (req, res) => {
  // Agrupa y cuenta tickets por tipo de solicitud
};

exports.kpiPorCanal = async (req, res) => {
  // Agrupa y cuenta tickets por canal de ingreso
};

exports.kpiPorHora = async (req, res) => {
  // Agrupa y cuenta tickets por hora de creación
};

exports.kpiTendencia = async (req, res) => {
  // Devuelve la cantidad de tickets abiertos/cerrados por día/semana/mes
};

exports.kpiTendenciaMensual = async (req, res) => {
  try {
    const tickets = await redmineService.getTicketsRaw()
    const kpi = {}
    tickets.forEach(ticket => {
      const fecha = ticket.created_on?.slice(0, 7) // "YYYY-MM"
      if (fecha) {
        const [anio, mes] = fecha.split('-')
        kpi[anio] = kpi[anio] || {}
        kpi[anio][mes] = (kpi[anio][mes] || 0) + 1
      }
    })
    // Generar array [{anio, mes, cantidad}]
    const result = []
    Object.entries(kpi).forEach(([anio, meses]) => {
      Object.entries(meses).forEach(([mes, cantidad]) => {
        result.push({ anio, mes, cantidad })
      })
    })
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tendencia mensual' })
  }
}

exports.kpiCriticos = async (req, res) => {
  // Devuelve la cantidad de tickets críticos/urgentes abiertos
};

exports.kpiRankingTecnicos = async (req, res) => {
  // Devuelve el ranking de técnicos por tickets resueltos
};

exports.kpiTecnicoMensual = async (req, res) => {
  try {
    const tickets = await redmineService.getTicketsRaw()
    const kpi = {}
    tickets.forEach(ticket => {
      const fecha = ticket.created_on?.slice(0, 7) // "YYYY-MM"
      const tecnico = ticket.assigned_to?.name || 'Sin asignar'
      if (fecha) {
        kpi[tecnico] = kpi[tecnico] || {}
        kpi[tecnico][fecha] = (kpi[tecnico][fecha] || 0) + 1
      }
    })
    // [{ tecnico, mes, cantidad }]
    const result = []
    Object.entries(kpi).forEach(([tecnico, meses]) => {
      Object.entries(meses).forEach(([mes, cantidad]) => {
        result.push({ tecnico, mes, cantidad })
      })
    })
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener evolución mensual por técnico' })
  }
};

exports.kpiStockPorDia = async (req, res) => {
  try {
    const fecha = req.query.fecha // formato YYYY-MM-DD
    
    // Obtener tickets desde Redmine en lugar de PostgreSQL
    const redmineService = require('../services/redmine.service')
    const tickets = await redmineService.getTicketsRaw()
    
    // Filtrar tickets por fecha
    const ticketsFecha = tickets.filter(ticket => {
      const fechaCreacion = ticket.created_on.split('T')[0]
      return fechaCreacion <= fecha
    })
    
    // Calcular estadísticas
    const abiertos = ticketsFecha.filter(ticket => 
      ticket.status?.name?.toLowerCase().includes('nueva') || 
      ticket.status?.name?.toLowerCase().includes('curso') ||
      ticket.status?.name?.toLowerCase().includes('asignada')
    ).length
    
    const cerrados = ticketsFecha.filter(ticket => 
      ticket.status?.name?.toLowerCase().includes('cerrada') ||
      ticket.status?.name?.toLowerCase().includes('resuelta')
    ).length
    
    const criticosAbiertos = ticketsFecha.filter(ticket => {
      const esCritico = ticket.priority?.name === 'Urgente' || ticket.priority?.name === 'Inmediata'
      const estaAbierto = !ticket.status?.name?.toLowerCase().includes('cerrada') && 
                         !ticket.status?.name?.toLowerCase().includes('resuelta')
      return esCritico && estaAbierto
    }).length
    
    res.json({
      fecha,
      abiertos,
      cerrados,
      criticosAbiertos,
    })
  } catch (err) {
    console.error('Error en kpiStockPorDia:', err)
    res.status(500).json({ error: err.message })
  }
}
