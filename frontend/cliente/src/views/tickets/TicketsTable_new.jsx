import React, { useEffect, useState } from 'react'
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
  CButton,
  CFormSelect,
  CSpinner,
  CAlert,
  CFormInput,
} from '@coreui/react'
import axios from 'axios'

const TicketsTable = () => {
  const [tickets, setTickets] = useState([])
  const [prioridades, setPrioridades] = useState([])
  const [miembros, setMiembros] = useState([])
  const [filtro, setFiltro] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [ticketsPerPage, setTicketsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getPriorityColor = (priorityName) => {
    if (!priorityName) return ''
    switch (priorityName.toLowerCase()) {
      case 'baja':
        return '#007bff' // azul
      case 'normal':
        return '#28a745' // verde
      case 'alta':
        return '#9933ff' // lila
      case 'urgente':
        return '#ff8000' // naranja
      case 'inmediata':
        return '#E11318' // rojo
      default:
        return ''
    }
  }

  const statusList = [
    { id: 1, name: 'Nueva' },
    { id: 2, name: 'En curso' },
    { id: 3, name: 'Resuelta' },
    { id: 6, name: 'Rechazada' },
    { id: 5, name: 'Cerrada' },
  ]

  const normalize = (text) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()

  const getStatusColor = (name) => {
    const estado = normalize(name || '')

    switch (estado) {
      case 'nueva':
        return '#9933ff' // lila
      case 'en curso':
        return '#ff8000' // naranja
      case 'resuelta':
        return '#28a745' // verde
      case 'rechazada':
        return '#e0ac14' // 🟡 amarillo
      case 'cerrada':
        return '#ff0000' // 🔴 rojo
      default:
        return ''
    }
  }

  useEffect(() => {
    setLoading(true)
    setError(null)

    axios
      .get('http://:3001/api/redmine/tickets')
      .then((res) => {
        // Manejar el nuevo formato de respuesta
        const ticketsData = res.data.issues || res.data || []
        setTickets(ticketsData)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error al obtener tickets:', err)
        setError('Error al cargar los tickets. Por favor, intenta nuevamente.')
        setLoading(false)
      })

    axios
      .get('https://incidentes.mpftucuman.gob.ar:3001/api/redmine/prioridades')
      .then((res) => setPrioridades(res.data))
      .catch((err) => console.error('Error al obtener prioridades:', err))

    axios
      .get('https://incidentes.mpftucuman.gob.ar:3001/api/redmine/miembros')
      .then((res) => setMiembros(res.data))
      .catch((err) => console.error('Error al obtener miembros:', err))
  }, [])

  const handleStatusChange = async (ticketId, newStatusId) => {
    try {
      await axios.put(
        `https://incidentes.mpftucuman.gob.ar:3001/api/redmine/tickets/${ticketId}`,
        { status_id: newStatusId },
      )
      const res = await axios.get(
        'https://incidentes.mpftucuman.gob.ar:3001/api/redmine/tickets',
      )
      const ticketsData = res.data.issues || res.data || []
      setTickets(ticketsData)
    } catch (err) {
      console.error('Error al actualizar estado del ticket:', err)
    }
  }

  const handlePriorityChange = async (ticketId, newPriorityId) => {
    try {
      await axios.put(
        `https://incidentes.mpftucuman.gob.ar:3001/api/redmine/tickets/${ticketId}`,
        { priority_id: newPriorityId },
      )
      const res = await axios.get(
        'https://incidentes.mpftucuman.gob.ar:3001/api/redmine/tickets',
      )
      const ticketsData = res.data.issues || res.data || []
      setTickets(ticketsData)
    } catch (err) {
      console.error('Error al actualizar prioridad:', err)
    }
  }

  const handleAssignedChange = async (ticketId, newAssignedId) => {
    try {
      await axios.put(
        `https://incidentes.mpftucuman.gob.ar:3001/api/redmine/tickets/${ticketId}`,
        { assigned_to_id: newAssignedId },
      )
      const res = await axios.get(
        'https://incidentes.mpftucuman.gob.ar:3001/api/redmine/tickets',
      )
      const ticketsData = res.data.issues || res.data || []
      setTickets(ticketsData)
    } catch (err) {
      console.error('Error al actualizar asignado a:', err)
    }
  }

  const ticketsFiltrados = tickets.filter((ticket) => {
    const texto = filtro.toLowerCase()
    return (
      ticket.id.toString().includes(texto) ||
      (ticket.subject || '').toLowerCase().includes(texto) ||
      (
        ticket.custom_fields?.find((f) => f.name === 'Oficina')?.value?.toLowerCase() || ''
      ).includes(texto) ||
      (ticket.assigned_to?.name?.toLowerCase() || '').includes(texto)
    )
  })

  const ticketsPaginados = ticketsFiltrados.slice(
    (currentPage - 1) * ticketsPerPage,
    currentPage * ticketsPerPage,
  )

  const getCustomField = (ticket, fieldName) => {
    const campo = ticket.custom_fields?.find(
      (f) => f.name.toLowerCase() === fieldName.toLowerCase(),
    )
    return campo ? campo.value : ''
  }

  const formatFechaHora = (isoDate) => {
    const fecha = new Date(isoDate)
    return (
      fecha
        .toLocaleString('es-AR', {
          dateStyle: 'short',
          timeStyle: 'short',
          timeZone: 'America/Argentina/Buenos_Aires',
        })
        .replace(',', ' -') + ' hs'
    )
  }

  return (
    <CRow>
      <CCol>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">📋 Tickets - Soporte Técnico MPF</h5>
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
              <>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <CFormInput
                    type="text"
                    placeholder="Buscar tickets..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    style={{ maxWidth: '300px' }}
                  />
                  <CFormSelect
                    size="sm"
                    style={{ maxWidth: '100px' }}
                    value={ticketsPerPage}
                    onChange={(e) => {
                      setTicketsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                  >
                    {[5, 10, 15, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n} / pág
                      </option>
                    ))}
                  </CFormSelect>
                </div>

                <CTable striped hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>ID</CTableHeaderCell>
                      <CTableHeaderCell>Tipo</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '150px' }}>Prioridad</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '160px' }}>Estado</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '180px' }}>Asignado a</CTableHeaderCell>
                      <CTableHeaderCell>Asunto</CTableHeaderCell>
                      <CTableHeaderCell>Oficina</CTableHeaderCell>
                      <CTableHeaderCell>Creado</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {ticketsPaginados.map((ticket, i) => (
                      <CTableRow key={i}>
                        <CTableDataCell>{ticket.id}</CTableDataCell>
                        <CTableDataCell>{ticket.tracker?.name}</CTableDataCell>
                        <CTableDataCell>
                          <CFormSelect
                            size="sm"
                            style={{
                              width: '140px',
                              backgroundColor: getPriorityColor(ticket.priority?.name),
                              color: '#000',
                            }}
                            value={ticket.priority?.id}
                            onChange={(e) => handlePriorityChange(ticket.id, e.target.value)}
                          >
                            {prioridades.map((prioridad) => (
                              <option key={prioridad.id} value={prioridad.id}>
                                {prioridad.name}
                              </option>
                            ))}
                          </CFormSelect>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CFormSelect
                            size="sm"
                            style={{
                              width: '150px',
                              backgroundColor: getStatusColor(ticket.status?.name),
                              color: '#000',
                            }}
                            value={ticket.status?.id}
                            onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          >
                            {statusList.map((estado) => (
                              <option key={estado.id} value={estado.id}>
                                {estado.name}
                              </option>
                            ))}
                          </CFormSelect>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CFormSelect
                            size="sm"
                            style={{ width: '170px' }}
                            value={ticket.assigned_to?.id || ''}
                            onChange={(e) => handleAssignedChange(ticket.id, e.target.value)}
                          >
                            <option value="">Sin asignar</option>
                            {miembros.map((miembro) => (
                              <option key={miembro.id} value={miembro.id}>
                                {miembro.name}
                              </option>
                            ))}
                          </CFormSelect>
                        </CTableDataCell>
                        <CTableDataCell>{ticket.subject}</CTableDataCell>
                        <CTableDataCell>{getCustomField(ticket, 'Oficina')}</CTableDataCell>
                        <CTableDataCell>{formatFechaHora(ticket.created_on)}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>

                {tickets.length === 0 && (
                  <CAlert color="info" className="text-center">
                    <h5>No se encontraron tickets</h5>
                    <p className="mb-0">No hay tickets para mostrar</p>
                  </CAlert>
                )}

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Mostrando {ticketsPaginados.length} de {ticketsFiltrados.length} tickets
                  </div>
                  <div>
                    <CButton
                      color="primary"
                      variant="outline"
                      className="me-2"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      ⬅️ Anterior
                    </CButton>
                    <CButton
                      color="primary"
                      variant="outline"
                      disabled={currentPage === Math.ceil(ticketsFiltrados.length / ticketsPerPage)}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Siguiente ➡️
                    </CButton>
                  </div>
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default TicketsTable
