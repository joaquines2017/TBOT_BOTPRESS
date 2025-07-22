import React from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ element: Component, allowedRoles }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'))

  if (!usuario) return <Navigate to="/login" replace />

  if (!allowedRoles.includes(usuario.rol)) {
    return <Navigate to="/dashboard" replace />
  }

  return Component
}

export default ProtectedRoute
