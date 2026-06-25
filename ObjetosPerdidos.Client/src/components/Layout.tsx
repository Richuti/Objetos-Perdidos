import { Navigate, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Tutorial from './Tutorial'

export default function Layout() {
  const { user, loading } = useAuth()
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    if (!user) return
    const key = `tutorial_visto_${user.cif}`
    if (!localStorage.getItem(key)) {
      setShowTutorial(true)
    }
  }, [user])

  function handleCloseTutorial() {
    if (user) localStorage.setItem(`tutorial_visto_${user.cif}`, '1')
    setShowTutorial(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* Botón flotante de ayuda */}
      <button
        onClick={() => setShowTutorial(true)}
        title="Ver tutorial de ayuda"
        aria-label="Abrir tutorial"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-110 transition-all flex items-center justify-center text-xl font-bold z-40"
      >
        ?
      </button>

      {showTutorial && <Tutorial rol={user.rol} onClose={handleCloseTutorial} />}
    </div>
  )
}
