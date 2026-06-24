import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { objetosService } from '../servicios'
import type { ObjetoPerdido } from '../types'
import Alert from '../components/Alert'
import Badge from '../components/Badge'

export default function ObjetosMarcarEntregado() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [objeto, setObjeto] = useState<ObjetoPerdido | null>(null)
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    objetosService
      .getById(Number(id))
      .then(setObjeto)
      .catch(() => setError('No se pudo cargar el objeto'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await objetosService.marcarEntregado(Number(id), fechaEntrega)
      navigate('/objetos')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Error al marcar como entregado'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marcar como entregado</h1>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {objeto && (
        <div className="card mb-4 bg-blue-50 border-blue-200">
          <h2 className="font-semibold text-gray-800 mb-3">Detalles del objeto</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Nombre:</span>
              <span className="ml-2 font-medium">{objeto.nombre}</span>
            </div>
            <div>
              <span className="text-gray-500">Lugar:</span>
              <span className="ml-2 font-mono text-xs bg-white px-1 rounded">{objeto.lugar}</span>
            </div>
            <div>
              <span className="text-gray-500">Descripción:</span>
              <span className="ml-2">{objeto.descripcion || '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Registro:</span>
              <span className="ml-2">{objeto.fechaRegistro.split('T')[0]}</span>
            </div>
            <div>
              <span className="text-gray-500">Estado:</span>
              <span className="ml-2">
                <Badge variant={objeto.estado === 'Entregado' ? 'success' : 'danger'}>
                  {objeto.estado}
                </Badge>
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Fecha de entrega *</label>
            <input
              type="text"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
              placeholder="dd/MM/yyyy"
              className="input"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              No puede ser anterior a la fecha de registro
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-success" disabled={saving}>
              {saving ? 'Guardando...' : '✅ Confirmar entrega'}
            </button>
            <button type="button" onClick={() => navigate('/objetos')} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
