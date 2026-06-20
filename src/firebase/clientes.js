import { db } from './config'
import { ref, push, set, update, remove, onValue, get } from 'firebase/database'

export function suscribirClientes(callback) {
  const r = ref(db, 'clientes')
  return onValue(r, (snap) => {
    const data = snap.val() || {}
    const lista = Object.entries(data)
      .map(([id, datos]) => ({ id, ...datos }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    callback(lista)
  })
}

export async function crearCliente(datos) {
  const r = ref(db, 'clientes')
  const newRef = push(r)
  await set(newRef, datos)
  return newRef.key
}

export async function actualizarCliente(id, datos) {
  const r = ref(db, `clientes/${id}`)
  await update(r, datos)
}

export async function eliminarCliente(id) {
  const r = ref(db, `clientes/${id}`)
  await remove(r)
}

export async function obtenerCliente(id) {
  const r = ref(db, `clientes/${id}`)
  const snap = await get(r)
  return snap.exists() ? { id, ...snap.val() } : null
}
