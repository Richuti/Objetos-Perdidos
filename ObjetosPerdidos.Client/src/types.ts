export interface ObjetoPerdido {
  id: number
  nombre: string
  descripcion: string
  lugar: string
  fechaRegistro: string
  fechaEntrega: string | null
  estado: 'Disponible' | 'Entregado'
}

export interface User {
  cif: string
  rol: 'Admin' | 'Usuario'
}

export interface ReporteGeneral {
  total: number
  entregados: number
  pendientes: number
  tasaEntrega: number
  lugarFrecuente: string
  lugarFrecuenteConteo: number
}

export interface ReporteRango {
  objetos: ObjetoPerdido[]
  total: number
  entregados: number
  pendientes: number
  tasaEntrega: number
}

export interface ReporteEstados {
  total: number
  entregados: number
  pendientes: number
  porcentajeEntregados: number
  porcentajePendientes: number
}

export interface LugarData {
  lugar: string
  cantidad: number
}

export interface ReporteLugar {
  lugares: LugarData[]
  maximo: number
}

export interface TendenciaDia {
  fecha: string
  registros: number
  entregas: number
}

export interface ReporteTendencia {
  datos: TendenciaDia[]
}
