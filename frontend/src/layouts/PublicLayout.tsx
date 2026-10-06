import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Phone, Mail } from 'lucide-react'
import { useHotel } from '@/context/HotelContext'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/amenities', label: 'Amenities' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
]

export default function PublicLayout() {
  const { config } = useHotel()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const hotelName = config?.hotelName ?? 'The Paradise'
  const phone = config?.phone ?? ''
  const email = config?.email ?? ''

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="hidden md:block bg-neutral-900 text-neutral-400 text-xs py-2">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <span>Welcome to {hotelName}</span>
          <div className="flex gap-6">
            {phone && (
              <a href={`tel:${phone}`} className="flex items-center gap-1 hover:text-white transition-colors">
                <Phone className="h-3 w-3" />{phone}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-1 hover:text-white transition-colors">
                <Mail className="h-3 w-3" />{email}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-xl font-normal text-neutral-900 tracking-wide">
            {config?.logoUrl ? (
              <img src={config.logoUrl} alt={hotelName} className="h-10 object-contain" />
            ) : (
              hotelName
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  location.pathname === link.to
                    ? 'text-brand-600'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/manage-booking" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              My Booking
            </Link>
            <Link to="/availability" className="btn-primary text-xs px-5 py-2.5">
              Book Now
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-neutral-600"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-neutral-700"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/manage-booking" onClick={() => setMenuOpen(false)} className="text-sm text-neutral-600">
              My Booking
            </Link>
            <Link
              to="/availability"
              onClick={() => setMenuOpen(false)}
              className="btn-primary text-center text-xs"
            >
              Book Now
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-serif text-white text-lg mb-4">{hotelName}</h3>
            <p className="text-sm leading-relaxed">{config?.description?.slice(0, 160)}</p>
          </div>
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/availability" className="text-sm hover:text-white transition-colors">
                  Book a Room
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              {config?.address && <li>{config.address}</li>}
              {phone && (
                <li>
                  <a href={`tel:${phone}`} className="hover:text-white transition-colors">{phone}</a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
                </li>
              )}
              {config?.checkInTime && (
                <li className="mt-4 text-xs">
                  Check-in: {config.checkInTime} &nbsp;|&nbsp; Check-out: {config.checkOutTime}
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-800 px-6 py-4 text-center text-xs text-neutral-600">
          © {new Date().getFullYear()} {hotelName}. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
