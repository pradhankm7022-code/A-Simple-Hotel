import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarCheck, Search, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useHotel } from '@/context/HotelContext'

const STAFF_NAV = [
  { to: '/staff', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/staff/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/staff/availability', label: 'Availability', icon: Search },
]

export default function StaffLayout() {
  const { logout } = useAuth()
  const { config } = useHotel()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const hotelName = config?.hotelName ?? 'The Paradise'

  function handleLogout() {
    logout()
    navigate('/staff/login')
  }

  function isActive(to: string, exact?: boolean) {
    return exact ? location.pathname === to : location.pathname.startsWith(to)
  }

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-neutral-900 flex-col shrink-0">
        <div className="px-6 py-5 border-b border-neutral-800">
          <p className="font-serif text-white text-base">{hotelName}</p>
          <p className="text-neutral-500 text-xs mt-0.5">Staff Portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {STAFF_NAV.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors ${
                isActive(to, exact) ? 'bg-brand-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-neutral-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-neutral-900 flex flex-col z-50">
            <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <p className="font-serif text-white text-base">{hotelName}</p>
                <p className="text-neutral-500 text-xs mt-0.5">Staff Portal</p>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
              {STAFF_NAV.map(({ to, label, icon: Icon, exact }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 text-sm rounded transition-colors ${
                    isActive(to, exact) ? 'bg-brand-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-neutral-800">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3 py-3 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Log Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-neutral-200 px-4 md:px-8 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-neutral-600 hover:text-neutral-900"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold text-neutral-700">
              {STAFF_NAV.find((n) => isActive(n.to, n.exact))?.label ?? 'Staff Portal'}
            </h1>
          </div>
          <Link to="/" target="_blank" className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors">
            View Site ↗
          </Link>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
