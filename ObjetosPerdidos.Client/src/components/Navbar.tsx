import { useAuth } from '../context'
import { useNavigate } from 'react-router-dom'

const UAM_LOGO = 'https://uamvirtual.uam.edu.ni/grado/pluginfile.php/1/theme_space/spacesettingsimgs/0/uam_logo_33_transparente_reduced.gif'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="bg-uam-800 border-b border-uam-900 shadow-md">
      <div className="flex items-center justify-between h-14 px-5">
        {/* Logo + nombre */}
        <div className="flex items-center gap-3">
          <img
            src={UAM_LOGO}
            alt="UAM"
            className="h-9 w-auto"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="hidden sm:block border-l border-uam-600 pl-3">
            <p className="text-white font-bold text-sm leading-tight">Objetos Perdidos</p>
            <p className="text-uam-300 text-xs">Universidad Americana</p>
          </div>
        </div>

        {/* Usuario */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-uam-600 flex items-center justify-center text-white text-xs font-bold">
                {user.cif.slice(0, 2)}
              </div>
              <div className="text-right">
                <p className="text-white text-xs font-semibold leading-tight">{user.cif}</p>
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                  user.rol === 'Admin'
                    ? 'bg-gold-500 text-white'
                    : 'bg-uam-600 text-uam-100'
                }`}>
                  {user.rol}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-uam-200 hover:text-white hover:bg-uam-700 rounded-lg transition-colors border border-uam-600"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
