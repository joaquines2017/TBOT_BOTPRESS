import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CButton,
  CAlert,
  CSpinner,
  CRow,
  CCol,
} from '@coreui/react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const EditarPerfil = ({ visible, onClose, onSuccess }) => {
  const { user, logout, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    contraseña: '',
    confirmarContraseña: '',
  })

  // Efecto para cargar datos cuando se abre el modal
  useEffect(() => {
    if (visible && user && user.id) {
      // Cargar datos del perfil desde el servidor
      const cargarPerfil = async () => {
        try {
          setLoading(true)
          const token = localStorage.getItem('token')
          const response = await axios.get(
            `http://192.168.100.250:3003/api/usuarios/${user.id}/perfil`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          const userData = response.data

          setFormData({
            nombre: userData.nombre || '',
            apellido: userData.apellido || '',
            email: userData.email || '',
            contraseña: '',
            confirmarContraseña: '',
          })

          console.log('Perfil cargado desde servidor:', userData)
          setError(null)
          setSuccess(false)
        } catch (error) {
          console.error('Error al cargar perfil:', error)
          setError('Error al cargar los datos del perfil')

          // Fallback: usar datos del contexto si falla la carga
          const userData = {
            nombre: user.nombre || '',
            apellido: user.apellido || '',
            email: user.email || '',
            contraseña: '',
            confirmarContraseña: '',
          }
          setFormData(userData)
        } finally {
          setLoading(false)
        }
      }

      cargarPerfil()
    } else if (visible && !user) {
      // Si no hay usuario, limpiar el formulario
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        contraseña: '',
        confirmarContraseña: '',
      })
    }
  }, [visible, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validaciones
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.email.trim()) {
      setError('Nombre, apellido y email son obligatorios')
      setLoading(false)
      return
    }

    if (formData.contraseña && formData.contraseña !== formData.confirmarContraseña) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      const dataToSend = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
      }

      // Solo incluir contraseña si se proporcionó
      if (formData.contraseña) {
        dataToSend.contraseña = formData.contraseña
      }

      const token = localStorage.getItem('token')
      await axios.put(`http://192.168.100.250:3003/api/usuarios/${user.id}/perfil`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setSuccess(true)

      // Actualizar los datos del usuario en el contexto
      await refreshUser()

      // Disparar evento personalizado para que otros componentes se actualicen
      window.dispatchEvent(
        new CustomEvent('userProfileUpdated', {
          detail: { userId: user.id },
        }),
      )

      if (onSuccess) {
        onSuccess()
      }

      // Si se cambió la contraseña, hacer logout automático después de mostrar el mensaje
      if (formData.contraseña) {
        setTimeout(() => {
          onClose()
          // Mostrar mensaje antes del logout
          setTimeout(() => {
            alert(
              'Contraseña actualizada. Por seguridad, debes iniciar sesión nuevamente con tu nueva contraseña.',
            )
            logout()
          }, 500)
        }, 1500)
      } else {
        // Si no se cambió contraseña, solo cerrar modal
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    } catch (err) {
      console.error('Error al actualizar perfil:', err)
      setError(err.response?.data?.error || 'Error al actualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader>
        <CModalTitle>Editar Mi Perfil</CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          {error && (
            <CAlert color="danger" className="mb-3">
              {error}
            </CAlert>
          )}
          {success && (
            <CAlert color="success" className="mb-3">
              {formData.contraseña
                ? '✅ Perfil y contraseña actualizados exitosamente. Serás redirigido al login por seguridad.'
                : '✅ Perfil actualizado exitosamente'}
            </CAlert>
          )}

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="nombre">Nombre *</CFormLabel>
              <CFormInput
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ingrese su nombre"
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="apellido">Apellido *</CFormLabel>
              <CFormInput
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Ingrese su apellido"
                required
              />
            </CCol>
          </CRow>

          <div className="mb-3">
            <CFormLabel htmlFor="email">Email *</CFormLabel>
            <CFormInput
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ingrese su email"
              required
            />
          </div>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="contraseña">Nueva Contraseña</CFormLabel>
              <CFormInput
                type="password"
                id="contraseña"
                name="contraseña"
                value={formData.contraseña}
                onChange={handleChange}
                placeholder="Dejar vacío para mantener actual"
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="confirmarContraseña">Confirmar Contraseña</CFormLabel>
              <CFormInput
                type="password"
                id="confirmarContraseña"
                name="confirmarContraseña"
                value={formData.confirmarContraseña}
                onChange={handleChange}
                placeholder="Confirme la nueva contraseña"
              />
            </CCol>
          </CRow>

          {/* Campo de observaciones removido para evitar conflictos de BD */}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Cancelar
          </CButton>
          <CButton color="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Actualizando...
              </>
            ) : (
              'Actualizar Perfil'
            )}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default EditarPerfil
