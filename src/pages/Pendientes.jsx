import { useNavigate } from 'react-router-dom'
import { Clock, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCuentas } from '../hooks/useCuentas'
import { useConfig } from '../hooks/useConfig'
import { cambiarEstado } from '../firebase/cuentas'
import { generarPDF } from '../utils/generarPDF'
import { abrirWhatsApp } from '../utils/whatsapp'
import CuentaCard from '../components/CuentaCard'

export default function Pendientes() {
  const navigate = useNavigate()
  const { pendientes, enviadas, loading } = useCuentas()
  const { config } = useConfig()

  const noCobradas = [...pendientes, ...enviadas]
    .sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion))

  async function handleEstado(id, estado) {
    try {
      await cambiarEstado(id, estado)
      toast.success(estado === 'pagada' ? '¡Marcada como pagada!' : 'Estado actualizado')
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
    if (!cuenta.clienteTelefono) return toast.error('El cliente no tiene número de WhatsApp')
    abrirWhatsApp(cuenta, cuenta.clienteTelefono)
  }

  return (
    <div className="min-h-full">
      <div className="bg-blue-900 text-white px-5 pt-12 pb-6">
        <div className="flex items-center gap-2">
          <Clock size={22} />
          <h1 className="text-xl font-bold">Pendientes de cobro</h1>
        </div>
        <p className="text-blue-200 text-sm mt-1">
          {noCobradas.length} cuenta{noCobradas.length !== 1 ? 's' : ''} sin pagar
        </p>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="bg-slate-100 rounded-2xl h-44 animate-pulse" />)
        ) : noCobradas.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Clock size={56} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-semibold text-slate-600">Todo al día</p>
            <p className="text-sm mt-2">No hay cuentas pendientes de cobro</p>
            <button
              onClick={() => navigate('/nueva-cuenta')}
              className="mt-5 flex items-center gap-2 mx-auto px-5 py-3 bg-blue-900 text-white rounded-xl text-sm font-medium"
            >
              <Plus size={16} /> Nueva cuenta
            </button>
          </div>
        ) : (
          <>
            {pendientes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2 px-1">
                  Pendientes ({pendientes.length})
                </p>
                <div className="space-y-3">
                  {pendientes.map(c => (
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
              </div>
            )}
            {enviadas.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2 px-1 mt-4">
                  Enviadas — esperando pago ({enviadas.length})
                </p>
                <div className="space-y-3">
                  {enviadas.map(c => (
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
