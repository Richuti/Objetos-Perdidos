import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { reportesService } from '../servicios'
import type { ReporteEstados } from '../types'
import Alert from '../components/Alert'

const COLORS = ['#22c55e', '#ef4444']

export default function GraficaEstados() {
  const [data, setData] = useState<ReporteEstados | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    reportesService
      .getEstados()
      .then(setData)
      .catch(() => setError('Error al cargar el reporte'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const chartData = data
    ? [
        { name: 'Entregados', value: data.entregados },
        { name: 'Pendientes', value: data.pendientes },
      ]
    : []

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/reportes" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Volver a reportes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Gráfica de Estados</h1>
      </div>

      {error && <Alert type="error" message={error} />}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold text-gray-700 mb-4">Distribución</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-700 mb-4">Resumen</h2>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-700 font-medium">Entregados</span>
                <span>{data.entregados} ({data.porcentajeEntregados}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${data.porcentajeEntregados}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-700 font-medium">Pendientes</span>
                <span>{data.pendientes} ({data.porcentajePendientes}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all"
                  style={{ width: `${data.porcentajePendientes}%` }}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Total: <span className="font-semibold text-gray-900">{data.total}</span> objetos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
