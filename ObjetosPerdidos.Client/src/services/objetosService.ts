import api from './api'
import type { ObjetoPerdido } from '../types'

export const objetosService = {
  async getAll(): Promise<ObjetoPerdido[]> {
    const { data } = await api.get<ObjetoPerdido[]>('/objetos')
    return data
  },

  async getById(id: number): Promise<ObjetoPerdido> {
    const { data } = await api.get<ObjetoPerdido>(`/objetos/${id}`)
    return data
  },

  async create(payload: {
    nombre: string
    descripcion: string
    lugar: string
    fechaRegistro: string
  }): Promise<ObjetoPerdido> {
    const { data } = await api.post<ObjetoPerdido>('/objetos', payload)
    return data
  },

  async update(
    id: number,
    payload: { nombre: string; descripcion: string; lugar: string }
  ): Promise<void> {
    await api.put(`/objetos/${id}`, payload)
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/objetos/${id}`)
  },

  async marcarEntregado(id: number, fechaEntrega: string): Promise<void> {
    await api.post(`/objetos/${id}/entregar`, { fechaEntrega })
  },

  async buscar(params: {
    tipo: string
    nombre?: string
    fechaDesde?: string
    fechaHasta?: string
  }): Promise<ObjetoPerdido[]> {
    const { data } = await api.get<ObjetoPerdido[]>('/objetos/buscar', { params })
    return data
  },
}
