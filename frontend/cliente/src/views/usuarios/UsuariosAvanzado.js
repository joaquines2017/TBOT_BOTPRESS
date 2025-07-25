import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { usuariosAPI } from '../../config/api'
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
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CSpinner,
  CAlert,
  CBadge,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CContainer,
  CButtonGroup,
  CTooltip,
  CFormLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPlus,
  cilPencil,
  cilTrash,
  cilHistory,
  cilUserFollow,
  cilLockLocked,
} from '@coreui/icons'
import { useAuth } from '../../contexts/AuthContext'
import AdminRoute from '../../components/AdminRoute'

const UsuariosAvanzado = () => {
  const { user: currentUser } = useAuth()

  // Estados principales
  const [usuarios, setUsuarios] = useState([])
  const [usuariosInactivos, setUsuariosInactivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('activos')

  // Estados para modales
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState('') // 'crear', 'editar', 'desactivar', 'reactivar', 'auditoria'
  const [selectedUser, setSelectedUser] = useState(null)
  const [auditoria, setAuditoria] = useState([])

  // Estados para formularios
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    usuario: '',
    email: '',
    contraseña: '',
    rol: 'tecnico',
    observaciones: '',
  })

  useEffect(() => {
    fetchUsuarios()

    // Escuchar evento de actualización de perfil
    const handleProfileUpdate = () => {
      console.log('🔄 Perfil actualizado, refrescando lista de usuarios...')
      fetchUsuarios()
    }

    window.addEventListener('userProfileUpdated', handleProfileUpdate)

    // Cleanup del event listener
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate)
    }
  }, [])

  const fetchUsuarios = async () => {
    setLoading(true)
    try {
      const [activosRes, inactivosRes] = await Promise.all([
        usuariosAPI.getAll(),
        usuariosAPI.getInactivos(),
      ])

      setUsuarios(activosRes.data)
      setUsuariosInactivos(inactivosRes.data)
      setError(null)
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
      setError('Error al cargar usuarios. Verifique la conexión.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (modalType === 'crear') {
        await usuariosAPI.create({
          ...formData,
          usuarioActual: currentUser.id,
        })
      } else if (modalType === 'editar') {
        await usuariosAPI.update(selectedUser.id, {
          ...formData,
          usuarioActual: currentUser.id,
        })
      }

      await fetchUsuarios()
      closeModal()
    } catch (err) {
      console.error('Error al guardar usuario:', err)
      setError('Error al guardar usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleDesactivar = async () => {
    setLoading(true)
    try {
      await axios.put(`http://192.168.100.250:3003/api/usuarios/${selectedUser.id}/desactivar`, {
        observaciones: formData.observaciones,
        usuarioActual: currentUser.id,
      })

      await fetchUsuarios()
      closeModal()
    } catch (err) {
      console.error('Error al desactivar usuario:', err)
      setError('Error al desactivar usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleReactivar = async () => {
    setLoading(true)
    try {
      await axios.put(`http://192.168.100.250:3003/api/usuarios/${selectedUser.id}/reactivar`, {
        observaciones: formData.observaciones,
        usuarioActual: currentUser.id,
      })

      await fetchUsuarios()
      closeModal()
    } catch (err) {
      console.error('Error al reactivar usuario:', err)
      setError('Error al reactivar usuario')
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditoria = async (usuarioId) => {
    setLoading(true)
    try {
      const response = await axios.get(
        `http://192.168.100.250:3003/api/usuarios/${usuarioId}/auditoria`,
      )
      setAuditoria(response.data)
    } catch (err) {
      console.error('Error al cargar auditoría:', err)
      setError('Error al cargar auditoría')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (type, user = null) => {
    setModalType(type)
    setSelectedUser(user)

    if (type === 'crear') {
      setFormData({
        nombre: '',
        apellido: '',
        usuario: '',
        email: '',
        contraseña: '',
        rol: 'tecnico',
        observaciones: '',
      })
    } else if (type === 'editar' && user) {
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        usuario: user.usuario,
        email: user.email,
        contraseña: '',
        rol: user.rol,
        observaciones: '',
      })
    } else if (type === 'auditoria' && user) {
      fetchAuditoria(user.id)
    }

    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    setModalType('')
    setSelectedUser(null)
    setFormData({
      nombre: '',
      apellido: '',
      usuario: '',
      email: '',
      contraseña: '',
      rol: 'tecnico',
      observaciones: '',
    })
  }

  const getRoleBadge = (rol) => {
    const rolesMap = {
      admin: { color: 'danger', text: 'Administrador' },
      tecnico: { color: 'info', text: 'Técnico' },
      administrativo: { color: 'success', text: 'Administrativo' },
    }

    const roleData = rolesMap[rol] || { color: 'secondary', text: 'Usuario' }
    return <CBadge color={roleData.color}>{roleData.text}</CBadge>
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('es-ES')
  }

  // Control de permisos
  const canManageUsers = currentUser.rol === 'admin'

  if (!canManageUsers) {
    return (
      <CContainer>
        <CRow>
          <CCol>
            <CAlert color="warning">
              <h5>⚠️ Acceso Denegado</h5>
              <p>No tienes permisos para acceder a la gestión de usuarios.</p>
              <p>Solo los administradores pueden gestionar usuarios del sistema.</p>
            </CAlert>
          </CCol>
        </CRow>
      </CContainer>
    )
  }

  return (
    <CContainer fluid>
      {/* Header */}
      <CRow className="mb-4">
        <CCol>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>👥 Gestión de Usuarios</h2>
              <p className="text-muted">Administración completa de usuarios del sistema</p>
            </div>
            <CButton color="primary" onClick={() => openModal('crear')} disabled={loading}>
              <CIcon icon={cilPlus} className="me-2" />
              Nuevo Usuario
            </CButton>
          </div>
        </CCol>
      </CRow>

      {error && (
        <CRow className="mb-4">
          <CCol>
            <CAlert color="danger" dismissible onClose={() => setError(null)}>
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
                    active={activeTab === 'activos'}
                    onClick={() => setActiveTab('activos')}
                    style={{ cursor: 'pointer' }}
                  >
                    👤 Usuarios Activos ({usuarios.length})
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'inactivos'}
                    onClick={() => setActiveTab('inactivos')}
                    style={{ cursor: 'pointer' }}
                  >
                    🚫 Usuarios Inactivos ({usuariosInactivos.length})
                  </CNavLink>
                </CNavItem>
              </CNav>
            </CCardHeader>
            <CCardBody>
              <CTabContent>
                {/* Pestaña: Usuarios Activos */}
                <CTabPane visible={activeTab === 'activos'}>
                  {loading ? (
                    <div className="text-center py-4">
                      <CSpinner color="primary" />
                      <p className="mt-2">Cargando usuarios...</p>
                    </div>
                  ) : (
                    <CTable responsive hover>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>ID</CTableHeaderCell>
                          <CTableHeaderCell>Nombre Completo</CTableHeaderCell>
                          <CTableHeaderCell>Usuario</CTableHeaderCell>
                          <CTableHeaderCell>Email</CTableHeaderCell>
                          <CTableHeaderCell>Rol</CTableHeaderCell>
                          <CTableHeaderCell>Fecha Creación</CTableHeaderCell>
                          <CTableHeaderCell>Última Modificación</CTableHeaderCell>
                          <CTableHeaderCell>Acciones</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {usuarios.map((usuario) => (
                          <CTableRow key={usuario.id}>
                            <CTableDataCell>{usuario.id}</CTableDataCell>
                            <CTableDataCell>
                              <strong>
                                {usuario.nombre} {usuario.apellido}
                              </strong>
                            </CTableDataCell>
                            <CTableDataCell>{usuario.usuario}</CTableDataCell>
                            <CTableDataCell>{usuario.email}</CTableDataCell>
                            <CTableDataCell>{getRoleBadge(usuario.rol)}</CTableDataCell>
                            <CTableDataCell>
                              <div>
                                <small>{formatDate(usuario.fecha_creacion)}</small>
                                {usuario.usuario_creacion_nombre && (
                                  <div>
                                    <small className="text-muted">
                                      por {usuario.usuario_creacion_nombre}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </CTableDataCell>
                            <CTableDataCell>
                              <div>
                                <small>{formatDate(usuario.fecha_modificacion)}</small>
                                {usuario.usuario_modificacion_nombre && (
                                  <div>
                                    <small className="text-muted">
                                      por {usuario.usuario_modificacion_nombre}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </CTableDataCell>
                            <CTableDataCell>
                              <CButtonGroup size="sm">
                                <CTooltip content="Editar usuario">
                                  <CButton
                                    color="info"
                                    variant="outline"
                                    onClick={() => openModal('editar', usuario)}
                                  >
                                    <CIcon icon={cilPencil} />
                                  </CButton>
                                </CTooltip>
                                <CTooltip content="Ver auditoría">
                                  <CButton
                                    color="warning"
                                    variant="outline"
                                    onClick={() => openModal('auditoria', usuario)}
                                  >
                                    <CIcon icon={cilHistory} />
                                  </CButton>
                                </CTooltip>
                                <CTooltip content="Desactivar usuario">
                                  <CButton
                                    color="danger"
                                    variant="outline"
                                    onClick={() => openModal('desactivar', usuario)}
                                    disabled={usuario.id === currentUser.id}
                                  >
                                    <CIcon icon={cilTrash} />
                                  </CButton>
                                </CTooltip>
                              </CButtonGroup>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  )}
                </CTabPane>

                {/* Pestaña: Usuarios Inactivos */}
                <CTabPane visible={activeTab === 'inactivos'}>
                  {loading ? (
                    <div className="text-center py-4">
                      <CSpinner color="primary" />
                      <p className="mt-2">Cargando usuarios inactivos...</p>
                    </div>
                  ) : (
                    <CTable responsive hover>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>ID</CTableHeaderCell>
                          <CTableHeaderCell>Nombre Completo</CTableHeaderCell>
                          <CTableHeaderCell>Usuario</CTableHeaderCell>
                          <CTableHeaderCell>Email</CTableHeaderCell>
                          <CTableHeaderCell>Rol</CTableHeaderCell>
                          <CTableHeaderCell>Fecha Desactivación</CTableHeaderCell>
                          <CTableHeaderCell>Desactivado por</CTableHeaderCell>
                          <CTableHeaderCell>Acciones</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {usuariosInactivos.map((usuario) => (
                          <CTableRow key={usuario.id}>
                            <CTableDataCell>{usuario.id}</CTableDataCell>
                            <CTableDataCell>
                              <strong className="text-muted">
                                {usuario.nombre} {usuario.apellido}
                              </strong>
                            </CTableDataCell>
                            <CTableDataCell className="text-muted">
                              {usuario.usuario}
                            </CTableDataCell>
                            <CTableDataCell className="text-muted">{usuario.email}</CTableDataCell>
                            <CTableDataCell>{getRoleBadge(usuario.rol)}</CTableDataCell>
                            <CTableDataCell>
                              <small>{formatDate(usuario.fecha_desactivacion)}</small>
                            </CTableDataCell>
                            <CTableDataCell>
                              <small>{usuario.usuario_desactivacion_nombre || 'N/A'}</small>
                            </CTableDataCell>
                            <CTableDataCell>
                              <CButtonGroup size="sm">
                                <CTooltip content="Ver auditoría">
                                  <CButton
                                    color="warning"
                                    variant="outline"
                                    onClick={() => openModal('auditoria', usuario)}
                                  >
                                    <CIcon icon={cilHistory} />
                                  </CButton>
                                </CTooltip>
                                <CTooltip content="Reactivar usuario">
                                  <CButton
                                    color="success"
                                    variant="outline"
                                    onClick={() => openModal('reactivar', usuario)}
                                  >
                                    <CIcon icon={cilUserFollow} />
                                  </CButton>
                                </CTooltip>
                              </CButtonGroup>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  )}
                </CTabPane>
              </CTabContent>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal para crear/editar usuario */}
      <CModal
        visible={modalVisible && (modalType === 'crear' || modalType === 'editar')}
        onClose={closeModal}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>
            {modalType === 'crear' ? '➕ Crear Usuario' : '✏️ Editar Usuario'}
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            <CRow>
              <CCol md={6}>
                <CFormInput
                  label="Nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  label="Apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                />
              </CCol>
            </CRow>
            <CRow className="mt-3">
              <CCol md={6}>
                <CFormInput
                  label="Usuario"
                  value={formData.usuario}
                  onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </CCol>
            </CRow>
            <CRow className="mt-3">
              <CCol md={6}>
                <CFormInput
                  label={modalType === 'crear' ? 'Contraseña' : 'Nueva Contraseña (opcional)'}
                  type="password"
                  value={formData.contraseña}
                  onChange={(e) => setFormData({ ...formData, contraseña: e.target.value })}
                  required={modalType === 'crear'}
                />
              </CCol>
              <CCol md={6}>
                <CFormSelect
                  label="Rol"
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  required
                >
                  <option value="tecnico">Técnico</option>
                  <option value="administrativo">Administrativo</option>
                  <option value="admin">Administrador</option>
                </CFormSelect>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={closeModal}>
              Cancelar
            </CButton>
            <CButton color="primary" type="submit" disabled={loading}>
              {loading ? <CSpinner size="sm" /> : modalType === 'crear' ? 'Crear' : 'Guardar'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Modal para desactivar usuario */}
      <CModal visible={modalVisible && modalType === 'desactivar'} onClose={closeModal}>
        <CModalHeader>
          <CModalTitle>🚫 Desactivar Usuario</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            ¿Está seguro que desea desactivar al usuario{' '}
            <strong>
              {selectedUser?.nombre} {selectedUser?.apellido}
            </strong>
            ?
          </p>
          <CFormTextarea
            label="Observaciones (opcional)"
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            placeholder="Motivo de la desactivación..."
            rows={3}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={handleDesactivar} disabled={loading}>
            {loading ? <CSpinner size="sm" /> : 'Desactivar'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para reactivar usuario */}
      <CModal visible={modalVisible && modalType === 'reactivar'} onClose={closeModal}>
        <CModalHeader>
          <CModalTitle>✅ Reactivar Usuario</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            ¿Está seguro que desea reactivar al usuario{' '}
            <strong>
              {selectedUser?.nombre} {selectedUser?.apellido}
            </strong>
            ?
          </p>
          <CFormTextarea
            label="Observaciones (opcional)"
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            placeholder="Motivo de la reactivación..."
            rows={3}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>
            Cancelar
          </CButton>
          <CButton color="success" onClick={handleReactivar} disabled={loading}>
            {loading ? <CSpinner size="sm" /> : 'Reactivar'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para auditoría */}
      <CModal visible={modalVisible && modalType === 'auditoria'} onClose={closeModal} size="xl">
        <CModalHeader>
          <CModalTitle>
            📜 Auditoría de Usuario: {selectedUser?.nombre} {selectedUser?.apellido}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loading ? (
            <div className="text-center py-4">
              <CSpinner color="primary" />
              <p className="mt-2">Cargando auditoría...</p>
            </div>
          ) : (
            <CTable responsive hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Fecha/Hora</CTableHeaderCell>
                  <CTableHeaderCell>Acción</CTableHeaderCell>
                  <CTableHeaderCell>Responsable</CTableHeaderCell>
                  <CTableHeaderCell>Observaciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {auditoria.map((entry, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>
                      <small>{formatDate(entry.fecha_hora)}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge
                        color={
                          entry.accion === 'creado'
                            ? 'success'
                            : entry.accion === 'editado' || entry.accion === 'perfil_editado'
                              ? 'info'
                              : entry.accion === 'desactivado'
                                ? 'danger'
                                : entry.accion === 'reactivado'
                                  ? 'success'
                                  : 'secondary'
                        }
                      >
                        {entry.accion}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{entry.usuario_responsable_nombre || 'Sistema'}</CTableDataCell>
                    <CTableDataCell>
                      <small>{entry.observaciones || 'N/A'}</small>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

const UsuariosAvanzadoProtegido = () => {
  return (
    <AdminRoute>
      <UsuariosAvanzado />
    </AdminRoute>
  )
}

export default UsuariosAvanzadoProtegido
