import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { objetosService } from '../servicios'
import { useAuth } from '../context'
import type { ObjetoPerdido } from '../types'
import Badge from '../components/Badge'
import Alert from '../components/Alert'

export default function ObjetosList() {
  const [objetos, setObjetos] = useState<ObjetoPerdido[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { user } = useAuth()
  const isAdmin = user?.rol === 'Admin'

  const total = objetos.length
  const entregados = objetos.filter((o) => o.estado === 'Entregado').length
  const pendientes = objetos.filter((o) => o.estado === 'Disponible').length

  useEffect(() => {
    objetosService.getAll().then(setObjetos).finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: number) {
    if (!confirm('¿Está seguro de eliminar este objeto?')) return
    try {
      await objetosService.delete(id)
      setObjetos((prev) => prev.filter((o) => o.id !== id))
      setMsg({ type: 'success', text: 'Objeto eliminado correctamente.' })
    } catch {
      setMsg({ type: 'error', text: 'No se pudo eliminar el objeto.' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-[3px] border-uam-200 border-t-uam-700" />
          <p className="text-sm text-gray-400">Cargando objetos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Inventario de Objetos</h1>
          <p className="page-subtitle">Gestión de objetos encontrados en el campus</p>
        </div>
        <Link to="/objetos/registrar" className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Registrar objeto
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
        </div>
        <div className="card py-4 border-l-4 border-emerald-500">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Entregados</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{entregados}</p>
        </div>
        <div className="card py-4 border-l-4 border-uam-600">
          <p className="text-xs font-semibold text-uam-600 uppercase tracking-wider">Pendientes</p>
          <p className="text-3xl font-bold text-uam-700 mt-1">{pendientes}</p>
        </div>
      </div>

      {/* Alerta */}
      {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

      {/* Tabla */}
      {objetos.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-4">📭</div>
          <p className="font-semibold text-gray-700">No hay objetos registrados</p>
          <p className="text-sm text-gray-400 mt-1">Registra el primer objeto encontrado en el campus.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="table-th">#</th>
                  <th className="table-th">Nombre</th>
                  <th className="table-th">Descripción</th>
                  <th className="table-th">Lugar</th>
                  <th className="table-th">F. Registro</th>
                  <th className="table-th">F. Entrega</th>
                  <th className="table-th">Estado</th>
                  {isAdmin && <th className="table-th text-right pr-4">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {objetos.map((obj) => (
                  <tr key={obj.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="table-td">
                      <span className="font-mono text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        #{obj.id}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className="font-semibold text-gray-800">{obj.nombre}</span>
                    </td>
                    <td className="table-td max-w-[200px]">
                      <span className="text-gray-500 truncate block">{obj.descripcion || '—'}</span>
                    </td>
                    <td className="table-td">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                        {obj.lugar}
                      </span>
                    </td>
                    <td className="table-td text-gray-600">{obj.fechaRegistro.split('T')[0]}</td>
                    <td className="table-td text-gray-600">{obj.fechaEntrega ? obj.fechaEntrega.split('T')[0] : <span className="text-gray-300">—</span>}</td>
                    <td className="table-td">
                      <Badge variant={obj.estado === 'Entregado' ? 'success' : 'danger'}>
                        {obj.estado}
                      </Badge>
                    </td>
                    {isAdmin && (
                      <td className="table-td">
                        <div className="flex items-center justify-end gap-1.5 pr-1">
                          <Link
                            to={`/objetos/${obj.id}/modificar`}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-medium transition-colors"
                          >
                            Editar
                          </Link>
                          {obj.estado === 'Disponible' && (
                            <Link
                              to={`/objetos/${obj.id}/entregar`}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-medium transition-colors"
                            >
                              Entregar
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(obj.id)}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 font-medium transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            {total} objeto{total !== 1 ? 's' : ''} en total
          </div>
        </div>
      )}
    </div>
  )
}
