import { useNavigate } from 'react-router-dom'
import { formatCOP } from '../utils/formatters'
import { Edit2, Trash2, DollarSign } from 'lucide-react'

export default function ClienteCard({ cliente, onEdit, onDelete, showActions = false }) {
  const navigate = useNavigate()

  function cobrar() {
    navigate(`/nueva-cuenta?clienteId=${cliente.id}`)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{cliente.nombre}</h3>
          {cliente.nit && <p className="text-xs text-slate-400 mt-0.5">NIT/CC: {cliente.nit}</p>}
        </div>
        {showActions && (
          <div className="flex gap-1 ml-2 shrink-0">
            <button
              onClick={() => onEdit(cliente)}
              className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(cliente)}
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {cliente.concepto && (
        <p className="text-sm text-slate-500 line-clamp-2 leading-snug">{cliente.concepto}</p>
      )}

      {cliente.valor > 0 && (
        <p className="text-xl font-bold text-blue-900">{formatCOP(cliente.valor)}</p>
      )}

      <button
        onClick={cobrar}
        className="flex items-center justify-center gap-2 w-full bg-blue-900 hover:bg-blue-800 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors active:scale-95"
      >
        <DollarSign size={16} />
        Cobrar
      </button>
    </div>
  )
}
