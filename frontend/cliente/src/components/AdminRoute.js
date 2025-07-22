import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CSpinner, CContainer } from '@coreui/react'

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <CContainer className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <CSpinner color="primary" />
      </CContainer>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.rol !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute
