import { useState } from 'react'
import { Plus, Search, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { crearCliente, actualizarCliente, eliminarCliente } from '../firebase/clientes'
import { useClientes } from '../hooks/useClientes'
import ClienteCard from '../components/ClienteCard'
import Modal from '../components/Modal'

const EMPTY_FORM = {
  nombre: '', tipoDoc: 'nit', nit: '', dv: '',
  direccion: '', ciudad: '', email: '', telefono: '',
  concepto: '', valor: ''
}

export default function Clientes() {
  const { clientes, loading } = useClientes()
  const [busqueda, setBusqueda] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editandoId, setEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const filtrados = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.nit?.includes(busqueda)
  )

  function abrirNuevo() {
    setForm(EMPTY_FORM)
    setEditandoId(null)
    setModalOpen(true)
  }

  function abrirEditar(cliente) {
    setForm({
      nombre: cliente.nombre || '',
      tipoDoc: cliente.tipoDoc || 'nit',
      nit: cliente.nit || '',
      dv: cliente.dv || '',
      direccion: cliente.direccion || '',
      ciudad: cliente.ciudad || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      concepto: cliente.concepto || '',
      valor: cliente.valor || ''
    })
    setEditandoId(cliente.id)
    setModalOpen(true)
  }

  async function confirmarEliminar(cliente) {
    if (!window.confirm(`¿Eliminar a ${cliente.nombre}?`)) return
    try {
      await eliminarCliente(cliente.id)
      toast.success('Cliente eliminado')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  async function guardar() {
    if (!form.nombre.trim()) return toast.error('El nombre es obligatorio')
    setGuardando(true)
    try {
      const datos = { ...form, valor: parseFloat(form.valor) || 0 }
      if (editandoId) {
        await actualizarCliente(editandoId, datos)
        toast.success('Cliente actualizado')
      } else {
        await crearCliente(datos)
        toast.success('Cliente agregado')
      }
      setModalOpen(false)
    } catch {
      toast.error('Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
  const labelCls = 'block text-sm font-medium text-slate-600 mb-1.5'

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-blue-900 text-white px-5 pt-12 pb-6">
        <h1 className="text-xl font-bold">Clientes</h1>
        <p className="text-blue-200 text-sm mt-1">{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar por nombre o NIT..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="bg-slate-100 rounded-2xl h-36 animate-pulse" />)}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">{busqueda ? 'Sin resultados' : 'No hay clientes'}</p>
            <p className="text-sm mt-1">
              {busqueda ? 'Intenta con otro término' : 'Agrega tu primer cliente'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map(c => (
              <ClienteCard
                key={c.id}
                cliente={c}
                showActions
                onEdit={abrirEditar}
                onDelete={confirmarEliminar}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={abrirNuevo}
        className="fixed bottom-20 right-5 w-14 h-14 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-95 z-40"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editandoId ? 'Editar cliente' : 'Nuevo cliente'}
      >
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Nombre completo / Empresa *</label>
            <input className={inputCls} value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Edificio Avalon" />
          </div>

          {/* Tipo doc */}
          <div>
            <label className={labelCls}>Tipo de documento</label>
            <div className="flex gap-2 mb-2">
              {['cc', 'nit'].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, tipoDoc: t }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${form.tipoDoc === t ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {t === 'cc' ? 'C.C.' : 'NIT'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input className={`${inputCls} flex-1`} value={form.nit}
                onChange={e => setForm(f => ({ ...f, nit: e.target.value }))}
                placeholder="800.245.101" />
              <div className="w-20">
                <input className={inputCls} value={form.dv}
                  onChange={e => setForm(f => ({ ...f, dv: e.target.value }))}
                  placeholder="DV" maxLength={2} />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>WhatsApp</label>
            <input className={inputCls} type="tel" value={form.telefono}
              onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
              placeholder="3001234567" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Dirección</label>
              <input className={inputCls} value={form.direccion}
                onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
                placeholder="Calle 65 9 07" />
            </div>
            <div>
              <label className={labelCls}>Ciudad</label>
              <input className={inputCls} value={form.ciudad}
                onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))}
                placeholder="Bogotá" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls} type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="cliente@empresa.com" />
          </div>
          <div>
            <label className={labelCls}>Concepto predeterminado</label>
            <textarea
              className={`${inputCls} min-h-[70px] resize-none`}
              value={form.concepto}
              onChange={e => setForm(f => ({ ...f, concepto: e.target.value }))}
              placeholder="Servicios de contabilidad mensual..." />
          </div>
          <div>
            <label className={labelCls}>Valor predeterminado</label>
            <input className={inputCls} type="number" value={form.valor}
              onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
              placeholder="0" min="0" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium">
              Cancelar
            </button>
            <button onClick={guardar} disabled={guardando}
              className="flex-1 py-3 bg-blue-900 text-white rounded-xl font-medium disabled:opacity-60">
              {guardando ? 'Guardando...' : editandoId ? 'Actualizar' : 'Agregar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
