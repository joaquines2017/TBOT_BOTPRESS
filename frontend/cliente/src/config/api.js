// Configuración centralizada de la API
import axios from 'axios'

// Obtener la URL base del backend desde las variables de entorno
const getApiBaseUrl = () => {
  // Prioridad: variable de entorno -> detección automática según protocolo
  const envUrl = import.meta.env.VITE_API_BASE_URL

  console.log('🔧 [API Config] Variable de entorno VITE_API_BASE_URL:', envUrl)

  if (envUrl) {
    console.log('✅ [API Config] Usando URL del .env:', envUrl)
    return envUrl
  }

  // Detección automática basada en el protocolo de la página actual
  const protocol = window.location.protocol
  const hostname = window.location.hostname

  console.log('🔧 [API Config] Detección automática - Protocol:', protocol, 'Hostname:', hostname)

  if (protocol === 'https:') {
    // Si estamos en HTTPS, usar HTTPS para el backend también
    if (hostname === 'tbotmpftucuman.ddns.net') {
      const url = 'https://tbotmpftucuman.ddns.net/api'
      console.log('✅ [API Config] Usando URL HTTPS para dominio:', url)
      return url
    }
    // Fallback para HTTPS con IP (poco probable pero por si acaso)
    const url = 'https://192.168.100.250/api'
    console.log('✅ [API Config] Usando URL HTTPS para IP:', url)
    return url
  } else {
    // Si estamos en HTTP (desarrollo local o LAN)
    if (hostname === '192.168.100.250' || hostname === 'tbotmpftucuman.ddns.net') {
      // Usar el proxy de Nginx en el host
      const url = `http://${hostname}/api`
      console.log('✅ [API Config] Usando URL HTTP con proxy Nginx:', url)
      return url
    }
    // Fallback directo al contenedor (desarrollo local)
    const url = 'http://192.168.100.250:3003/api'
    console.log('✅ [API Config] Usando URL HTTP directa al contenedor:', url)
    return url
  }
}

export const API_BASE_URL = getApiBaseUrl()

// Configurar axios con la URL base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para manejar errores automáticamente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.warn('🔄 Servidor no disponible, usando modo desarrollo')
      return Promise.reject(error)
    }
    return Promise.reject(error)
  },
)

// Interceptor para agregar token automáticamente si existe
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default apiClient

// Funciones de conveniencia para endpoints específicos
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  verify: () => apiClient.get('/auth/verify'),
  logout: () => apiClient.post('/auth/logout'),
}

export const usuariosAPI = {
  getAll: () => apiClient.get('/usuarios'),
  getInactivos: () => apiClient.get('/usuarios/inactivos'),
  create: (data) => apiClient.post('/usuarios', data),
  update: (id, data) => apiClient.put(`/usuarios/${id}`, data),
  delete: (id) => apiClient.delete(`/usuarios/${id}`),
}

export const redmineAPI = {
  getTickets: (params) => apiClient.get('/redmine/tickets', { params }),
  getPrioridades: () => apiClient.get('/redmine/prioridades'),
  getMiembros: () => apiClient.get('/redmine/miembros'),
  updateTicket: (id, data) => apiClient.put(`/redmine/tickets/${id}`, data),
}

console.log('🌐 API configurada con URL base:', API_BASE_URL)
