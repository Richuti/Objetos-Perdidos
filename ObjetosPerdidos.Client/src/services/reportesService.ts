import api from './api'
import type {
  ReporteGeneral,
  ReporteRango,
  ReporteEstados,
  ReporteLugar,
  ReporteTendencia,
} from '../types'

export const reportesService = {
  async getGeneral(): Promise<ReporteGeneral> {
    const { data } = await api.get<ReporteGeneral>('/reportes/general')
    return data
  },

  async getRango(fechaDesde: string, fechaHasta: string): Promise<ReporteRango> {
    const { data } = await api.get<ReporteRango>('/reportes/rango', {
      params: { fechaDesde, fechaHasta },
    })
    return data
  },

  async getEstados(): Promise<ReporteEstados> {
    const { data } = await api.get<ReporteEstados>('/reportes/estados')
    return data
  },

  async getLugar(): Promise<ReporteLugar> {
    const { data } = await api.get<ReporteLugar>('/reportes/lugar')
    return data
  },

  async getTendencia(): Promise<ReporteTendencia> {
    const { data } = await api.get<ReporteTendencia>('/reportes/tendencia')
    return data
  },
}
