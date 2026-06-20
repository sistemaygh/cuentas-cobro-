import { useState, useEffect } from 'react'
import { suscribirConfig } from '../firebase/configApp'

export function useConfig() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = suscribirConfig((data) => {
      setConfig(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return { config, loading }
}
