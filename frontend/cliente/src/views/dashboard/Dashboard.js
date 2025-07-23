import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCol,
  CRow,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CButton,
  CBadge,
  CAlert,
  CCardFooter,
  CProgress,
  CProgressBar,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CContainer,
  CButtonGroup,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import axios from 'axios'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ComposedChart,
  CartesianGrid,
  ScatterChart,
  Scatter,
} from 'recharts'

const Dashboard = () => {
  console.log('🚀 Dashboard component inicializado')

  // Hook de navegación
  const navigate = useNavigate()

  // Estados principales
  const [tickets, setTickets] = useState([])
  const [statistics, setStatistics] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshInterval, setRefreshInterval] = useState(5) // minutos

  // Estados para gráficos
  const [kpiEstado, setKpiEstado] = useState([])
  const [kpiPrioridad, setKpiPrioridad] = useState([])
  const [kpiTecnico, setKpiTecnico] = useState([])
  const [kpiOficina, setKpiOficina] = useState([])
  const [tendenciaUltimos30Dias, setTendenciaUltimos30Dias] = useState([])
  const [tendenciaUltimos7Dias, setTendenciaUltimos7Dias] = useState([])
  const [ticketsPorMes, setTicketsPorMes] = useState([])
  const [eficienciaTecnicos, setEficienciaTecnicos] = useState([])
  const [distribucionTiempo, setDistribucionTiempo] = useState([])

  // Función principal para obtener datos
  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Iniciando fetch de datos del dashboard...')

      // Obtener todos los tickets
      const response = await axios.get('http://tbot_backend:3003/api/redmine/tickets?limit=2000')
      console.log('✅ Respuesta recibida:', response.data)

      const ticketsData = response.data.issues || []
      console.log('📊 Tickets procesados:', ticketsData.length)

      setTickets(ticketsData)

      // Calcular todas las estadísticas
      await calculateAdvancedStatistics(ticketsData)

      setLastUpdate(new Date())
    } catch (err) {
      console.error('❌ Error detallado al cargar datos del dashboard:', err)
      console.error('❌ Error response:', err.response)
      console.error('❌ Error message:', err.message)
      setError(`Error al cargar los datos: ${err.message}. Verifique la conexión con Redmine.`)
    } finally {
      setLoading(false)
    }
  }

  const calculateAdvancedStatistics = async (ticketsData) => {
    const stats = {
      total: ticketsData.length,
      porEstado: {},
      porPrioridad: {},
      porTecnico: {},
      porOficina: {},
      ticketsHoy: 0,
      ticketsEstaSeana: 0,
      ticketsEsteMes: 0,
      ticketsUltimos30Dias: 0,
      ticketsCriticos: 0,
      ticketsResueltos: 0,
      ticketsAbiertos: 0,
      promedioResolucion: 0,
      eficienciaTecnicos: {},
      tendenciaCreacion: [],
      cargaTrabajo: {},
    }

    const hoy = new Date()
    const inicioSemana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay())
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Procesar cada ticket
    ticketsData.forEach((ticket, index) => {
      const fechaCreacion = new Date(ticket.created_on)
      const fechaActualizacion = ticket.updated_on ? new Date(ticket.updated_on) : null

      // Estadísticas básicas por categoría
      const estado = ticket.status?.name || 'Sin estado'
      const prioridad = ticket.priority?.name || 'Sin prioridad'
      const tecnico = ticket.assigned_to?.name || 'Sin asignar'
      const oficina =
        ticket.custom_fields?.find((f) => f.name === 'Oficina')?.value || 'Sin oficina'

      // Debug: Ver estructura de los primeros tickets
      if (index < 3) {
        console.log(`🎯 Ticket #${index + 1}:`, {
          id: ticket.id,
          subject: ticket.subject,
          priority_object: ticket.priority,
          priority_name: prioridad,
          status_object: ticket.status,
          status_name: estado,
        })
      }

      stats.porEstado[estado] = (stats.porEstado[estado] || 0) + 1
      stats.porPrioridad[prioridad] = (stats.porPrioridad[prioridad] || 0) + 1
      stats.porTecnico[tecnico] = (stats.porTecnico[tecnico] || 0) + 1
      stats.porOficina[oficina] = (stats.porOficina[oficina] || 0) + 1

      // Contadores por período
      if (fechaCreacion.toDateString() === hoy.toDateString()) {
        stats.ticketsHoy++
      }
      if (fechaCreacion >= inicioSemana) {
        stats.ticketsEstaSeana++
      }
      if (fechaCreacion >= inicioMes) {
        stats.ticketsEsteMes++
      }
      if (fechaCreacion >= hace30Dias) {
        stats.ticketsUltimos30Dias++
      }

      // Tickets críticos y estados
      if (prioridad === 'Urgente' || prioridad === 'Inmediata') {
        stats.ticketsCriticos++
      }
      if (estado === 'Resuelta' || estado === 'Cerrada') {
        stats.ticketsResueltos++
      } else {
        stats.ticketsAbiertos++
      }

      // Eficiencia de técnicos
      if (tecnico !== 'Sin asignar') {
        if (!stats.eficienciaTecnicos[tecnico]) {
          stats.eficienciaTecnicos[tecnico] = {
            total: 0,
            resueltos: 0,
            criticos: 0,
            tiempoPromedio: 0,
          }
        }
        stats.eficienciaTecnicos[tecnico].total++
        if (estado === 'Resuelta' || estado === 'Cerrada') {
          stats.eficienciaTecnicos[tecnico].resueltos++
        }
        if (prioridad === 'Urgente' || prioridad === 'Inmediata') {
          stats.eficienciaTecnicos[tecnico].criticos++
        }
      }
    })

    // Calcular tendencias
    calculateTrends(ticketsData)

    // Calcular eficiencia de técnicos
    calculateTechniciansEfficiency(stats.eficienciaTecnicos)

    // Calcular distribución de tiempo
    calculateTimeDistribution(ticketsData)

    // Convertir a arrays para gráficos
    setKpiEstado(
      Object.entries(stats.porEstado).map(([estado, cantidad]) => ({ estado, cantidad })),
    )
    setKpiPrioridad(
      Object.entries(stats.porPrioridad).map(([prioridad, cantidad]) => ({ prioridad, cantidad })),
    )
    setKpiTecnico(
      Object.entries(stats.porTecnico).map(([tecnico, cantidad]) => ({ tecnico, cantidad })),
    )
    setKpiOficina(
      Object.entries(stats.porOficina).map(([oficina, cantidad]) => ({ oficina, cantidad })),
    )

    // Debug: Ver los datos de prioridades
    console.log('🔥 Datos de prioridades:', stats.porPrioridad)
    console.log(
      '🔥 Array de prioridades para gráfico:',
      Object.entries(stats.porPrioridad).map(([prioridad, cantidad]) => ({ prioridad, cantidad })),
    )

    setStatistics(stats)
  }

  const calculateTrends = (ticketsData) => {
    // Últimos 30 días
    const last30Days = []
    for (let i = 29; i >= 0; i--) {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - i)
      const fechaStr = fecha.toISOString().split('T')[0]

      const ticketsDia = ticketsData.filter(
        (ticket) => ticket.created_on.split('T')[0] === fechaStr,
      ).length

      last30Days.push({
        fecha: fecha.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        tickets: ticketsDia,
        fechaCompleta: fechaStr,
      })
    }
    setTendenciaUltimos30Dias(last30Days)

    // Últimos 7 días
    const last7Days = last30Days.slice(-7)
    setTendenciaUltimos7Dias(last7Days)

    // Por mes (últimos 12 meses)
    const ticketsPorMes = []
    for (let i = 11; i >= 0; i--) {
      const fecha = new Date()
      fecha.setMonth(fecha.getMonth() - i)
      const año = fecha.getFullYear()
      const mes = fecha.getMonth() + 1

      const ticketsMes = ticketsData.filter((ticket) => {
        const fechaTicket = new Date(ticket.created_on)
        return fechaTicket.getFullYear() === año && fechaTicket.getMonth() + 1 === mes
      }).length

      ticketsPorMes.push({
        mes: fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        tickets: ticketsMes,
        año,
        mesNum: mes,
      })
    }
    setTicketsPorMes(ticketsPorMes)
  }

  const calculateTechniciansEfficiency = (eficienciaTecnicos) => {
    const eficienciaArray = Object.entries(eficienciaTecnicos)
      .map(([tecnico, stats]) => ({
        tecnico: tecnico.length > 20 ? tecnico.substring(0, 20) + '...' : tecnico,
        total: stats.total,
        resueltos: stats.resueltos,
        criticos: stats.criticos,
        eficiencia: stats.total > 0 ? Math.round((stats.resueltos / stats.total) * 100) : 0,
        cargaCritica: stats.total > 0 ? Math.round((stats.criticos / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    setEficienciaTecnicos(eficienciaArray)
  }

  const calculateTimeDistribution = (ticketsData) => {
    const distribuciones = {
      '0-1 día': 0,
      '1-3 días': 0,
      '3-7 días': 0,
      '1-2 semanas': 0,
      '2-4 semanas': 0,
      '1+ mes': 0,
    }

    ticketsData.forEach((ticket) => {
      const fechaCreacion = new Date(ticket.created_on)
      const fechaActualizacion = ticket.updated_on ? new Date(ticket.updated_on) : new Date()
      const diasTranscurridos = Math.floor(
        (fechaActualizacion - fechaCreacion) / (1000 * 60 * 60 * 24),
      )

      if (diasTranscurridos <= 1) {
        distribuciones['0-1 día']++
      } else if (diasTranscurridos <= 3) {
        distribuciones['1-3 días']++
      } else if (diasTranscurridos <= 7) {
        distribuciones['3-7 días']++
      } else if (diasTranscurridos <= 14) {
        distribuciones['1-2 semanas']++
      } else if (diasTranscurridos <= 28) {
        distribuciones['2-4 semanas']++
      } else {
        distribuciones['1+ mes']++
      }
    })

    const distribucionArray = Object.entries(distribuciones).map(([periodo, cantidad]) => ({
      periodo,
      cantidad,
      porcentaje: statistics.total > 0 ? Math.round((cantidad / statistics.total) * 100) : 0,
    }))

    setDistribucionTiempo(distribucionArray)
  }

  useEffect(() => {
    fetchDashboardData()
    // Actualizar según intervalo seleccionado
    const interval = setInterval(fetchDashboardData, refreshInterval * 60 * 1000)
    return () => clearInterval(interval)
  }, [refreshInterval])

  // Colores mejorados y consistentes
  const colorPalette = {
    primary: '#007bff',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8',
    secondary: '#6c757d',
    light: '#f8f9fa',
    dark: '#343a40',
  }

  const prioridadColors = {
    Baja: colorPalette.info,
    Normal: colorPalette.success,
    Alta: colorPalette.warning,
    Urgente: '#fd7e14',
    Inmediata: colorPalette.danger,
    'Sin prioridad': '#6c757d',
  }

  const estadoColors = {
    Nueva: '#6f42c1',
    'En curso': colorPalette.primary,
    Resuelta: colorPalette.success,
    Cerrada: colorPalette.secondary,
    Rechazada: colorPalette.danger,
  }

  // Renderizado de loading
  if (loading && !tickets.length) {
    return (
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} className="text-center py-5">
            <CSpinner size="lg" color="primary" />
            <h4 className="mt-3">Cargando Dashboard...</h4>
            <p className="text-muted">Obteniendo datos desde Redmine</p>
          </CCol>
        </CRow>
      </CContainer>
    )
  }

  return (
    <CContainer fluid>
      {/* Header mejorado del Dashboard */}
      <CRow className="mb-4">
        <CCol>
          <CCard className="bg-gradient-primary border-0 shadow-lg">
            <CCardHeader className="bg-transparent border-0">
              <CRow className="align-items-center">
                <CCol>
                  <div className="d-flex align-items-center">
                    <div className="me-3" style={{ fontSize: '3rem' }}>
                      🎯
                    </div>
                    <div>
                      <h2 className="text-white mb-0">Dashboard Soporte Técnico</h2>
                      <p className="text-white-50 mb-0">
                        Ministerio Público Fiscal - Sistema de Gestión de Tickets
                      </p>
                      {lastUpdate && (
                        <small className="text-white-75">
                          🕐 Actualizado: {lastUpdate.toLocaleString('es-ES')}
                        </small>
                      )}
                    </div>
                  </div>
                </CCol>
                <CCol xs="auto">
                  <div className="d-flex gap-2">
                    <CDropdown>
                      <CDropdownToggle color="light" variant="outline" size="sm">
                        🔄 Actualizar cada {refreshInterval}min
                      </CDropdownToggle>
                      <CDropdownMenu>
                        <CDropdownItem onClick={() => setRefreshInterval(1)}>
                          1 minuto
                        </CDropdownItem>
                        <CDropdownItem onClick={() => setRefreshInterval(5)}>
                          5 minutos
                        </CDropdownItem>
                        <CDropdownItem onClick={() => setRefreshInterval(15)}>
                          15 minutos
                        </CDropdownItem>
                        <CDropdownItem onClick={() => setRefreshInterval(30)}>
                          30 minutos
                        </CDropdownItem>
                      </CDropdownMenu>
                    </CDropdown>
                    <CButton
                      color="light"
                      variant="outline"
                      size="sm"
                      onClick={fetchDashboardData}
                      disabled={loading}
                    >
                      {loading ? <CSpinner size="sm" /> : '🔄'} Actualizar
                    </CButton>
                    <CButton
                      color="light"
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/tickets')}
                    >
                      📋 Ver Tickets
                    </CButton>
                  </div>
                </CCol>
              </CRow>
            </CCardHeader>
          </CCard>
        </CCol>
      </CRow>

      {error && (
        <CRow className="mb-4">
          <CCol>
            <CAlert color="danger" dismissible onClose={() => setError(null)}>
              <h5>⚠️ Error</h5>
              {error}
            </CAlert>
          </CCol>
        </CRow>
      )}

      {/* Navegación por pestañas */}
      <CRow className="mb-4">
        <CCol>
          <CCard>
            <CCardHeader className="p-0">
              <CNav variant="tabs">
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                    style={{ cursor: 'pointer' }}
                  >
                    📊 Resumen General
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'trends'}
                    onClick={() => setActiveTab('trends')}
                    style={{ cursor: 'pointer' }}
                  >
                    📈 Tendencias
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'performance'}
                    onClick={() => setActiveTab('performance')}
                    style={{ cursor: 'pointer' }}
                  >
                    🎯 Rendimiento
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'analysis'}
                    onClick={() => setActiveTab('analysis')}
                    style={{ cursor: 'pointer' }}
                  >
                    🔍 Análisis Detallado
                  </CNavLink>
                </CNavItem>
              </CNav>
            </CCardHeader>
            <CCardBody>
              <CTabContent>
                {/* Pestaña: Resumen General */}
                <CTabPane visible={activeTab === 'overview'}>
                  {/* KPIs Principales Ultra Mejorados */}
                  <CRow className="mb-4">
                    <CCol lg={3} md={6} className="mb-3">
                      <CCard className="h-100 border-0 shadow-sm">
                        <CCardBody
                          className="bg-gradient text-white position-relative overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }}
                        >
                          <div className="position-absolute top-0 end-0 p-3 opacity-25">
                            <div style={{ fontSize: '4rem' }}>📊</div>
                          </div>
                          <div className="position-relative">
                            <div className="fs-6 mb-2 text-white-75">Total de Tickets</div>
                            <div className="fs-1 fw-bold mb-1">
                              {statistics.total?.toLocaleString() || 0}
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-white-75">Histórico completo</small>
                              <CBadge color="light" className="text-dark">
                                {statistics.ticketsAbiertos || 0} abiertos
                              </CBadge>
                            </div>
                          </div>
                        </CCardBody>
                      </CCard>
                    </CCol>

                    <CCol lg={3} md={6} className="mb-3">
                      <CCard className="h-100 border-0 shadow-sm">
                        <CCardBody
                          className="bg-gradient text-white position-relative overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          }}
                        >
                          <div className="position-absolute top-0 end-0 p-3 opacity-25">
                            <div style={{ fontSize: '4rem' }}>🚀</div>
                          </div>
                          <div className="position-relative">
                            <div className="fs-6 mb-2 text-white-75">Tickets Hoy</div>
                            <div className="fs-1 fw-bold mb-1">{statistics.ticketsHoy || 0}</div>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-white-75">
                                {new Date().toLocaleDateString('es-ES')}
                              </small>
                              <CBadge color="light" className="text-dark">
                                +{statistics.ticketsEstaSeana || 0} esta semana
                              </CBadge>
                            </div>
                          </div>
                        </CCardBody>
                      </CCard>
                    </CCol>

                    <CCol lg={3} md={6} className="mb-3">
                      <CCard className="h-100 border-0 shadow-sm">
                        <CCardBody
                          className="bg-gradient text-white position-relative overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          }}
                        >
                          <div className="position-absolute top-0 end-0 p-3 opacity-25">
                            <div style={{ fontSize: '4rem' }}>✅</div>
                          </div>
                          <div className="position-relative">
                            <div className="fs-6 mb-2 text-white-75">Resueltos</div>
                            <div className="fs-1 fw-bold mb-1">
                              {statistics.ticketsResueltos || 0}
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-white-75">
                                {statistics.total > 0
                                  ? Math.round(
                                      (statistics.ticketsResueltos / statistics.total) * 100,
                                    )
                                  : 0}
                                % del total
                              </small>
                              <CBadge color="light" className="text-dark">
                                Eficiencia
                              </CBadge>
                            </div>
                          </div>
                        </CCardBody>
                      </CCard>
                    </CCol>

                    <CCol lg={3} md={6} className="mb-3">
                      <CCard className="h-100 border-0 shadow-sm">
                        <CCardBody
                          className="bg-gradient text-white position-relative overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                          }}
                        >
                          <div className="position-absolute top-0 end-0 p-3 opacity-25">
                            <div style={{ fontSize: '4rem' }}>⚡</div>
                          </div>
                          <div className="position-relative">
                            <div className="fs-6 mb-2 text-white-75">Críticos</div>
                            <div className="fs-1 fw-bold mb-1">
                              {statistics.ticketsCriticos || 0}
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-white-75">Urgente + Inmediata</small>
                              <CBadge color="light" className="text-dark">
                                {statistics.total > 0
                                  ? Math.round(
                                      (statistics.ticketsCriticos / statistics.total) * 100,
                                    )
                                  : 0}
                                %
                              </CBadge>
                            </div>
                          </div>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  </CRow>

                  {/* Gráficos principales */}
                  <CRow className="mb-4">
                    <CCol lg={6} className="mb-4">
                      <CCard className="h-100 shadow-sm">
                        <CCardHeader className="bg-white border-0 d-flex justify-content-between align-items-center">
                          <div>
                            <h5 className="mb-0 text-dark">🎯 Estados de Tickets</h5>
                            <small className="text-muted">Distribución actual</small>
                          </div>
                          <CBadge color="primary">{kpiEstado.length} estados</CBadge>
                        </CCardHeader>
                        <CCardBody>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={kpiEstado}
                                dataKey="cantidad"
                                nameKey="estado"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={({ estado, percent }) =>
                                  `${estado} (${(percent * 100).toFixed(0)}%)`
                                }
                              >
                                {kpiEstado.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      estadoColors[entry.estado] || `hsl(${index * 45}, 70%, 50%)`
                                    }
                                  />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [value, 'Tickets']} />
                            </PieChart>
                          </ResponsiveContainer>
                        </CCardBody>
                      </CCard>
                    </CCol>

                    <CCol lg={6} className="mb-4">
                      <CCard className="h-100 shadow-sm">
                        <CCardHeader className="bg-white border-0 d-flex justify-content-between align-items-center">
                          <div>
                            <h5 className="mb-0 text-dark">🔥 Prioridades</h5>
                            <small className="text-muted">Distribución por urgencia</small>
                          </div>
                          <CBadge color="danger">{statistics.ticketsCriticos} críticos</CBadge>
                        </CCardHeader>
                        <CCardBody>
                          {kpiPrioridad.length === 0 ? (
                            <div className="text-center py-4">
                              <p className="text-muted">No hay datos de prioridades disponibles</p>
                              <small className="text-muted">
                                Total de tickets: {statistics.total || 0}
                              </small>
                            </div>
                          ) : (
                            <>
                              <div className="mb-2">
                                <small className="text-muted">
                                  Datos encontrados: {kpiPrioridad.length} categorías de prioridad
                                </small>
                              </div>
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={kpiPrioridad}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis
                                    dataKey="prioridad"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                  />
                                  <YAxis />
                                  <Tooltip
                                    formatter={(value, name) => [value, 'Cantidad']}
                                    labelFormatter={(label) => `Prioridad: ${label}`}
                                  />
                                  <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                                    {kpiPrioridad.map((entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={prioridadColors[entry.prioridad] || '#6c757d'}
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </>
                          )}
                        </CCardBody>
                      </CCard>
                    </CCol>
                  </CRow>

                  {/* Tendencia semanal */}
                  <CRow className="mb-4">
                    <CCol>
                      <CCard className="shadow-sm">
                        <CCardHeader className="bg-white border-0">
                          <h5 className="mb-0 text-dark">📈 Tendencia - Últimos 7 días</h5>
                          <small className="text-muted">Tickets creados por día</small>
                        </CCardHeader>
                        <CCardBody>
                          <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={tendenciaUltimos7Dias}>
                              <defs>
                                <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#007bff" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#007bff" stopOpacity={0.1} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="fecha" />
                              <YAxis />
                              <Tooltip />
                              <Area
                                type="monotone"
                                dataKey="tickets"
                                stroke="#007bff"
                                fillOpacity={1}
                                fill="url(#colorTickets)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  </CRow>
                </CTabPane>

                {/* Pestaña: Tendencias */}
                <CTabPane visible={activeTab === 'trends'}>
                  <CRow className="mb-4">
                    <CCol>
                      <CCard className="shadow-sm">
                        <CCardHeader className="bg-white border-0">
                          <h5 className="mb-0 text-dark">📊 Tendencia - Últimos 30 días</h5>
                          <small className="text-muted">Evolución diaria de tickets creados</small>
                        </CCardHeader>
                        <CCardBody>
                          <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={tendenciaUltimos30Dias}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="fecha" />
                              <YAxis />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="tickets"
                                stroke="#007bff"
                                strokeWidth={3}
                                dot={{ fill: '#007bff', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  </CRow>

                  <CRow className="mb-4">
                    <CCol>
                      <CCard className="shadow-sm">
                        <CCardHeader className="bg-white border-0">
                          <h5 className="mb-0 text-dark">📅 Evolución Mensual</h5>
                          <small className="text-muted">
                            Tickets creados por mes (últimos 12 meses)
                          </small>
                        </CCardHeader>
                        <CCardBody>
                          <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={ticketsPorMes}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="mes" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="tickets" fill="#28a745" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol>
                      <CCard className="shadow-sm">
                        <CCardHeader className="bg-white border-0">
                          <h5 className="mb-0 text-dark">
                            ⏰ Distribución de Tiempo de Resolución
                          </h5>
                          <small className="text-muted">
                            Tiempo transcurrido desde la creación
                          </small>
                        </CCardHeader>
                        <CCardBody>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={distribucionTiempo}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="periodo" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="cantidad" fill="#17a2b8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  </CRow>
                </CTabPane>

                {/* Pestaña: Rendimiento */}
                <CTabPane visible={activeTab === 'performance'}>
                  <CRow className="mb-4">
                    <CCol>
                      <CCard className="shadow-sm">
                        <CCardHeader className="bg-white border-0">
                          <h5 className="mb-0 text-dark">🎯 Eficiencia de Técnicos</h5>
                          <small className="text-muted">Top 10 técnicos por rendimiento</small>
                        </CCardHeader>
                        <CCardBody>
                          <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart data={eficienciaTecnicos}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="tecnico" angle={-45} textAnchor="end" height={100} />
                              <YAxis yAxisId="left" />
                              <YAxis yAxisId="right" orientation="right" />
                              <Tooltip />
                              <Legend />
                              <Bar
                                yAxisId="left"
                                dataKey="total"
                                fill="#007bff"
                                name="Total Tickets"
                              />
                              <Bar
                                yAxisId="left"
                                dataKey="resueltos"
                                fill="#28a745"
                                name="Resueltos"
                              />
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="eficiencia"
                                stroke="#dc3545"
                                name="Eficiencia %"
                              />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol lg={6}>
                      <CCard className="shadow-sm">
                        <CCardHeader className="bg-white border-0">
                          <h5 className="mb-0 text-dark">👥 Carga de Trabajo por Técnico</h5>
                          <small className="text-muted">Distribución actual</small>
                        </CCardHeader>
                        <CCardBody>
                          <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={kpiTecnico.slice(0, 10)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="tecnico" angle={-45} textAnchor="end" height={100} />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="cantidad" fill="#007bff" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CCardBody>
                      </CCard>
                    </CCol>

                    <CCol lg={6}>
                      <CCard className="shadow-sm">
                        <CCardHeader className="bg-white border-0">
                          <h5 className="mb-0 text-dark">📊 Tickets Críticos por Técnico</h5>
                          <small className="text-muted">Distribución de prioridades altas</small>
                        </CCardHeader>
                        <CCardBody>
                          <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={eficienciaTecnicos.filter((t) => t.criticos > 0)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="tecnico" angle={-45} textAnchor="end" height={100} />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="criticos" fill="#dc3545" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  </CRow>
                </CTabPane>

                {/* Pestaña: Análisis Detallado */}
                <CTabPane visible={activeTab === 'analysis'}>
                  <CRow className="mb-4">
                    <CCol>
                      <CCard className="shadow-sm">
                        <CCardHeader className="bg-white border-0">
                          <h5 className="mb-0 text-dark">🏢 Análisis por Oficina</h5>
                          <small className="text-muted">Distribución geográfica de tickets</small>
                        </CCardHeader>
                        <CCardBody>
                          <ResponsiveContainer width="100%" height={500}>
                            <BarChart
                              data={kpiOficina.slice(0, 15)}
                              margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="oficina"
                                angle={-45}
                                textAnchor="end"
                                height={150}
                                fontSize={11}
                                interval={0}
                                tick={{ dy: 10 }}
                              />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="cantidad" fill="#28a745" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  </CRow>

                  <CRow className="mb-4">
                    <CCol lg={6}>
                      <CCard className="shadow-sm">
                        <CCardHeader className="bg-white border-0">
                          <h5 className="mb-0 text-dark">🔍 Análisis de Correlación</h5>
                          <small className="text-muted">Eficiencia vs Carga de Trabajo</small>
                        </CCardHeader>
                        <CCardBody>
                          <ResponsiveContainer width="100%" height={300}>
                            <ScatterChart data={eficienciaTecnicos}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="total" name="Total Tickets" />
                              <YAxis dataKey="eficiencia" name="Eficiencia %" />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Scatter dataKey="eficiencia" fill="#007bff" />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </CCardBody>
                      </CCard>
                    </CCol>

                    <CCol lg={6}>
                      <CCard className="shadow-sm">
                        <CCardHeader className="bg-white border-0">
                          <h5 className="mb-0 text-dark">📈 Métricas Clave</h5>
                          <small className="text-muted">Indicadores de rendimiento</small>
                        </CCardHeader>
                        <CCardBody>
                          <div className="mb-4">
                            <div className="d-flex justify-content-between mb-2">
                              <span>Tasa de Resolución</span>
                              <span className="fw-bold">
                                {statistics.total > 0
                                  ? Math.round(
                                      (statistics.ticketsResueltos / statistics.total) * 100,
                                    )
                                  : 0}
                                %
                              </span>
                            </div>
                            <CProgress>
                              <CProgressBar
                                value={
                                  statistics.total > 0
                                    ? Math.round(
                                        (statistics.ticketsResueltos / statistics.total) * 100,
                                      )
                                    : 0
                                }
                                color="success"
                              />
                            </CProgress>
                          </div>

                          <div className="mb-4">
                            <div className="d-flex justify-content-between mb-2">
                              <span>Tickets Críticos</span>
                              <span className="fw-bold">
                                {statistics.total > 0
                                  ? Math.round(
                                      (statistics.ticketsCriticos / statistics.total) * 100,
                                    )
                                  : 0}
                                %
                              </span>
                            </div>
                            <CProgress>
                              <CProgressBar
                                value={
                                  statistics.total > 0
                                    ? Math.round(
                                        (statistics.ticketsCriticos / statistics.total) * 100,
                                      )
                                    : 0
                                }
                                color="danger"
                              />
                            </CProgress>
                          </div>

                          <div className="mb-4">
                            <div className="d-flex justify-content-between mb-2">
                              <span>Actividad Reciente (30 días)</span>
                              <span className="fw-bold">
                                {statistics.total > 0
                                  ? Math.round(
                                      (statistics.ticketsUltimos30Dias / statistics.total) * 100,
                                    )
                                  : 0}
                                %
                              </span>
                            </div>
                            <CProgress>
                              <CProgressBar
                                value={
                                  statistics.total > 0
                                    ? Math.round(
                                        (statistics.ticketsUltimos30Dias / statistics.total) * 100,
                                      )
                                    : 0
                                }
                                color="info"
                              />
                            </CProgress>
                          </div>

                          <div className="row text-center">
                            <div className="col-4">
                              <div className="border-end">
                                <div className="fs-5 fw-bold text-primary">
                                  {statistics.ticketsHoy || 0}
                                </div>
                                <div className="text-muted small">Hoy</div>
                              </div>
                            </div>
                            <div className="col-4">
                              <div className="border-end">
                                <div className="fs-5 fw-bold text-success">
                                  {statistics.ticketsEstaSeana || 0}
                                </div>
                                <div className="text-muted small">Semana</div>
                              </div>
                            </div>
                            <div className="col-4">
                              <div className="fs-5 fw-bold text-info">
                                {statistics.ticketsEsteMes || 0}
                              </div>
                              <div className="text-muted small">Mes</div>
                            </div>
                          </div>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  </CRow>
                </CTabPane>
              </CTabContent>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Dashboard
