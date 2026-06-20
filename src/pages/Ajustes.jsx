import { useState, useEffect, useRef } from 'react'
import { Settings, Bell, Save, Info, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { guardarConfig } from '../firebase/configApp'
import { useConfig } from '../hooks/useConfig'

const DECL_DEFAULT =
  'Para efectos tributarios declaro:\nSoy persona residente nacional, régimen simplificado.\nDeclaro impuesto de renta y complementarios por patrimonio.\nNo tengo empleados a mi cargo.'

async function resizirLogo(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const MAX_W = 420, MAX_H = 140
        let { width: w, height: h } = img
        if (w > MAX_W) { h = (h * MAX_W) / w; w = MAX_W }
        if (h > MAX_H) { w = (w * MAX_H) / h; h = MAX_H }
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/png', 0.88))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function Ajustes() {
  const { config, loading } = useConfig()
  const fileRef = useRef()
  const [form, setForm] = useState({
    nombre: '', nit: '', tipoDoc: 'cc', dv: '',
    direccion: '', telefono: '', email: '', ciudad: '',
    banco: '', cuentaBancaria: '', tipoCuenta: 'ahorros',
    declaracion: DECL_DEFAULT,
    logo: ''
  })
  const [guardando, setGuardando] = useState(false)
  const [notifPermiso, setNotifPermiso] = useState(Notification.permission)
  const [subiendoLogo, setSubiendoLogo] = useState(false)

  useEffect(() => {
    if (config) {
      setForm({
        nombre: config.nombre || '',
        nit: config.nit || '',
        tipoDoc: config.tipoDoc || 'cc',
        dv: config.dv || '',
        direccion: config.direccion || '',
        telefono: config.telefono || '',
        email: config.email || '',
        ciudad: config.ciudad || '',
        banco: config.banco || '',
        cuentaBancaria: config.cuentaBancaria || '',
        tipoCuenta: config.tipoCuenta || 'ahorros',
        declaracion: config.declaracion || DECL_DEFAULT,
        logo: config.logo || ''
      })
    }
  }, [config])

  function set(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  async function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Solo se aceptan imágenes')
    setSubiendoLogo(true)
    try {
      const b64 = await resizirLogo(file)
      set('logo', b64)
      toast.success('Logo cargado — guarda los ajustes para conservarlo')
    } catch {
      toast.error('Error al procesar el logo')
    } finally {
      setSubiendoLogo(false)
    }
  }

  async function guardar() {
    if (!form.nombre.trim()) return toast.error('El nombre es obligatorio')
    setGuardando(true)
    try {
      await guardarConfig(form)
      toast.success('Ajustes guardados')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  async function solicitarNotificaciones() {
    const permiso = await Notification.requestPermission()
    setNotifPermiso(permiso)
    if (permiso === 'granted') {
      toast.success('Notificaciones activadas')
      new Notification('Cuentas de Cobro', {
        body: 'Las notificaciones están activas.',
        icon: '/icons/icon-192.png'
      })
    } else {
      toast.error('Permiso denegado')
    }
  }

  const inp = 'w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
  const lbl = 'block text-sm font-medium text-slate-600 mb-1.5'

  return (
    <div className="min-h-full">
      <div className="bg-blue-900 text-white px-5 pt-12 pb-6">
        <div className="flex items-center gap-2">
          <Settings size={22} />
          <h1 className="text-xl font-bold">Ajustes</h1>
        </div>
        <p className="text-blue-200 text-sm mt-1">Datos de la contadora para el PDF</p>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">

        {/* ── LOGO ── */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
          <h2 className="font-semibold text-slate-800">Logo / Membrete</h2>
          {form.logo ? (
            <div className="relative">
              <img src={form.logo} alt="Logo" className="max-h-24 object-contain rounded-xl border border-slate-200 bg-slate-50 p-2 w-full" />
              <button
                onClick={() => set('logo', '')}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow border border-slate-200 text-red-500 hover:bg-red-50"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={subiendoLogo}
              className="w-full border-2 border-dashed border-slate-300 rounded-xl py-8 flex flex-col items-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              <Upload size={28} />
              <span className="text-sm font-medium">{subiendoLogo ? 'Procesando...' : 'Subir logo'}</span>
              <span className="text-xs">PNG, JPG o SVG</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          {!form.logo && (
            <button onClick={() => fileRef.current?.click()} className="text-sm text-blue-700 font-medium">
              Seleccionar imagen
            </button>
          )}
        </div>

        {/* ── DATOS PERSONALES ── */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-4">
          <h2 className="font-semibold text-slate-800">Datos de la contadora</h2>

          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)
          ) : (<>
            <div>
              <label className={lbl}>Nombre completo *</label>
              <input className={inp} value={form.nombre}
                onChange={e => set('nombre', e.target.value)} placeholder="Yesenia Gomez Hernandez" />
            </div>

            {/* Tipo doc + Número + DV */}
            <div>
              <label className={lbl}>Tipo y número de documento</label>
              <div className="flex gap-2 mb-2">
                {['cc', 'nit'].map(t => (
                  <button key={t} onClick={() => set('tipoDoc', t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${form.tipoDoc === t ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {t === 'cc' ? 'C.C.' : 'NIT'}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <input className={`${inp} flex-1`} value={form.nit}
                  onChange={e => set('nit', e.target.value)} placeholder="52.729.494" />
                <div className="w-20">
                  <input className={inp} value={form.dv}
                    onChange={e => set('dv', e.target.value)} placeholder="DV" maxLength={2} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Teléfono</label>
                <input className={inp} type="tel" value={form.telefono}
                  onChange={e => set('telefono', e.target.value)} placeholder="3105623661" />
              </div>
              <div>
                <label className={lbl}>Ciudad</label>
                <input className={inp} value={form.ciudad}
                  onChange={e => set('ciudad', e.target.value)} placeholder="Bogotá" />
              </div>
            </div>

            <div>
              <label className={lbl}>Dirección</label>
              <input className={inp} value={form.direccion}
                onChange={e => set('direccion', e.target.value)} placeholder="CRA 5 22C 12 SUR" />
            </div>

            <div>
              <label className={lbl}>Email</label>
              <input className={inp} type="email" value={form.email}
                onChange={e => set('email', e.target.value)} placeholder="contadora@email.com" />
            </div>
          </>)}
        </div>

        {/* ── DATOS BANCARIOS ── */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-4">
          <h2 className="font-semibold text-slate-800">Cuenta bancaria (para el PDF)</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Banco</label>
              <input className={inp} value={form.banco}
                onChange={e => set('banco', e.target.value)} placeholder="Bancolombia" />
            </div>
            <div>
              <label className={lbl}>No. de cuenta</label>
              <input className={inp} value={form.cuentaBancaria}
                onChange={e => set('cuentaBancaria', e.target.value)} placeholder="42854894718" />
            </div>
          </div>
          <div>
            <label className={lbl}>Tipo de cuenta</label>
            <div className="flex gap-2">
              {['ahorros', 'corriente'].map(t => (
                <button key={t} onClick={() => set('tipoCuenta', t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors capitalize ${form.tipoCuenta === t ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── DECLARACIÓN TRIBUTARIA ── */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-3">Declaración tributaria en el PDF</h2>
          <textarea
            className={`${inp} min-h-[110px] resize-none text-sm leading-relaxed`}
            value={form.declaracion}
            onChange={e => set('declaracion', e.target.value)}
          />
          <button
            onClick={() => set('declaracion', DECL_DEFAULT)}
            className="mt-2 text-xs text-blue-700 font-medium"
          >
            Restaurar texto predeterminado
          </button>
        </div>

        {/* ── GUARDAR ── */}
        <button onClick={guardar} disabled={guardando || loading}
          className="flex items-center justify-center gap-2 w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white py-4 rounded-2xl font-semibold transition-colors">
          <Save size={20} />
          {guardando ? 'Guardando...' : 'Guardar ajustes'}
        </button>

        {/* ── NOTIFICACIONES ── */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={18} className="text-blue-900" />
            <h2 className="font-semibold text-slate-800">Notificaciones</h2>
          </div>
          {notifPermiso === 'granted' ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-emerald-600 font-medium text-sm">✓ Notificaciones activas</span>
            </div>
          ) : notifPermiso === 'denied' ? (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">Permiso denegado</p>
              <p className="text-red-500 text-xs mt-1">Habilítalas en la configuración del navegador</p>
            </div>
          ) : (
            <button onClick={solicitarNotificaciones}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-blue-900 text-blue-900 rounded-xl font-medium hover:bg-blue-50">
              <Bell size={18} /> Activar notificaciones
            </button>
          )}
        </div>

        {/* ── INFO ── */}
        <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-slate-500" />
            <span className="font-semibold text-slate-700 text-sm">Firebase</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Configura las credenciales en <code className="bg-white px-1 rounded">.env.local</code>
          </p>
        </div>

        <div className="text-center text-xs text-slate-400 pb-2">
          <p>Cuentas de Cobro v1.0 · PWA React + Firebase</p>
        </div>
      </div>
    </div>
  )
}
