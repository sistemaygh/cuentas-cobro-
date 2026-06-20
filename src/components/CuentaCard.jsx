import { formatCOP, formatFechaCorta, ESTADOS } from '../utils/formatters'
import { FileDown, MessageCircle, ChevronRight } from 'lucide-react'

export default function CuentaCard({ cuenta, onDescargarPDF, onWhatsApp, onCambiarEstado, onVerDetalle }) {
  const estado = ESTADOS[cuenta.estado] || ESTADOS.pendiente

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400">#{cuenta.numero}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${estado.color}`}>
              {estado.label}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 mt-1 truncate">{cuenta.clienteNombre}</h3>
          <p className="text-sm text-slate-500 truncate mt-0.5">{cuenta.concepto}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-blue-900">{formatCOP(cuenta.total)}</p>
          <p className="text-xs text-slate-400">{formatFechaCorta(cuenta.fecha)}</p>
        </div>
      </div>

      {/* Estado selector */}
      {onCambiarEstado && (
        <div className="flex gap-1">
          {['pendiente', 'enviada', 'pagada'].map((e) => (
            <button
              key={e}
              onClick={() => onCambiarEstado(cuenta.id, e)}
              className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                cuenta.estado === e
                  ? ESTADOS[e].color + ' ring-2 ring-offset-1 ring-current'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {ESTADOS[e].label}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {onDescargarPDF && (
          <button
            onClick={() => onDescargarPDF(cuenta)}
            className="flex items-center gap-1.5 flex-1 justify-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
          >
            <FileDown size={15} /> PDF
          </button>
        )}
        {onWhatsApp && cuenta.clienteTelefono && (
          <button
            onClick={() => onWhatsApp(cuenta)}
            className="flex items-center gap-1.5 flex-1 justify-center py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium transition-colors"
          >
            <MessageCircle size={15} /> WhatsApp
          </button>
        )}
        {onVerDetalle && (
          <button
            onClick={() => onVerDetalle(cuenta)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
