import React, { useState, useEffect, useRef } from 'react'
import { redmineAPI } from '../../config/api'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CAlert,
  CSpinner,
  CBadge,
  CProgress,
  CProgressBar,
} from '@coreui/react'
import axios from 'axios'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const ReportePersonalizado = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [statistics, setStatistics] = useState({})
  const [totalCount, setTotalCount] = useState(0)
  const [id, setId] = useState('')
  const [estado, setEstado] = useState('')
  const [prioridad, setPrioridad] = useState('')
  const [asignado, setAsignado] = useState('')
  const [empleado, setEmpleado] = useState('')
  const [oficina, setOficina] = useState('')
  const [nroContacto, setNroContacto] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [palabraClave, setPalabraClave] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const idInputRef = useRef(null)

  const fetchTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (id) params.id = id
      if (estado) params.estado = estado
      if (prioridad) params.prioridad = prioridad
      if (asignado) params.asignado = asignado
      if (empleado) params.empleado = empleado
      if (oficina) params.oficina = oficina
      if (nroContacto) params.nroContacto = nroContacto
      if (fechaInicio) params.fechaInicio = fechaInicio
      if (fechaFin) params.fechaFin = fechaFin
      if (palabraClave) params.palabraClave = palabraClave

      console.log('📋 Parámetros de búsqueda:', params)

      if (fechaInicio || fechaFin) {
        console.log('📅 Filtros de fecha:', { fechaInicio, fechaFin })
      }

      const response = await redmineAPI.getTickets(params)

      const ticketsData = response.data.issues || response.data
      console.log('📥 Tickets recibidos:', ticketsData.length)

      setTickets(ticketsData)
      setTotalCount(response.data.total_count || ticketsData.length)

      // Calcular estadísticas
      calculateStatistics(ticketsData)
    } catch (error) {
      console.error('Error al obtener tickets:', error)
      setError('Error al obtener los tickets. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const calculateStatistics = (ticketsData) => {
    const stats = {
      total: ticketsData.length,
      porEstado: {},
      porPrioridad: {},
      porAsignado: {},
      ticketsRecientes: 0,
    }

    // Calcular estadísticas por estado
    ticketsData.forEach((ticket) => {
      // Por estado
      const estado = ticket.status?.name || 'Sin estado'
      stats.porEstado[estado] = (stats.porEstado[estado] || 0) + 1

      // Por prioridad
      const prioridad = ticket.priority?.name || 'Sin prioridad'
      stats.porPrioridad[prioridad] = (stats.porPrioridad[prioridad] || 0) + 1

      // Por asignado
      const asignado = ticket.assigned_to?.name || 'Sin asignar'
      stats.porAsignado[asignado] = (stats.porAsignado[asignado] || 0) + 1

      // Tickets recientes (últimos 7 días)
      const fechaCreacion = new Date(ticket.created_on)
      const hace7Dias = new Date()
      hace7Dias.setDate(hace7Dias.getDate() - 7)
      if (fechaCreacion > hace7Dias) {
        stats.ticketsRecientes++
      }
    })

    setStatistics(stats)
  }

  // Función para exportar a Excel/PDF
  // Exportar a Excel
  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      tickets.map((ticket) => ({
        ID: ticket.id,
        Asunto: ticket.subject,
        Estado: ticket.status?.name,
        Prioridad: ticket.priority?.name,
        'Asignado a': ticket.assigned_to?.name || '-',
        Oficina: ticket.custom_fields.find((f) => f.name === 'Oficina')?.value || '',
        Empleado: ticket.custom_fields.find((f) => f.name === 'Empleado')?.value || '',
        'Nro de Contacto':
          ticket.custom_fields.find((f) => f.name === 'Nro de Contacto')?.value || '',
        Creado: new Date(ticket.created_on).toLocaleString('es-AR'),
      })),
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Tickets')
    XLSX.writeFile(wb, 'reporte_tickets.xlsx')
  }

  // Exportar a PDF
  const exportarPDF = () => {
    console.log('Exportando PDF', tickets)
    if (!tickets.length) {
      alert('No hay datos para exportar')
      return
    }
    const doc = new jsPDF()
    doc.text('Reporte de Tickets', 14, 10)
    autoTable(doc, {
      head: [
        [
          'ID',
          'Asunto',
          'Estado',
          'Prioridad',
          'Asignado a',
          'Oficina',
          'Empleado',
          'Nro de Contacto',
          'Creado',
        ],
      ],
      body: tickets.map((ticket) => [
        ticket.id,
        ticket.subject,
        ticket.status?.name,
        ticket.priority?.name,
        ticket.assigned_to?.name || '-',
        ticket.custom_fields.find((f) => f.name === 'Oficina')?.value || '',
        ticket.custom_fields.find((f) => f.name === 'Empleado')?.value || '',
        ticket.custom_fields.find((f) => f.name === 'Nro de Contacto')?.value || '',
        new Date(ticket.created_on).toLocaleString('es-AR'),
      ]),
      startY: 20,
    })
    doc.save('reporte_tickets.pdf')
  }

  useEffect(() => {
    fetchTickets()
    // eslint-disable-next-line
  }, [id, estado, prioridad, asignado, empleado, oficina, nroContacto, fechaInicio, fechaFin, palabraClave])

  // Cuando se muestran los filtros, enfoca el input de ID
  useEffect(() => {
    if (mostrarFiltros && idInputRef.current) {
      idInputRef.current.focus()
    }
  }, [mostrarFiltros])

  const getBadgeColor = (estado) => {
    const colors = {
      Nueva: 'primary', // azul
      'En Curso': 'warning', // naranja/amarillo
      Resuelta: 'success', // verde
      Rechazada: 'secondary', // gris
      Cerrada: 'danger', // rojo
      Pendiente: 'info', // azul claro
      'En Progreso': 'warning', // naranja
      Asignada: 'info', // azul claro
      'Sin estado': 'dark', // negro/gris oscuro
    }
    return colors[estado] || 'dark' // Cambiado de 'light' a 'dark' para mejor visibilidad
  }

  const getPriorityColor = (prioridad) => {
    const colors = {
      Baja: 'info',
      Normal: 'secondary',
      Alta: 'warning',
      Urgente: 'danger',
      Inmediata: 'danger',
    }
    return colors[prioridad] || 'light'
  }

  const truncate = (str, n = 15) => (str.length > n ? str.slice(0, n) + '...' : str)

  const limpiarFiltros = () => {
    setId('')
    setEstado('')
    setPrioridad('')
    setAsignado('')
    setEmpleado('')
    setOficina('')
    setNroContacto('')
    setFechaInicio('')
    setFechaFin('')
    setPalabraClave('')
  }

  return (
    <CRow>
      <CCol>
        {/* Panel de estadísticas */}
        {statistics.total > 0 && (
          <CRow className="mb-4">
            <CCol md={3}>
              <CCard className="text-center">
                <CCardBody>
                  <h3 className="text-primary">{statistics.total}</h3>
                  <p className="text-muted mb-0">Total de Tickets</p>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={3}>
              <CCard className="text-center">
                <CCardBody>
                  <h3 className="text-success">{statistics.ticketsRecientes}</h3>
                  <p className="text-muted mb-0">Últimos 7 días</p>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={3}>
              <CCard className="text-center">
                <CCardBody>
                  <h3 className="text-info">{Object.keys(statistics.porEstado).length}</h3>
                  <p className="text-muted mb-0">Estados diferentes</p>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={3}>
              <CCard className="text-center">
                <CCardBody>
                  <h3 className="text-warning">{Object.keys(statistics.porAsignado).length}</h3>
                  <p className="text-muted mb-0">Técnicos asignados</p>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        )}

        {/* Botones de acción */}
        <div className="mb-3 d-flex justify-content-end align-items-center gap-2">
          <button
            className="btn btn-success"
            onClick={exportarExcel}
            title="Descargar Excel"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            ⬇️ Excel
          </button>
          <button
            className="btn btn-danger"
            onClick={exportarPDF}
            title="Descargar PDF"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            ⬇️ PDF
          </button>
          <button
            className={`btn d-flex align-items-center ${mostrarFiltros ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setMostrarFiltros((f) => !f)}
            title="Mostrar/Ocultar filtros"
            style={{ fontWeight: 'bold' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill={mostrarFiltros ? '#fff' : '#343a40'}
              viewBox="0 0 16 16"
              style={{ marginRight: 6 }}
            >
              <path d="M6 10.117V14.5a.5.5 0 0 0 .757.429l2-1.2A.5.5 0 0 0 9 13.5v-3.383l5.447-6.516A.5.5 0 0 0 14.5 3h-13a.5.5 0 0 0-.447.758L6 10.117z" />
            </svg>
            Filtrar
          </button>
        </div>
        {mostrarFiltros && (
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Filtros de búsqueda</strong>
            </CCardHeader>
            <CCardBody>
              <div className="d-flex flex-wrap gap-2 align-items-end">
                <input
                  ref={idInputRef}
                  className="form-control"
                  style={{ maxWidth: 90 }}
                  type="text"
                  placeholder="ID"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
                <select
                  className="form-select"
                  style={{ maxWidth: 170 }}
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="Nueva">Nueva</option>
                  <option value="En Curso">En Curso</option>
                  <option value="Resuelta">Resuelta</option>
                  <option value="Rechazada">Rechazada</option>
                  <option value="Cerrada">Cerrada</option>
                </select>
                <select
                  className="form-select"
                  style={{ maxWidth: 170 }}
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value)}
                >
                  <option value="">Todas las prioridades</option>
                  <option value="Baja">Baja</option>
                  <option value="Normal">Normal</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                  <option value="Inmediata">Inmediata</option>
                </select>
                <input
                  className="form-control"
                  style={{ maxWidth: 160 }}
                  type="text"
                  placeholder="Asignado a"
                  value={asignado}
                  onChange={(e) => setAsignado(e.target.value)}
                />
                <input
                  className="form-control"
                  style={{ maxWidth: 160 }}
                  type="text"
                  placeholder="Empleado"
                  value={empleado}
                  onChange={(e) => setEmpleado(e.target.value)}
                />
                <input
                  className="form-control"
                  style={{ maxWidth: 160 }}
                  type="text"
                  placeholder="Oficina"
                  value={oficina}
                  onChange={(e) => setOficina(e.target.value)}
                />
                <input
                  className="form-control"
                  style={{ maxWidth: 160 }}
                  type="text"
                  placeholder="Nro de Contacto"
                  value={nroContacto}
                  onChange={(e) => setNroContacto(e.target.value)}
                />
                <div style={{ maxWidth: 160 }}>
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: '0.8rem', marginBottom: '2px' }}
                  >
                    Desde
                  </label>
                  <input
                    className="form-control"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div style={{ maxWidth: 160 }}>
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: '0.8rem', marginBottom: '2px' }}
                  >
                    Hasta
                  </label>
                  <input
                    className="form-control"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
                <input
                  className="form-control"
                  style={{ maxWidth: 180 }}
                  type="text"
                  placeholder="Palabra clave"
                  value={palabraClave}
                  onChange={(e) => setPalabraClave(e.target.value)}
                />
                <button className="btn btn-secondary" onClick={limpiarFiltros}>
                  Limpiar filtros
                </button>
              </div>
            </CCardBody>
          </CCard>
        )}
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">🎯 Reporte Personalizado de Tickets</h5>
            {loading && <CSpinner size="sm" />}
          </CCardHeader>
          <CCardBody>
            {error && (
              <CAlert color="danger" className="mb-3">
                {error}
              </CAlert>
            )}

            {loading ? (
              <div className="text-center py-4">
                <CSpinner />
                <p className="mt-2">Cargando tickets...</p>
              </div>
            ) : (
              <CTable striped responsive bordered hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell style={{ textAlign: 'center' }}>ID</CTableHeaderCell>
                    <CTableHeaderCell style={{ textAlign: 'center' }}>Asunto</CTableHeaderCell>
                    <CTableHeaderCell style={{ textAlign: 'center' }}>Estado</CTableHeaderCell>
                    <CTableHeaderCell style={{ textAlign: 'center' }}>Prioridad</CTableHeaderCell>
                    <CTableHeaderCell style={{ textAlign: 'center' }}>Asignado a</CTableHeaderCell>
                    <CTableHeaderCell style={{ textAlign: 'center' }}>Oficina</CTableHeaderCell>
                    <CTableHeaderCell style={{ textAlign: 'center' }}>Empleado</CTableHeaderCell>
                    <CTableHeaderCell style={{ textAlign: 'center' }}>
                      Nro de Contacto
                    </CTableHeaderCell>
                    <CTableHeaderCell style={{ textAlign: 'center' }}>Creado</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {tickets.map((ticket) => (
                    <CTableRow key={ticket.id}>
                      <CTableDataCell>
                        <strong>#{ticket.id}</strong>
                      </CTableDataCell>
                      <CTableDataCell>
                        <span title={ticket.subject}>{truncate(ticket.subject, 30)}</span>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={getBadgeColor(ticket.status?.name)}>
                          {ticket.status?.name || 'Sin estado'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={getPriorityColor(ticket.priority?.name)}>
                          {ticket.priority?.name || 'Sin prioridad'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>{ticket.assigned_to?.name || '-'}</CTableDataCell>
                      <CTableDataCell>
                        {ticket.custom_fields?.find((f) => f.name === 'Oficina')?.value || ''}
                      </CTableDataCell>
                      <CTableDataCell>
                        {ticket.custom_fields?.find((f) => f.name === 'Empleado')?.value || ''}
                      </CTableDataCell>
                      <CTableDataCell>
                        {ticket.custom_fields?.find((f) => f.name === 'Nro de Contacto')?.value ||
                          ''}
                      </CTableDataCell>
                      <CTableDataCell>
                        {new Date(ticket.created_on).toLocaleString('es-AR')}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}

            {!loading && tickets.length === 0 && (
              <CAlert color="info" className="text-center">
                <h5>No se encontraron tickets</h5>
                <p className="mb-0">Intenta ajustar los filtros de búsqueda</p>
              </CAlert>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ReportePersonalizado
