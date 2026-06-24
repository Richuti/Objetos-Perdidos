import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context'
import Layout from './components/Layout'
import Login from './pages/Login'
import ObjetosList from './pages/ObjetosList'
import ObjetosRegistrar from './pages/ObjetosRegistrar'
import ObjetosBuscar from './pages/ObjetosBuscar'
import ObjetosModificar from './pages/ObjetosModificar'
import ObjetosMarcarEntregado from './pages/ObjetosMarcarEntregado'
import ReportesIndex from './pages/ReportesIndex'
import ReporteGeneral from './pages/ReporteGeneral'
import ReportePorRango from './pages/ReportePorRango'
import GraficaEstados from './pages/GraficaEstados'
import GraficaPorLugar from './pages/GraficaPorLugar'
import Tendencia from './pages/Tendencia'
import AdminRoute from './components/AdminRoute'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio" element={<Dashboard />} />
            <Route path="/objetos" element={<ObjetosList />} />
            <Route path="/objetos/registrar" element={<ObjetosRegistrar />} />
            <Route path="/objetos/buscar" element={<ObjetosBuscar />} />
            <Route path="/objetos/:id/modificar" element={<AdminRoute><ObjetosModificar /></AdminRoute>} />
            <Route path="/objetos/:id/entregar" element={<AdminRoute><ObjetosMarcarEntregado /></AdminRoute>} />
            <Route path="/reportes" element={<AdminRoute><ReportesIndex /></AdminRoute>} />
            <Route path="/reportes/general" element={<AdminRoute><ReporteGeneral /></AdminRoute>} />
            <Route path="/reportes/rango" element={<AdminRoute><ReportePorRango /></AdminRoute>} />
            <Route path="/reportes/estados" element={<AdminRoute><GraficaEstados /></AdminRoute>} />
            <Route path="/reportes/lugar" element={<AdminRoute><GraficaPorLugar /></AdminRoute>} />
            <Route path="/reportes/tendencia" element={<AdminRoute><Tendencia /></AdminRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
