import { NavLink } from 'react-router-dom'
import { useAuth } from '../context'

interface NavItem {
  to: string
  label: string
  icon: JSX.Element
  adminOnly?: boolean
  group: string
  end?: boolean
}

const HomeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)
const BoxIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
  </svg>
)
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)
const ChartIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const navItems: NavItem[] = [
  { to: '/inicio', label: 'Inicio', icon: <HomeIcon />, group: 'General', end: true },
  { to: '/objetos', label: 'Inventario', icon: <BoxIcon />, group: 'Objetos', end: true },
  { to: '/objetos/registrar', label: 'Registrar', icon: <PlusIcon />, group: 'Objetos' },
  { to: '/objetos/buscar', label: 'Buscar', icon: <SearchIcon />, group: 'Objetos' },
  { to: '/reportes', label: 'Reportes', icon: <ChartIcon />, adminOnly: true, group: 'Administración' },
]

export default function Sidebar() {
  const { user } = useAuth()
  const isAdmin = user?.rol === 'Admin'

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)
  const groups = [...new Set(visibleItems.map((i) => i.group))]

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <nav className="flex-1 py-5 px-3 space-y-5">
        {groups.map((group) => (
          <div key={group}>
            {group !== 'General' && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-2">
                {group}
              </p>
            )}
            <div className="space-y-0.5">
              {visibleItems
                .filter((i) => i.group === group)
                .map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-uam-50 text-uam-800 font-semibold border border-uam-100'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {item.label}
                    {item.adminOnly && (
                      <span className="ml-auto text-[9px] font-bold bg-gold-500 text-white px-1.5 py-0.5 rounded-full">
                        ADMIN
                      </span>
                    )}
                  </NavLink>
                ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Rol en el footer */}
      <div className={`mx-3 mb-4 p-3 rounded-lg ${
        isAdmin ? 'bg-uam-50 border border-uam-200' : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-base">{isAdmin ? '🔑' : '👤'}</span>
          <div>
            <p className={`text-xs font-bold ${isAdmin ? 'text-uam-800' : 'text-gray-700'}`}>
              {isAdmin ? 'Administrador' : 'Usuario'}
            </p>
            <p className="text-[10px] text-gray-400 font-mono">{user?.cif}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
