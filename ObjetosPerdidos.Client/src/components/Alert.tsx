interface AlertProps {
  type: 'success' | 'error' | 'info'
  message: string
  onClose?: () => void
}

const styles = {
  success: { wrapper: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: '✅' },
  error:   { wrapper: 'bg-red-50 border-red-200 text-red-800', icon: '⚠️' },
  info:    { wrapper: 'bg-blue-50 border-blue-200 text-blue-800', icon: 'ℹ️' },
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const s = styles[type]
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${s.wrapper}`}>
      <span className="text-base flex-shrink-0 mt-0.5">{s.icon}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity text-lg leading-none"
        >
          ×
        </button>
      )}
    </div>
  )
}
