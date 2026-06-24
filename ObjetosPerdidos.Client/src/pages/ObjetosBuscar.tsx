import { useState, type FormEvent } from 'react'
import { objetosService } from '../servicios'
import type { ObjetoPerdido } from '../types'
import Badge from '../components/Badge'
import Alert from '../components/Alert'

type TipoBusqueda = 'nombre' | 'fechaRegistro' | 'fechaEntrega'

export default function ObjetosBuscar() {
  const [tipo, setTipo] = useState<TipoBusqueda>('nombre')
  const [nombre, setNombre] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [resultados, setResultados] = useState<ObjetoPerdido[] | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await objetosService.buscar({ tipo, nombre, fechaDesde, fechaHasta })
      setResultados(data)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Error al realizar la búsqueda'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Buscar objetos</h1>
        <p className="text-sm text-gray-500 mt-1">Busca por nombre o rango de fechas</p>
      </div>

      <div className="card mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Tipo de búsqueda</label>
            <div className="flex gap-4">
              {(['nombre', 'fechaRegistro', 'fechaEntrega'] as TipoBusqueda[]).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={t}
                    checked={tipo === t}
                    onChange={() => setTipo(t)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">
                    {t === 'nombre' ? 'Nombre' : t === 'fechaRegistro' ? 'Fecha registro' : 'Fecha entrega'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {tipo === 'nombre' ? (
            <div>
              <label className="label">Nombre del objeto</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Mochila..."
                className="input"
                required
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Fecha desde</label>
                <input
                  type="text"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  placeholder="dd/MM/yyyy"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Fecha hasta</label>
                <input
                  type="text"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  placeholder="dd/MM/yyyy"
                  className="input"
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Buscando...' : '🔎 Buscar'}
          </button>
        </form>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {resultados !== null && (
        <div>
          <p className="text-sm text-gray-500 mb-3">{resultados.length} resultado(s)</p>
          {resultados.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-gray-500">No se encontraron objetos</p>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="table-th">#</th>
                      <th className="table-th">Nombre</th>
                      <th className="table-th">Descripción</th>
                      <th className="table-th">Lugar</th>
                      <th className="table-th">F. Registro</th>
                      <th className="table-th">F. Entrega</th>
                      <th className="table-th">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {resultados.map((obj) => (
                      <tr key={obj.id} className="hover:bg-gray-50">
                        <td className="table-td font-mono text-gray-400">{obj.id}</td>
                        <td className="table-td font-medium">{obj.nombre}</td>
                        <td className="table-td text-gray-500 max-w-xs truncate">{obj.descripcion}</td>
                        <td className="table-td">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {obj.lugar}
                          </span>
                        </td>
                        <td className="table-td">{obj.fechaRegistro.split('T')[0]}</td>
                        <td className="table-td">{obj.fechaEntrega ? obj.fechaEntrega.split('T')[0] : '—'}</td>
                        <td className="table-td">
                          <Badge variant={obj.estado === 'Entregado' ? 'success' : 'danger'}>
                            {obj.estado}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
