import { db } from './config'
import { ref, push, set, update, remove, onValue, runTransaction, get } from 'firebase/database'

async function siguienteConsecutivo() {
  const r = ref(db, 'config/consecutivo')
  let numero = null
  await runTransaction(r, (current) => {
    numero = (current || 0) + 1
    return numero
  })
  return String(numero).padStart(4, '0')
}

export async function crearCuenta(datos) {
  const numero = await siguienteConsecutivo()
  const r = ref(db, 'cuentas')
  const newRef = push(r)
  const cuenta = {
    ...datos,
    numero,
    fechaCreacion: new Date().toISOString(),
    estado: datos.estado || 'pendiente'
  }
  await set(newRef, cuenta)
  return { id: newRef.key, ...cuenta }
}

export async function actualizarCuenta(id, datos) {
  const r = ref(db, `cuentas/${id}`)
  await update(r, datos)
}

export async function cambiarEstado(id, estado) {
  const r = ref(db, `cuentas/${id}`)
  const extra = {}
  if (estado === 'enviada') extra.fechaEnvio = new Date().toISOString()
  if (estado === 'pagada') extra.fechaPago = new Date().toISOString()
  await update(r, { estado, ...extra })
}

export async function eliminarCuenta(id) {
  const r = ref(db, `cuentas/${id}`)
  await remove(r)
}

export function suscribirCuentas(callback) {
  const r = ref(db, 'cuentas')
  return onValue(r, (snap) => {
    const data = snap.val() || {}
    const lista = Object.entries(data)
      .map(([id, datos]) => ({ id, ...datos }))
      .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
    callback(lista)
  })
}

export async function obtenerCuenta(id) {
  const r = ref(db, `cuentas/${id}`)
  const snap = await get(r)
  return snap.exists() ? { id, ...snap.val() } : null
}
