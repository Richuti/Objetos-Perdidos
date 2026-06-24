import { Link } from 'react-router-dom'

const reportes = [
  {
    to: '/reportes/general',
    icon: '📈',
    title: 'Reporte General',
    description: 'Estadísticas globales: totales, entregados, pendientes y tasa de entrega.',
    color: 'hover:border-uam-300',
    tag: 'Resumen',
  },
  {
    to: '/reportes/rango',
    icon: '📅',
    title: 'Por Rango de Fechas',
    description: 'Filtra objetos registrados dentro de un rango de fechas específico.',
    color: 'hover:border-purple-300',
    tag: 'Filtro',
  },
  {
    to: '/reportes/estados',
    icon: '🥧',
    title: 'Estados',
    description: 'Proporción de objetos entregados vs. pendientes con gráfico circular.',
    color: 'hover:border-emerald-300',
    tag: 'Gráfica',
  },
  {
    to: '/reportes/lugar',
    icon: '📍',
    title: 'Por Lugar',
    description: 'Distribución de objetos según el lugar de hallazgo en el campus.',
    color: 'hover:border-amber-300',
    tag: 'Gráfica',
  },
  {
    to: '/reportes/tendencia',
    icon: '📉',
    title: 'Tendencia Diaria',
    description: 'Evolución día a día de registros y entregas a lo largo del tiempo.',
    color: 'hover:border-blue-300',
    tag: 'Tendencia',
  },
]

export default function ReportesIndex() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Reportes</h1>
        <p className="page-subtitle">Análisis y estadísticas del sistema de objetos perdidos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reportes.map((r) => (
          <Link
            key={r.to}
            to={r.to}
            className={`card group transition-all hover:shadow-md border-2 border-gray-100 ${r.color}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {r.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {r.tag}
              </span>
            </div>
            <h2 className="font-bold text-gray-900 group-hover:text-uam-700 transition-colors">
              {r.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{r.description}</p>
            <div className="mt-4 flex items-center text-xs font-semibold text-uam-700 opacity-0 group-hover:opacity-100 transition-opacity">
              Ver reporte →
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
