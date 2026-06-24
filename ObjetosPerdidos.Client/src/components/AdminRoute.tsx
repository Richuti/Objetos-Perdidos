import { Navigate } from 'react-router-dom'
import { useAuth } from '../context'
import type { ReactNode } from 'react'

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (user?.rol !== 'Admin') return <Navigate to="/objetos" replace />
  return <>{children}</>
}
