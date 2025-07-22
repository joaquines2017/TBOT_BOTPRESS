import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CSpinner, CContainer } from '@coreui/react'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  // Mostrar spinner mientras se verifica la autenticación
  if (loading) {
    return (
      <CContainer className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <CSpinner color="primary" size="lg" />
          <h4 className="mt-3">Verificando autenticación...</h4>
        </div>
      </CContainer>
    )
  }

  // Si no hay usuario después de la verificación, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute
