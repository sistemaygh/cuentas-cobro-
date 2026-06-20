import { useState, useEffect } from 'react'
import { suscribirClientes } from '../firebase/clientes'

export function useClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = suscribirClientes((lista) => {
      setClientes(lista)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return { clientes, loading }
}
