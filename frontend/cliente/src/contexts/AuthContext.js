import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

// Configurar interceptor para manejar errores automáticamente
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.warn('🔄 Servidor no disponible, usando modo desarrollo')
      return Promise.reject(error)
    }
    return Promise.reject(error)
  },
)

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')

      console.log('🔄 [AuthContext] Inicializando autenticación:', {
        token: token ? 'presente' : 'ausente',
      })

      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        try {
          console.log(
            '🔍 [AuthContext] Intentando verificar token en: http://192.168.100.254:3003/api/auth/verify',
          )
          const response = await axios.get('http://192.168.100.254:3003/api/auth/verify')
          console.log('✅ [AuthContext] Verificación exitosa:', response.data.user)
          setUser(response.data.user)
        } catch (error) {
          console.error('❌ [AuthContext] Error en verificación:', error)
          console.error('❌ [AuthContext] Error code:', error.code)
          console.error('❌ [AuthContext] Error message:', error.message)
          console.error('❌ [AuthContext] Error response status:', error.response?.status)
          console.error('❌ [AuthContext] Error response data:', error.response?.data)

          // Verificar si es error de conexión (servidor no disponible)
          if (
            error.code === 'ECONNREFUSED' ||
            error.message.includes('Network Error') ||
            !error.response
          ) {
            console.log('🔌 [AuthContext] Servidor no disponible - Error de conexión')
            alert(
              '⚠️ No se puede conectar al servidor. Verifique que el servidor esté ejecutándose en http://192.168.100.254:3003',
            )
            localStorage.clear()
            setUser(null)
            delete axios.defaults.headers.common['Authorization']
          } else if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403)
          ) {
            console.log('🗑️ [AuthContext] Token inválido o expirado, limpiando localStorage')
            alert('🔒 Su sesión ha expirado. Por favor, inicie sesión nuevamente.')
            localStorage.clear()
            setUser(null)
            delete axios.defaults.headers.common['Authorization']
          } else if (error.response && error.response.status === 500) {
            console.log('🚨 [AuthContext] Error interno del servidor (500)')
            console.log('🚨 [AuthContext] Detalles del error:', error.response.data)

            // Si es error de BD, dar más tiempo antes de limpiar la sesión
            if (
              error.response.data?.details?.includes('observaciones') ||
              error.response.data?.details?.includes('column') ||
              error.response.data?.code === '42703'
            ) {
              console.log('🔧 [AuthContext] Error de esquema de BD, reintentando en 5 segundos...')
              setTimeout(() => {
                setLoading(false)
                // No limpiar localStorage inmediatamente, dar oportunidad de que se arregle
              }, 5000)
              return
            } else {
              console.log('🚨 [AuthContext] Error interno crítico, limpiando sesión')
              alert('🚨 Error interno del servidor. Su sesión se ha cerrado por seguridad.')
              localStorage.clear()
              setUser(null)
              delete axios.defaults.headers.common['Authorization']
            }
          } else {
            console.log('⚠️ [AuthContext] Error desconocido, limpiando sesión por seguridad')
            // Por seguridad, ante cualquier error desconocido, limpiar la sesión
            localStorage.clear()
            setUser(null)
            delete axios.defaults.headers.common['Authorization']
          }
        }
      }

      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      console.log('🔐 [AuthContext] Iniciando login para:', credentials.usuario)

      const response = await axios.post('http://192.168.100.254:3003/api/auth/login', credentials)
      const { token, user: userData } = response.data

      console.log('✅ [AuthContext] Login exitoso:', userData)

      // Configurar axios ANTES de guardar
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // Guardar en localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('userData', JSON.stringify(userData))

      // IMPORTANTE: Establecer usuario en estado inmediatamente
      setUser(userData)

      // Verificar datos del servidor después del login para asegurar consistencia
      try {
        const verifyResponse = await axios.get('http://192.168.100.254:3003/api/auth/verify')
        console.log('✅ [AuthContext] Verificación post-login:', verifyResponse.data.user)
        setUser(verifyResponse.data.user)
      } catch (verifyError) {
        console.warn('⚠️ [AuthContext] Error al verificar usuario después del login:', verifyError)
        // Mantener los datos del login si la verificación falla
      }

      return { success: true }
    } catch (error) {
      console.error('❌ [AuthContext] Error en login:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Error al iniciar sesión',
      }
    }
  }

  const logout = () => {
    // Limpiar completamente
    localStorage.clear()
    setUser(null)
    delete axios.defaults.headers.common['Authorization']

    // Forzar recarga completa
    window.location.reload()
  }

  const isAdmin = () => {
    return user?.rol === 'admin'
  }

  const canAccessUserManagement = () => {
    return isAdmin()
  }

  const canEditUser = (userId) => {
    return isAdmin() || user?.id === userId
  }

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await axios.get('http://192.168.100.254:3003/api/auth/verify')
        console.log('🔄 [AuthContext] Usuario actualizado:', response.data.user)
        setUser(response.data.user)
        return response.data.user
      }
    } catch (error) {
      console.error('❌ [AuthContext] Error al refrescar usuario:', error)
    }
  }

  const value = {
    user,
    login,
    logout,
    isAdmin,
    canAccessUserManagement,
    canEditUser,
    refreshUser,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
