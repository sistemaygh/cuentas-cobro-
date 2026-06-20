import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCuentas } from '../hooks/useCuentas'
import { useConfig } from '../hooks/useConfig'
import { cambiarEstado } from '../firebase/cuentas'
import { generarPDF } from '../utils/generarPDF'
import { abrirWhatsApp } from '../utils/whatsapp'
import { formatCOP } from '../utils/formatters'
import CuentaCard from '../components/CuentaCard'

export default function Historial() {
  const navigate = useNavigate()
  const { cuentas, loading } = useCuentas()
  const { config } = useConfig()
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroMes, setFiltroMes] = useState('')
  const [filtroBusqueda, setFiltroBusqueda] = useState('')

  const meses = useMemo(() => {
    const set = new Set()
    cuentas.forEach(c => {
      const f = new Date(c.fechaCreacion || c.fecha)
      set.add(`${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`)
    })
    return [...set].sort().reverse()
  }, [cuentas])

  const filtradas = useMemo(() => {
    return cuentas.filter(c => {
      if (filtroEstado !== 'todos' && c.estado !== filtroEstado) return false
      if (filtroMes) {
        const f = new Date(c.fechaCreacion || c.fecha)
        const mes = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`
        if (mes !== filtroMes) return false
      }
      if (filtroBusqueda) {
        const q = filtroBusqueda.toLowerCase()
        if (!c.clienteNombre?.toLowerCase().includes(q) && !c.numero?.includes(q)) return false
      }
      return true
    })
  }, [cuentas, filtroEstado, filtroMes, filtroBusqueda])

  const totalFiltrado = filtradas.reduce((acc, c) => acc + (c.total || 0), 0)

  async function handleEstado(id, estado) {
    try {
      await cambiarEstado(id, estado)
      toast.success('Estado actualizado')
    } catch {
      toast.error('Error al actualizar')
    }
  }

  function handlePDF(cuenta) {
    try {
      generarPDF(cuenta, config || {})
      toast.success('PDF descargado')
    } catch {
      toast.error('Error al generar PDF')
    }
  }

  function handleWhatsApp(cuenta) {
    if (!cuenta.clienteTelefono) return toast.error('Sin número de WhatsApp')
    abrirWhatsApp(cuenta, cuenta.clienteTelefono)
  }

  const estados = ['todos', 'pendiente', 'enviada', 'pagada']

  return (
    <div className="min-h-full">
      <div className="bg-blue-900 text-white px-5 pt-12 pb-6">
        <div className="flex items-center gap-2">
          <FileText size={22} />
          <h1 className="text-xl font-bold">Historial</h1>
        </div>
        <p className="text-blue-200 text-sm mt-1">{cuentas.length} cuentas generadas</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Filtros */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-slate-600">
            <Filter size={16} />
            <span className="text-sm font-medium">Filtros</span>
          </div>

          {/* Búsqueda */}
          <input
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar por cliente o número..."
            value={filtroBusqueda}
            onChange={e => setFiltroBusqueda(e.target.value)}
          />

          {/* Estado */}
          <div className="flex gap-1.5 flex-wrap">
            {estados.map(e => (
              <button
                key={e}
                onClick={() => setFiltroEstado(e)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  filtroEstado === e ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {e === 'todos' ? 'Todos' : e.charAt(0).toUpperCase() + e.slice(1)}
              </button>
            ))}
          </div>

          {/* Mes */}
          {meses.length > 0 && (
            <select
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={filtroMes}
              onChange={e => setFiltroMes(e.target.value)}
            >
              <option value="">Todos los meses</option>
              {meses.map(m => {
                const [y, mo] = m.split('-')
                const label = new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('es-CO', {
                  month: 'long', year: 'numeric'
                })
                return <option key={m} value={m}>{label}</option>
              })}
            </select>
          )}
        </div>

        {/* Resumen */}
        {filtradas.length > 0 && (
          <div className="flex justify-between items-center bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <span className="text-sm text-blue-700">{filtradas.length} cuenta{filtradas.length !== 1 ? 's' : ''}</span>
            <span className="font-bold text-blue-900">{formatCOP(totalFiltrado)}</span>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="bg-slate-100 rounded-2xl h-40 animate-pulse" />)
        ) : filtradas.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">Sin resultados</p>
            <p className="text-sm mt-1">Prueba con otros filtros</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtradas.map(c => (
              <CuentaCard
                key={c.id}
                cuenta={c}
                onDescargarPDF={handlePDF}
                onWhatsApp={handleWhatsApp}
                onCambiarEstado={handleEstado}
                onVerDetalle={() => navigate(`/nueva-cuenta/${c.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
