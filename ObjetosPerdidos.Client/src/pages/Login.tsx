import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context'
import Alert from '../components/Alert'

const UAM_LOGO = 'https://uamvirtual.uam.edu.ni/grado/pluginfile.php/1/theme_space/spacesettingsimgs/0/uam_logo_33_transparente_reduced.gif'

export default function Login() {
  const [cif, setCif] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(cif, password)
      navigate('/inicio')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'CIF o contraseña incorrectos'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — branding UAM */}
      <div className="hidden lg:flex lg:w-1/2 bg-uam-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-uam-700 opacity-40" />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full bg-uam-900 opacity-50" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <img
            src={UAM_LOGO}
            alt="Logo UAM"
            className="h-28 w-auto mb-8 drop-shadow-lg"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <h1 className="text-3xl font-bold text-white leading-tight">
            Sistema de<br />Objetos Perdidos
          </h1>
          <p className="text-uam-200 mt-4 text-sm leading-relaxed max-w-xs">
            Plataforma institucional para el registro y gestión de objetos perdidos en el campus.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6 w-full max-w-xs">
            {[
              { icon: '📦', label: 'Registrar' },
              { icon: '🔎', label: 'Buscar' },
              { icon: '📊', label: 'Reportes' },
            ].map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                  {f.icon}
                </div>
                <span className="text-uam-200 text-xs font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo visible solo en mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={UAM_LOGO} alt="Logo UAM" className="h-20 w-auto"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-900">Iniciar sesión</h2>
              <p className="text-sm text-gray-500 mt-1">Ingresa tus credenciales institucionales</p>
            </div>

            {error && (
              <div className="mb-5">
                <Alert type="error" message={error} onClose={() => setError('')} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">CIF</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">👤</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    value={cif}
                    onChange={(e) => setCif(e.target.value.replace(/\D/g, ''))}
                    placeholder="8 dígitos"
                    className="input pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Contraseña</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                    placeholder="6 dígitos"
                    className="input pl-9"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full h-11 text-base mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Ingresando...
                  </>
                ) : (
                  'Ingresar al sistema'
                )}
              </button>
            </form>

          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Universidad Americana · Sistema Institucional
          </p>
        </div>
      </div>
    </div>
  )
}
