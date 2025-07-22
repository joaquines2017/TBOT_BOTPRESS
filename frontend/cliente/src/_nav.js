import React from 'react'
import { cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { cilList } from '@coreui/icons'
import {
  cilSpeedometer,
} from '@coreui/icons'
import { CNavItem } from '@coreui/react'
import { cilSpreadsheet } from '@coreui/icons'

const getNavigation = (user) => {
  const baseNav = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      badge: {
        color: 'info',
        text: 'NEW',
      },
    },
    {
      component: CNavItem,
      name: 'Tickets',
      to: '/tickets',
      icon: <CIcon icon={cilList} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Reporte',
      to: '/reportes/personalizado',
      icon: <CIcon icon={cilSpreadsheet} customClassName="nav-icon" />,
    },
  ]

  // Verificar si es admin basándose únicamente en el rol
  const isAdmin = user && (user.rol === 'admin' || user.rol === 'Administrator')
  
  console.log('🔍 [_nav.js] Verificando admin:', {
    user: user ? {
      id: user.id,
      usuario: user.usuario,
      rol: user.rol,
      nombre: user.nombre
    } : null,
    isAdmin,
    userRol: user?.rol,
    comparison: user?.rol === 'admin',
    typeofRol: typeof user?.rol
  })

  if (isAdmin) {
    baseNav.push({
      component: CNavItem,
      name: 'Usuarios',
      to: '/usuarios',
      icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    })
  }

  return baseNav
}

export default getNavigation
