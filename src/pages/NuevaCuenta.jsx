import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, FileDown, MessageCircle, Save, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { crearCuenta, actualizarCuenta, obtenerCuenta } from '../firebase/cuentas'
import { obtenerCliente } from '../firebase/clientes'
import { useClientes } from '../hooks/useClientes'
import { useConfig } from '../hooks/useConfig'
import { generarPDF } from '../utils/generarPDF'
import { abrirWhatsApp } from '../utils/whatsapp'
import { hoy, formatCOP } from '../utils/formatters'

const EMPTY = {
  fecha: hoy(),
  clienteId: '',
  clienteNombre: '',
  clienteTipoDoc: 'nit',
  clienteNit: '',
  clienteDv: '',
  clienteDireccion: '',
  clienteCiudad: '',
  clienteEmail: '',
  clienteTelefono: '',
  concepto: '',
  valor: '',
  conRetencion: false,
  retencionPorcentaje: 11,
  conIva: false,
  ivaPorcentaje: 19,
  estado: 'pendiente',
  notas: ''
}

function calcularTotales(valor, conRetencion, pctRet, conIva, pctIva) {
  const v = parseFloat(valor) || 0
  const retencion = conRetencion ? Math.round(v * (pctRet / 100)) : 0
  const iva = conIva ? Math.round(v * (pctIva / 100)) : 0
  return { retencion, iva, total: v - retencion + iva }
}

export default function NuevaCuenta() {
  const navigate = useNavigate()
  const { cuentaId } = useParams()
  const [searchParams] = useSearchParams()
  const { clientes } = useClientes()
  const { config } = useConfig()

  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [showClienteSelect, setShowClienteSelect] = useState(false)
  const [cuentaGuardada, setCuentaGuardada] = useState(null)
  const editando = Boolean(cuentaId)

  useEffect(() => {
    if (cuentaId) {
      obtenerCuenta(cuentaId).then(c => {
        if (c) {
          setForm({
            fecha: c.fecha || hoy(),
            clienteId: c.clienteId || '',
            clienteNombre: c.clienteNombre || '',
            clienteTipoDoc: c.clienteTipoDoc || 'nit',
            clienteNit: c.clienteNit || '',
            clienteDv: c.clienteDv || '',
            clienteDireccion: c.clienteDireccion || '',
            clienteCiudad: c.clienteCiudad || '',
            clienteEmail: c.clienteEmail || '',
            clienteTelefono: c.clienteTelefono || '',
            concepto: c.concepto || '',
            valor: c.valor || '',
            conRetencion: (c.retencion || 0) > 0,
            retencionPorcentaje: c.retencionPorcentaje || 11,
            conIva: (c.iva || 0) > 0,
            ivaPorcentaje: c.ivaPorcentaje || 19,
            estado: c.estado || 'pendiente',
            notas: c.notas || ''
          })
          setCuentaGuardada(c)
        }
      })
    } else {
      const clienteId = searchParams.get('clienteId')
      if (clienteId) {
        obtenerCliente(clienteId).then(c => {
          if (c) precargarCliente(c)
        })
      }
    }
  }, [cuentaId, searchParams])

  function precargarCliente(c) {
    setForm(f => ({
      ...f,
      clienteId: c.id,
      clienteNombre: c.nombre || '',
      clienteTipoDoc: c.tipoDoc || 'nit',
      clienteNit: c.nit || '',
      clienteDv: c.dv || '',
      clienteDireccion: c.direccion || '',
      clienteCiudad: c.ciudad || '',
      clienteEmail: c.email || '',
      clienteTelefono: c.telefono || '',
      concepto: c.concepto || f.concepto,
      valor: c.valor || f.valor
    }))
  }

  function set(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  const { retencion, iva, total } = calcularTotales(
    form.valor, form.conRetencion, form.retencionPorcentaje,
    form.conIva, form.ivaPorcentaje
  )

  async function guardar() {
    if (!form.clienteNombre.trim()) return toast.error('El nombre del cliente es obligatorio')
    if (!form.concepto.trim()) return toast.error('El concepto es obligatorio')
    if (!form.valor || parseFloat(form.valor) <= 0) return toast.error('El valor debe ser mayor a 0')

    setSaving(true)
    try {
      const datos = {
        ...form,
        valor: parseFloat(form.valor),
        retencion,
        iva,
        total,
        clienteId: form.clienteId || null
      }
      let resultado
      if (editando) {
        await actualizarCuenta(cuentaId, datos)
        resultado = { id: cuentaId, ...datos, numero: cuentaGuardada?.numero }
        toast.success('Cuenta actualizada')
      } else {
        resultado = await crearCuenta(datos)
        toast.success(`Cuenta #${resultado.numero} creada`)
      }
      setCuentaGuardada(resultado)
    } catch (e) {
      toast.error('Error al guardar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  function handlePDF() {
    if (!cuentaGuardada) return toast.error('Guarda la cuenta primero')
    try {
      generarPDF(cuentaGuardada, config || {})
      toast.success('PDF descargado')
    } catch {
      toast.error('Error al generar PDF')
    }
  }

  function handleWhatsApp() {
    if (!cuentaGuardada) return toast.error('Guarda la cuenta primero')
    if (!form.clienteTelefono) return toast.error('El cliente no tiene número de WhatsApp')
    abrirWhatsApp(cuentaGuardada, form.clienteTelefono)
  }

  const inputCls = 'w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base'
  const labelCls = 'block text-sm font-medium text-slate-600 mb-1.5'

  function Toggle({ active, onToggle, label, sublabel }) {
    return (
      <div className="flex items-center justify-between py-1">
        <div>
          <p className="text-sm font-medium text-slate-700">{label}</p>
          <p className="text-xs text-slate-400">{sublabel}</p>
        </div>
        <button
          onClick={onToggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${active ? 'bg-blue-600' : 'bg-slate-200'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-6' : ''}`} />
        </button>
      </div>
    )
  }

  const v = parseFloat(form.valor) || 0

  return (
    <div className="min-h-full bg-slate-50">
      {/* Header */}
      <div className="bg-blue-900 text-white px-4 pt-12 pb-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-white/10">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold flex-1">{editando ? 'Editar cuenta' : 'Nueva cuenta'}</h1>
        {cuentaGuardada && (
          <span className="text-blue-200 text-sm font-medium">#{cuentaGuardada.numero}</span>
        )}
      </div>

      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
        {/* Selector de cliente */}
        <div>
          <label className={labelCls}>Cliente *</label>
          <button
            onClick={() => setShowClienteSelect(s => !s)}
            className={`${inputCls} text-left flex justify-between items-center`}
          >
            <span className={form.clienteNombre ? 'text-slate-800' : 'text-slate-400'}>
              {form.clienteNombre || 'Seleccionar cliente frecuente'}
            </span>
            <ChevronDown size={18} className="text-slate-400 shrink-0" />
          </button>
          {showClienteSelect && clientes.length > 0 && (
            <div className="mt-1 border border-slate-200 rounded-xl bg-white shadow-lg max-h-48 overflow-y-auto z-10 relative">
              {clientes.map(c => (
                <button
                  key={c.id}
                  onClick={() => { precargarCliente(c); setShowClienteSelect(false) }}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-0"
                >
                  <p className="font-medium text-slate-800">{c.nombre}</p>
                  {c.nit && <p className="text-xs text-slate-400">NIT: {c.nit}</p>}
                </button>
              ))}
              <button
                onClick={() => setShowClienteSelect(false)}
                className="w-full text-left px-4 py-3 text-sm text-slate-400 hover:bg-slate-50"
              >
                Ingresar manualmente ↓
              </button>
            </div>
          )}
        </div>

        {/* Datos del cliente */}
        <div className="bg-white rounded-2xl p-4 space-y-3 border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">Datos del cliente</p>
          <div>
            <label className={labelCls}>Nombre completo / Empresa *</label>
            <input className={inputCls} value={form.clienteNombre}
              onChange={e => set('clienteNombre', e.target.value)} placeholder="Edificio Avalon" />
          </div>

          {/* Tipo doc + No. Identificación + DV */}
          <div>
            <label className={labelCls}>Tipo de documento</label>
            <div className="flex gap-2 mb-2">
              {['cc', 'nit'].map(t => (
                <button key={t} onClick={() => set('clienteTipoDoc', t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${form.clienteTipoDoc === t ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {t === 'cc' ? 'C.C.' : 'NIT'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input className={`${inputCls} flex-1`} value={form.clienteNit}
                onChange={e => set('clienteNit', e.target.value)} placeholder="800.245.101" />
              <div className="w-20">
                <input className={inputCls} value={form.clienteDv}
                  onChange={e => set('clienteDv', e.target.value)} placeholder="DV" maxLength={2} />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>WhatsApp</label>
            <input className={inputCls} type="tel" value={form.clienteTelefono}
              onChange={e => set('clienteTelefono', e.target.value)} placeholder="3001234567" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Dirección</label>
              <input className={inputCls} value={form.clienteDireccion}
                onChange={e => set('clienteDireccion', e.target.value)} placeholder="Calle 65 9 07" />
            </div>
            <div>
              <label className={labelCls}>Ciudad</label>
              <input className={inputCls} value={form.clienteCiudad}
                onChange={e => set('clienteCiudad', e.target.value)} placeholder="Bogotá" />
            </div>
          </div>
        </div>

        {/* Concepto y valor */}
        <div className="bg-white rounded-2xl p-4 space-y-3 border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">Concepto y valor</p>
          <div>
            <label className={labelCls}>Fecha *</label>
            <input className={inputCls} type="date" value={form.fecha}
              onChange={e => set('fecha', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Concepto *</label>
            <textarea className={`${inputCls} min-h-[80px] resize-none`} value={form.concepto}
              onChange={e => set('concepto', e.target.value)}
              placeholder="Servicios de contabilidad y asesoría tributaria..." />
          </div>
          <div>
            <label className={labelCls}>Valor honorarios *</label>
            <input className={`${inputCls} text-lg font-bold`} type="number" value={form.valor}
              onChange={e => set('valor', e.target.value)} placeholder="0" min="0" />
          </div>

          {/* Toggle Retención */}
          <div className="border-t border-slate-100 pt-2 space-y-3">
            <Toggle
              active={form.conRetencion}
              onToggle={() => set('conRetencion', !form.conRetencion)}
              label="Retención en la fuente"
              sublabel={`Descuenta ${form.retencionPorcentaje}% del valor (honorarios)`}
            />
            {form.conRetencion && (
              <div className="flex items-center gap-3 pl-1">
                <label className="text-sm text-slate-500 shrink-0">Porcentaje:</label>
                <div className="flex gap-2">
                  {[11, 10, 3.5, 2].map(p => (
                    <button
                      key={p}
                      onClick={() => set('retencionPorcentaje', p)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        form.retencionPorcentaje === p
                          ? 'bg-blue-900 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Toggle IVA */}
            <Toggle
              active={form.conIva}
              onToggle={() => set('conIva', !form.conIva)}
              label="IVA"
              sublabel={`Agrega ${form.ivaPorcentaje}% sobre el valor`}
            />
            {form.conIva && (
              <div className="flex items-center gap-3 pl-1">
                <label className="text-sm text-slate-500 shrink-0">Porcentaje:</label>
                <div className="flex gap-2">
                  {[19, 5].map(p => (
                    <button
                      key={p}
                      onClick={() => set('ivaPorcentaje', p)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        form.ivaPorcentaje === p
                          ? 'bg-blue-900 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Totales */}
          <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 border border-slate-100">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Honorarios</span>
              <span>{formatCOP(v)}</span>
            </div>
            {form.conRetencion && (
              <div className="flex justify-between text-sm text-red-600">
                <span>(-) Retención {form.retencionPorcentaje}%</span>
                <span>- {formatCOP(retencion)}</span>
              </div>
            )}
            {form.conIva && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>(+) IVA {form.ivaPorcentaje}%</span>
                <span>+ {formatCOP(iva)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-blue-900 text-base pt-1.5 border-t border-slate-200">
              <span>Neto a recibir</span>
              <span>{formatCOP(total)}</span>
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <p className="text-sm font-semibold text-slate-700 mb-3">Estado de la cuenta</p>
          <div className="flex gap-2">
            {['pendiente', 'enviada', 'pagada'].map(e => (
              <button
                key={e}
                onClick={() => set('estado', e)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                  form.estado === e
                    ? 'bg-blue-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {e.charAt(0).toUpperCase() + e.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className={labelCls}>Notas internas (opcional)</label>
          <textarea className={`${inputCls} min-h-[70px] resize-none`} value={form.notas}
            onChange={e => set('notas', e.target.value)} placeholder="Observaciones..." />
        </div>

        {/* Acciones */}
        <div className="space-y-3 pb-4">
          <button
            onClick={guardar}
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white py-4 rounded-2xl font-semibold text-base transition-colors active:scale-95"
          >
            <Save size={20} />
            {saving ? 'Guardando...' : editando ? 'Actualizar cuenta' : 'Guardar cuenta'}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePDF}
              className="flex items-center justify-center gap-2 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-medium transition-colors"
            >
              <FileDown size={18} /> Descargar PDF
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-medium transition-colors"
            >
              <MessageCircle size={18} /> WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
