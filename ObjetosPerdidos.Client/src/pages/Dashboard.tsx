import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context'
import { reportesService } from '../services/reportesService'
import type { ReporteGeneral } from '../types'

function StatCard({ label, value, sub, color }: {
  label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className={`card border-l-4 ${color} py-5`}>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function QuickLink({ to, icon, title, description, accent }: {
  to: string; icon: React.ReactNode; title: string; description: string; accent?: boolean
}) {
  return (
    <Link
      to={to}
      className={`card group flex items-start gap-4 transition-all hover:shadow-md border-2 ${
        accent ? 'border-uam-100 hover:border-uam-300' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
        accent ? 'bg-uam-50 text-uam-600' : 'bg-gray-50 text-gray-500'
      }`}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900 group-hover:text-uam-700 transition-colors">
          {title}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
    </Link>
  )
}

const IconBox = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
  </svg>
)
const IconSearch = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)
const IconPlus = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
  </svg>
)
const IconChart = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.rol === 'Admin'
  const [stats, setStats] = useState<ReporteGeneral | null>(null)

  useEffect(() => {
    if (isAdmin) {
      reportesService.getGeneral().then(setStats).catch(() => {})
    }
  }, [isAdmin])

  return (
    <div className="space-y-7">
      {/* Encabezado */}
      <div>
        <h1 className="page-title">Panel de inicio</h1>
        <p className="page-subtitle">
          {isAdmin
            ? 'Gestión completa del sistema de objetos perdidos'
            : 'Registro y consulta de objetos perdidos en el campus'}
        </p>
      </div>

      {/* Estadísticas — solo Admin */}
      {isAdmin && stats && (
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Resumen general
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total registrados" value={stats.total} color="border-gray-300" />
            <StatCard
              label="Entregados"
              value={stats.entregados}
              sub={`${stats.tasaEntrega}% de efectividad`}
              color="border-emerald-500"
            />
            <StatCard label="Pendientes" value={stats.pendientes} color="border-uam-500" />
            <StatCard
              label="Lugar frecuente"
              value={stats.lugarFrecuente}
              sub={`${stats.lugarFrecuenteConteo} registros`}
              color="border-amber-400"
            />
          </div>
        </section>
      )}

      {/* Acciones */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Acciones
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickLink
            to="/objetos/registrar"
            icon={<IconPlus />}
            title="Registrar objeto"
            description="Registra un nuevo objeto encontrado en el campus."
            accent
          />
          <QuickLink
            to="/objetos/buscar"
            icon={<IconSearch />}
            title="Buscar objeto"
            description="Busca por nombre o por rango de fechas."
          />
          <QuickLink
            to="/objetos"
            icon={<IconBox />}
            title="Inventario"
            description={
              isAdmin
                ? 'Lista completa con opciones de edición y entrega.'
                : 'Consulta todos los objetos registrados.'
            }
          />
          {isAdmin && (
            <QuickLink
              to="/reportes"
              icon={<IconChart />}
              title="Reportes"
              description="Estadísticas, gráficas y análisis del sistema."
              accent
            />
          )}
        </div>
      </section>

      {/* Accesos rápidos a reportes — solo Admin */}
      {isAdmin && (
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Reportes rápidos
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { to: '/reportes/general', label: 'General' },
              { to: '/reportes/rango', label: 'Por rango' },
              { to: '/reportes/estados', label: 'Estados' },
              { to: '/reportes/lugar', label: 'Por lugar' },
              { to: '/reportes/tendencia', label: 'Tendencia' },
            ].map((r) => (
              <Link
                key={r.to}
                to={r.to}
                className="px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-uam-300 hover:bg-uam-50 transition-all text-sm font-medium text-gray-700 hover:text-uam-700 text-center"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
