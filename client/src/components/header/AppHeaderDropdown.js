import React, { useState } from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilLockLocked,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useAuth } from '../../contexts/AuthContext'
import EditarPerfil from '../EditarPerfil'

const AppHeaderDropdown = () => {
  const { user, logout } = useAuth()
  const [showEditProfile, setShowEditProfile] = useState(false)
  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
          <CAvatar 
            size="md" 
            style={{
              backgroundColor: '#6f42c1',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
          >
            {user ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase() : 'U'}
          </CAvatar>
        </CDropdownToggle>
        <CDropdownMenu className="pt-0" placement="bottom-end">
          <CDropdownHeader className="bg-body-secondary fw-semibold my-2">
            {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
            {user?.email && (
              <div style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#6c757d' }}>
                {user.email}
              </div>
            )}
            {/* Observaciones removidas para evitar conflictos de BD */}
          </CDropdownHeader>
          <CDropdownItem 
            href="#" 
            onClick={(e) => {
              e.preventDefault()
              setShowEditProfile(true)
            }}
          >
            <CIcon icon={cilUser} className="me-2" />
            Editar Perfil
          </CDropdownItem>
          <CDropdownDivider />
          <CDropdownItem
            href="#"
            onClick={(e) => {
              e.preventDefault()
              logout()
            }}
          >
            <CIcon icon={cilLockLocked} className="me-2" />
            Cerrar sesión
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
      
      <EditarPerfil 
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSuccess={() => {
          // Aquí podrías actualizar el contexto del usuario si es necesario
          console.log('Perfil actualizado exitosamente')
        }}
      />
    </>
  )
}

export default AppHeaderDropdown
