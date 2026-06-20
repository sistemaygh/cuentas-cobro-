import { NavLink } from 'react-router-dom'
import { Home, Users, Clock, FileText, Settings } from 'lucide-react'
import { useCuentas } from '../hooks/useCuentas'

const items = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/pendientes', icon: Clock, label: 'Pendientes' },
  { to: '/historial', icon: FileText, label: 'Historial' },
  { to: '/ajustes', icon: Settings, label: 'Ajustes' }
]

export default function Navbar() {
  const { pendientes } = useCuentas()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors relative ${
                isActive ? 'text-blue-900' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  {label === 'Pendientes' && pendientes.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                      {pendientes.length > 9 ? '9+' : pendientes.length}
                    </span>
                  )}
                </div>
                <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
