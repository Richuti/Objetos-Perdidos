import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { reportesService } from '../services/reportesService'
import type { ReporteTendencia } from '../types'
import Alert from '../components/Alert'

export default function Tendencia() {
  const [data, setData] = useState<ReporteTendencia | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    reportesService
      .getTendencia()
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

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/reportes" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Volver a reportes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tendencia Diaria</h1>
      </div>

      {error && <Alert type="error" message={error} />}

      {data && (
        <div className="card">
          {data.datos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data.datos} margin={{ left: 0, right: 20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="registros"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Registros"
                />
                <Line
                  type="monotone"
                  dataKey="entregas"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Entregas"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  )
}
