import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { objetosService } from '../servicios'
import { normalizarFecha } from '../utils'
import Alert from '../components/Alert'

type TipoLugar = 'aula' | 'libre'

const LETRAS = 'ABCDEFGHIJKLMNOP'.split('')

export default function ObjetosRegistrar() {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipoLugar, setTipoLugar] = useState<TipoLugar>('aula')
  const [letra, setLetra] = useState('A')
  const [numeroAula, setNumeroAula] = useState('')
  const [lugarLibre, setLugarLibre] = useState('')
  const [fecha, setFecha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function validarNumeroAula(val: string) {
    const n = parseInt(val)
    if (isNaN(n)) return false
    return n >= 100 && n <= 399
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    let lugar = ''
    if (tipoLugar === 'aula') {
      if (!validarNumeroAula(numeroAula)) {
        setError('El número de aula debe estar entre 100 y 399')
        return
      }
      lugar = `${letra}-${numeroAula}`
    } else {
      lugar = lugarLibre.trim()
    }

    if (!lugar) { setError('El lugar es requerido'); return }

    setLoading(true)
    try {
      await objetosService.create({ nombre, descripcion, lugar, fechaRegistro: normalizarFecha(fecha) })
      navigate('/objetos')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error al registrar el objeto'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const lugarPreview = tipoLugar === 'aula'
    ? (numeroAula ? `${letra}-${numeroAula}` : `${letra}-???`)
    : (lugarLibre || '')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Registrar objeto perdido</h1>
        <p className="page-subtitle">Complete la información del objeto encontrado en el campus</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección 1: Información del objeto */}
        <div className="card">
          <h2 className="text-sm font-bold uppercase tracking-wider text-uam-700 mb-5 pb-3 border-b border-gray-100">
            Información del objeto
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="lg:col-span-2">
              <label className="label">Nombre del objeto *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Mochila negra, Calculadora científica, Llave, etc."
                className="input text-base"
                required
              />
            </div>
            <div className="lg:col-span-2">
              <label className="label">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Características adicionales que ayuden a identificar el objeto: color, marca, contenido, etc."
                rows={4}
                className="input resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Mientras más detalles, más fácil será devolver el objeto a su dueño.
              </p>
            </div>
          </div>
        </div>

        {/* Sección 2: Lugar y fecha */}
        <div className="card">
          <h2 className="text-sm font-bold uppercase tracking-wider text-uam-700 mb-5 pb-3 border-b border-gray-100">
            Lugar y fecha de hallazgo
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lugar */}
            <div>
              <label className="label">Tipo de lugar *</label>
              <div className="flex gap-5 mb-4">
                {(['aula', 'libre'] as TipoLugar[]).map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      value={t}
                      checked={tipoLugar === t}
                      onChange={() => setTipoLugar(t)}
                      className="accent-uam-600 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {t === 'aula' ? 'Aula del campus' : 'Otro lugar'}
                    </span>
                  </label>
                ))}
              </div>

              {tipoLugar === 'aula' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs">Letra (A – P)</label>
                      <select
                        value={letra}
                        onChange={(e) => setLetra(e.target.value)}
                        className="input"
                      >
                        {LETRAS.map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label text-xs">Número (100 – 399)</label>
                      <input
                        type="number"
                        min={100}
                        max={399}
                        value={numeroAula}
                        onChange={(e) => setNumeroAula(e.target.value)}
                        placeholder="Ej: 215"
                        className="input"
                        required={tipoLugar === 'aula'}
                      />
                    </div>
                  </div>
                  {numeroAula && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Aula resultante:</span>
                      <span className="font-mono font-bold text-uam-700 bg-uam-50 px-3 py-1 rounded-lg border border-uam-200 text-base">
                        {lugarPreview}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={lugarLibre}
                  onChange={(e) => setLugarLibre(e.target.value)}
                  placeholder="Ej: Biblioteca, Cafetería, Cancha, Pasillo principal..."
                  className="input"
                  required={tipoLugar === 'libre'}
                />
              )}
            </div>

            {/* Fecha */}
            <div>
              <label className="label">Fecha de registro *</label>
              <input
                type="text"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                placeholder="dd/MM/yyyy"
                className="input max-w-[200px]"
                required
              />
              <p className="text-xs text-gray-400 mt-2">
                Formato: <span className="font-mono">dd/MM/yyyy</span><br />
                No puede ser una fecha futura.
              </p>

              {/* Vista previa del registro */}
              {(nombre || lugarPreview) && (
                <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Vista previa
                  </p>
                  <div className="space-y-1.5 text-sm">
                    {nombre && (
                      <div className="flex gap-2">
                        <span className="text-gray-400 w-20 flex-shrink-0">Objeto:</span>
                        <span className="font-semibold text-gray-800">{nombre}</span>
                      </div>
                    )}
                    {lugarPreview && (
                      <div className="flex gap-2">
                        <span className="text-gray-400 w-20 flex-shrink-0">Lugar:</span>
                        <span className="font-mono text-uam-700">{lugarPreview}</span>
                      </div>
                    )}
                    {fecha && (
                      <div className="flex gap-2">
                        <span className="text-gray-400 w-20 flex-shrink-0">Fecha:</span>
                        <span className="text-gray-700">{fecha}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <button type="submit" className="btn-primary px-8 h-11" disabled={loading}>
            {loading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Registrando...
              </>
            ) : (
              'Registrar objeto'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/objetos')}
            className="btn-secondary h-11"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
