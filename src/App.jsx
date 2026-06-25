import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Home from './pages/Home'
import Clientes from './pages/Clientes'
import NuevaCuenta from './pages/NuevaCuenta'
import Historial from './pages/Historial'
import Pendientes from './pages/Pendientes'
import Ajustes from './pages/Ajustes'

export default function App() {
  return (
    <BrowserRouter basename="/cuentas-cobro-">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '12px', fontSize: '14px' }
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="nueva-cuenta" element={<NuevaCuenta />} />
          <Route path="nueva-cuenta/:cuentaId" element={<NuevaCuenta />} />
          <Route path="historial" element={<Historial />} />
          <Route path="pendientes" element={<Pendientes />} />
          <Route path="ajustes" element={<Ajustes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
