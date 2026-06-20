import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>
      <Navbar />
    </div>
  )
}
