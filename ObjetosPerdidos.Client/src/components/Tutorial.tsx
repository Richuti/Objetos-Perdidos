import { useState } from 'react'

interface TutorialStep {
  icon: string
  title: string
  content: string
}

const stepsAdmin: TutorialStep[] = [
  {
    icon: '👋',
    title: 'Bienvenido al Sistema',
    content:
      'Bienvenido al Sistema de Gestión de Objetos Perdidos de la UAM. Como administrador tienes acceso completo para registrar, gestionar y analizar todos los objetos encontrados en el campus.',
  },
  {
    icon: '📋',
    title: 'Inventario',
    content:
      'En "Inventario" verás todos los objetos registrados. Puedes editar sus datos, marcar objetos como entregados a su dueño o eliminarlos cuando sea necesario.',
  },
  {
    icon: '➕',
    title: 'Registrar Objetos',
    content:
      'Usa "Registrar" para añadir objetos encontrados en el campus. Especifica el nombre, descripción, lugar exacto de hallazgo (aula del campus u otro lugar) y la fecha.',
  },
  {
    icon: '🔎',
    title: 'Búsqueda Avanzada',
    content:
      'En "Buscar" filtra objetos por nombre, por fecha de registro o por fecha de entrega. Al cambiar el tipo de búsqueda los campos se limpian automáticamente para evitar confusiones.',
  },
  {
    icon: '📊',
    title: 'Reportes y Estadísticas',
    content:
      'La sección "Reportes" (exclusiva para admins) incluye estadísticas generales, gráficas de estados, distribución por lugar, tendencia diaria y exportación de todos los datos en un solo PDF.',
  },
  {
    icon: '❓',
    title: '¿Necesitas Ayuda?',
    content:
      'Puedes volver a ver este tutorial en cualquier momento haciendo clic en el botón "?" de la esquina inferior derecha. ¡Que tengas un buen uso del sistema!',
  },
]

const stepsUsuario: TutorialStep[] = [
  {
    icon: '👋',
    title: 'Bienvenido al Sistema',
    content:
      'Bienvenido al Sistema de Gestión de Objetos Perdidos de la UAM. Aquí puedes consultar objetos perdidos y notificar cuando encuentres alguno en el campus.',
  },
  {
    icon: '📋',
    title: 'Inventario',
    content:
      'En "Inventario" encontrarás todos los objetos registrados: nombre, lugar de hallazgo y estado (disponible para recoger o ya entregado a su dueño).',
  },
  {
    icon: '➕',
    title: 'Reportar un Objeto Encontrado',
    content:
      'Si encontraste un objeto perdido en el campus ve a "Registrar". Indica el nombre del objeto, dónde lo encontraste y cuándo. Así su dueño podrá reclamarlo.',
  },
  {
    icon: '🔎',
    title: 'Buscar tu Objeto',
    content:
      'Si perdiste algo ve a "Buscar" e intenta buscarlo por nombre. También puedes filtrar por rango de fechas para ver qué objetos se han encontrado en un periodo determinado.',
  },
  {
    icon: '❓',
    title: '¿Necesitas Ayuda?',
    content:
      'Puedes volver a ver este tutorial en cualquier momento haciendo clic en el botón "?" de la esquina inferior derecha. ¡Buena suerte encontrando tu objeto!',
  },
]

interface Props {
  rol: 'Admin' | 'Usuario'
  onClose: () => void
}

export default function Tutorial({ rol, onClose }: Props) {
  const steps = rol === 'Admin' ? stepsAdmin : stepsUsuario
  const [step, setStep] = useState(0)
  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header con barra de progreso */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-lg leading-none"
            aria-label="Cerrar tutorial"
          >
            ✕
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-3">
            Tutorial · Paso {step + 1} de {steps.length}
          </p>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i <= step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 py-8 text-center">
          <div className="text-6xl mb-4 leading-none">{current.icon}</div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">{current.title}</h2>
          <p className="text-gray-600 leading-relaxed text-sm">{current.content}</p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-between items-center border-t border-gray-100 pt-4">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className={`text-sm font-medium transition-colors ${
              step === 0 ? 'invisible' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ← Anterior
          </button>
          {isLast ? (
            <button onClick={onClose} className="btn-primary text-sm px-8">
              ¡Entendido! →
            </button>
          ) : (
            <button onClick={() => setStep(s => s + 1)} className="btn-primary text-sm px-8">
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
