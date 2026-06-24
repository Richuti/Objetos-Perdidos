import axios from 'axios'

// Configuración central de axios: todas las peticiones van a /api
// y se envían con cookies de sesión automáticamente
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// ============================================================
// AUTENTICACIÓN
// ============================================================

export const authService = {
  async login(cif: string, password: string) {
    const { data } = await api.post('/auth/login', { cif, password })
    return data
  },

  async logout() {
    await api.post('/auth/logout')
  },

  async getMe() {
    const { data } = await api.get('/auth/me')
    return data
  },
}

// ============================================================
// OBJETOS PERDIDOS
// ============================================================

export const objetosService = {
  async getAll() {
    const { data } = await api.get('/objetos')
    return data
  },

  async getById(id: number) {
    const { data } = await api.get(`/objetos/${id}`)
    return data
  },

  async create(payload: { nombre: string; descripcion: string; lugar: string; fechaRegistro: string }) {
    const { data } = await api.post('/objetos', payload)
    return data
  },

  async update(id: number, payload: { nombre: string; descripcion: string; lugar: string }) {
    await api.put(`/objetos/${id}`, payload)
  },

  async delete(id: number) {
    await api.delete(`/objetos/${id}`)
  },

  async marcarEntregado(id: number, fechaEntrega: string) {
    await api.post(`/objetos/${id}/entregar`, { fechaEntrega })
  },

  async buscar(params: { tipo: string; nombre?: string; fechaDesde?: string; fechaHasta?: string }) {
    const { data } = await api.get('/objetos/buscar', { params })
    return data
  },
}

// ============================================================
// REPORTES (solo admin)
// ============================================================

export const reportesService = {
  async getGeneral() {
    const { data } = await api.get('/reportes/general')
    return data
  },

  async getRango(fechaDesde: string, fechaHasta: string) {
    const { data } = await api.get('/reportes/rango', { params: { fechaDesde, fechaHasta } })
    return data
  },

  async getEstados() {
    const { data } = await api.get('/reportes/estados')
    return data
  },

  async getLugar() {
    const { data } = await api.get('/reportes/lugar')
    return data
  },

  async getTendencia() {
    const { data } = await api.get('/reportes/tendencia')
    return data
  },
}
