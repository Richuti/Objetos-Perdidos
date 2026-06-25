import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { reportesService } from '../servicios'
import type { ReporteLugar } from '../types'
import Alert from '../components/Alert'

export default function GraficaPorLugar() {
  const [data, setData] = useState<ReporteLugar | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    reportesService
      .getLugar()
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
        <h1 className="text-2xl font-bold text-gray-900">Objetos por Lugar</h1>
      </div>

      {error && <Alert type="error" message={error} />}

      {data && (
        <div className="card">
          <div className="mb-6">
            <h2 className="font-bold text-gray-800 text-lg">Distribución por Lugar de Hallazgo</h2>
            <p className="text-sm text-gray-500 mt-0.5">Cantidad de objetos encontrados en cada ubicación del campus</p>
          </div>
          {data.lugares.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(300, data.lugares.length * 40)}>
              <BarChart data={data.lugares} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="lugar" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  )
}
