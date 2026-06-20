import { db } from './config'
import { ref, onValue, update, get } from 'firebase/database'

export function suscribirConfig(callback) {
  const r = ref(db, 'config')
  return onValue(r, (snap) => {
    callback(snap.val() || {})
  })
}

export async function guardarConfig(datos) {
  const r = ref(db, 'config')
  await update(r, datos)
}

export async function obtenerConfig() {
  const r = ref(db, 'config')
  const snap = await get(r)
  return snap.val() || {}
}
