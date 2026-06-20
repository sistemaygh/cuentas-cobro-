import { useNavigate } from 'react-router-dom'
import { Plus, TrendingUp, Clock, Users } from 'lucide-react'
import { useClientes } from '../hooks/useClientes'
import { useCuentas } from '../hooks/useCuentas'
import { useConfig } from '../hooks/useConfig'
import ClienteCard from '../components/ClienteCard'
import { formatCOP } from '../utils/formatters'

export default function Home() {
  const navigate = useNavigate()
  const { clientes, loading: loadingC } = useClientes()
  const { pendientes, totalMes } = useCuentas()
  const { config } = useConfig()

  const fecha = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-blue-900 text-white px-5 pt-12 pb-8">
        {config?.logo ? (
          <img src={config.logo} alt="Logo" className="h-14 object-contain mb-3 rounded-lg bg-white/10 p-1" />
        ) : (
          <h1 className="text-xl font-bold mb-1">
            {config?.nombre || 'Cuentas de Cobro'}
          </h1>
        )}
        <p className="text-blue-200 text-sm capitalize">{fecha}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div
            className="bg-white/10 backdrop-blur rounded-2xl p-3.5 cursor-pointer active:bg-white/20"
            onClick={() => navigate('/pendientes')}
          >
            <div className="flex items-center gap-2 text-amber-300 mb-1">
              <Clock size={16} />
              <span className="text-xs font-medium">Pendientes</span>
            </div>
            <p className="text-2xl font-bold">{pendientes.length}</p>
            <p className="text-xs text-blue-200">cuentas sin cobrar</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-3.5">
            <div className="flex items-center gap-2 text-emerald-300 mb-1">
              <TrendingUp size={16} />
              <span className="text-xs font-medium">Este mes</span>
            </div>
            <p className="text-lg font-bold leading-tight">{formatCOP(totalMes)}</p>
            <p className="text-xs text-blue-200">cobrado</p>
          </div>
        </div>
      </div>

      {/* Clientes fijos */}
      <div className="flex-1 px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Clientes frecuentes</h2>
          <button
            onClick={() => navigate('/clientes')}
            className="text-sm text-blue-700 font-medium"
          >
            Ver todos
          </button>
        </div>

        {loadingC ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-100 rounded-2xl h-40 animate-pulse" />
            ))}
          </div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No hay clientes aún</p>
            <p className="text-sm mt-1">Agrega tu primer cliente en la sección Clientes</p>
            <button
              onClick={() => navigate('/clientes')}
              className="mt-4 px-5 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-medium"
            >
              Agregar cliente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {clientes.map(cliente => (
              <ClienteCard key={cliente.id} cliente={cliente} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/nueva-cuenta')}
        className="fixed bottom-20 right-5 w-14 h-14 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-95 z-40"
        aria-label="Nueva cuenta"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>
    </div>
  )
}
