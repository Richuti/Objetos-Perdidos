import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { reportesService } from '../servicios'
import type { ReporteGeneral as ReporteGeneralType } from '../types'
import Alert from '../components/Alert'

interface KpiCardProps {
  label: string
  value: string | number
  icon: string
  color: string
}

function KpiCard({ label, value, icon, color }: KpiCardProps) {
  return (
    <div className={`card border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

export default function ReporteGeneral() {
  const [data, setData] = useState<ReporteGeneralType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    reportesService
      .getGeneral()
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reporte General</h1>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard label="Total de objetos" value={data.total} icon="📦" color="border-blue-500" />
          <KpiCard label="Entregados" value={data.entregados} icon="✅" color="border-green-500" />
          <KpiCard label="Pendientes" value={data.pendientes} icon="⏳" color="border-red-500" />
          <KpiCard label="Tasa de entrega" value={`${data.tasaEntrega}%`} icon="📈" color="border-purple-500" />
          <KpiCard
            label="Lugar más frecuente"
            value={`${data.lugarFrecuente} (${data.lugarFrecuenteConteo})`}
            icon="📍"
            color="border-amber-500"
          />
        </div>
      )}
    </div>
  )
}
