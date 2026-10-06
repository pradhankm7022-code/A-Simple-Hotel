import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { staffApi } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { useHotel } from '@/context/HotelContext'
import Badge from '@/components/ui/Badge'
import type { Booking, BookingStatus } from '@/types'
import { formatDate } from '@/utils/dates'
import { formatCurrency } from '@/utils/formatting'

export default function StaffBookingsPage() {
  const { token } = useAuth()
  const { config } = useHotel()
  const symbol = config?.currencySymbol ?? '₹'

  const [bookings, setBookings] = useState<Booking[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BookingStatus | 'all'>('all')

  const fetchBookings = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await staffApi.getBookings({ page, pageSize: 20, status, search }, token)
      setBookings(res.bookings)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch {}
    setLoading(false)
  }, [token, page, status, search])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  // Debounce search
  useEffect(() => {
    setPage(1)
  }, [search, status])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl">Bookings <span className="text-neutral-400 text-lg font-sans">({total})</span></h1>
        <Link to="/staff/bookings/new" className="btn-primary text-xs">
          <Plus className="h-4 w-4" /> New Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="input-field pl-9"
            placeholder="Search by name, email, ref, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-40"
          value={status}
          onChange={(e) => setStatus(e.target.value as BookingStatus | 'all')}
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading && bookings.length === 0 ? (
        <div className="card overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[580px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Ref</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Guest</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 hidden md:table-cell">Check-in</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 hidden md:table-cell">Check-out</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 hidden lg:table-cell">Nights</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-neutral-100 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[580px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Ref</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Guest</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 hidden md:table-cell">Check-in</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 hidden md:table-cell">Check-out</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 hidden lg:table-cell">Nights</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {bookings.map((b) => (
                <tr key={b.bookingId} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/staff/bookings/${b.bookingId}`} className="text-brand-600 hover:underline font-medium">
                      {b.bookingNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-800">{b.guestName}</p>
                    <p className="text-xs text-neutral-400">{b.guestEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">{formatDate(b.checkIn)}</td>
                  <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">{formatDate(b.checkOut)}</td>
                  <td className="px-4 py-3 text-neutral-600 hidden lg:table-cell">{b.nights}</td>
                  <td className="px-4 py-3"><Badge status={b.status} /></td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(b.totalAmount, symbol)}</td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-neutral-400">No bookings found</td></tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
              <p className="text-xs text-neutral-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 border border-neutral-200 disabled:opacity-40 hover:border-neutral-400 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 border border-neutral-200 disabled:opacity-40 hover:border-neutral-400 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
