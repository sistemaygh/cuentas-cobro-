import { useState, useEffect } from 'react'
import { suscribirCuentas } from '../firebase/cuentas'

export function useCuentas() {
  const [cuentas, setCuentas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = suscribirCuentas((lista) => {
      setCuentas(lista)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const pendientes = cuentas.filter(c => c.estado === 'pendiente')
  const enviadas = cuentas.filter(c => c.estado === 'enviada')
  const pagadas = cuentas.filter(c => c.estado === 'pagada')

  const totalMes = (() => {
    const ahora = new Date()
    return pagadas
      .filter(c => {
        const f = new Date(c.fechaPago || c.fechaCreacion)
        return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear()
      })
      .reduce((acc, c) => acc + (c.total || 0), 0)
  })()

  return { cuentas, pendientes, enviadas, pagadas, totalMes, loading }
}
