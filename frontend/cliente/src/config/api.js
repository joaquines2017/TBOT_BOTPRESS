// Configuración centralizada de la API
import axios from 'axios'

// Obtener la URL base del backend desde las variables de entorno
const getApiBaseUrl = () => {
  // Prioridad: variable de entorno -> detección automática según protocolo
  const envUrl = import.meta.env.VITE_API_BASE_URL
  
  if (envUrl) {
    return envUrl
  }
  
  // Detección automática basada en el protocolo de la página actual
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  
  if (protocol === 'https:') {
    // Si estamos en HTTPS, usar HTTPS para el backend también
    if (hostname === 'tbotmpftucuman.ddns.net') {
      return 'https://tbotmpftucuman.ddns.net/api'
    }
    return 'https://192.168.100.250:3003/api'
  } else {
    // Si estamos en HTTP, usar HTTP
    return 'http://192.168.100.250:3003/api'
  }
}

export const API_BASE_URL = getApiBaseUrl()

// Configurar axios con la URL base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
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
  }
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
  }
)

export default apiClient

// Funciones de conveniencia para endpoints específicos
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  verify: () => apiClient.get('/auth/verify'),
  logout: () => apiClient.post('/auth/logout')
}

export const usuariosAPI = {
  getAll: () => apiClient.get('/usuarios'),
  getInactivos: () => apiClient.get('/usuarios/inactivos'),
  create: (data) => apiClient.post('/usuarios', data),
  update: (id, data) => apiClient.put(`/usuarios/${id}`, data),
  delete: (id) => apiClient.delete(`/usuarios/${id}`)
}

export const redmineAPI = {
  getTickets: () => apiClient.get('/redmine/tickets'),
  getPrioridades: () => apiClient.get('/redmine/prioridades'),
  getMiembros: () => apiClient.get('/redmine/miembros'),
  updateTicket: (id, data) => apiClient.put(`/redmine/tickets/${id}`, data)
}

console.log('🌐 API configurada con URL base:', API_BASE_URL)
