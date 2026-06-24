import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { reportesService } from '../services/reportesService'
import type { ReporteRango } from '../types'
import Badge from '../components/Badge'
import Alert from '../components/Alert'

export default function ReportePorRango() {
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [data, setData] = useState<ReporteRango | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await reportesService.getRango(fechaDesde, fechaHasta)
      setData(result)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Error al generar el reporte'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/reportes" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Volver a reportes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Por Rango de Fechas</h1>
      </div>

      <div className="card mb-6">
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="label">Fecha desde</label>
            <input
              type="text"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              placeholder="dd/MM/yyyy"
              className="input w-40"
              required
            />
          </div>
          <div>
            <label className="label">Fecha hasta</label>
            <input
              type="text"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              placeholder="dd/MM/yyyy"
              className="input w-40"
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Cargando...' : '📊 Generar reporte'}
          </button>
        </form>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card border-l-4 border-blue-500">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-2xl font-bold">{data.total}</p>
            </div>
            <div className="card border-l-4 border-green-500">
              <p className="text-xs text-gray-500">Entregados</p>
              <p className="text-2xl font-bold">{data.entregados}</p>
            </div>
            <div className="card border-l-4 border-red-500">
              <p className="text-xs text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold">{data.pendientes}</p>
            </div>
            <div className="card border-l-4 border-purple-500">
              <p className="text-xs text-gray-500">Tasa entrega</p>
              <p className="text-2xl font-bold">{data.tasaEntrega}%</p>
            </div>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-th">#</th>
                    <th className="table-th">Nombre</th>
                    <th className="table-th">Lugar</th>
                    <th className="table-th">F. Registro</th>
                    <th className="table-th">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.objetos.map((obj) => (
                    <tr key={obj.id} className="hover:bg-gray-50">
                      <td className="table-td font-mono text-gray-400">{obj.id}</td>
                      <td className="table-td font-medium">{obj.nombre}</td>
                      <td className="table-td font-mono text-xs">{obj.lugar}</td>
                      <td className="table-td">{obj.fechaRegistro.split('T')[0]}</td>
                      <td className="table-td">
                        <Badge variant={obj.estado === 'Entregado' ? 'success' : 'danger'}>
                          {obj.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
