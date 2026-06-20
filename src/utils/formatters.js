export function formatCOP(value) {
  if (!value && value !== 0) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export function formatFecha(iso) {
  if (!iso) return ''
  const d = new Date(iso.includes('T') ? iso : iso + 'T12:00:00')
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatFechaCorta(iso) {
  if (!iso) return ''
  const d = new Date(iso.includes('T') ? iso : iso + 'T12:00:00')
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function hoy() {
  return new Date().toISOString().split('T')[0]
}

export const ESTADOS = {
  pendiente: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800' },
  enviada: { label: 'Enviada', color: 'bg-blue-100 text-blue-800' },
  pagada: { label: 'Pagada', color: 'bg-emerald-100 text-emerald-800' }
}
