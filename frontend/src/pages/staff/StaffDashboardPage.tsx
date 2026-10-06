import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, Clock, Users, Plus } from 'lucide-react'
import { staffApi } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { useHotel } from '@/context/HotelContext'
import Badge from '@/components/ui/Badge'
import type { Booking } from '@/types'
import { formatDate } from '@/utils/dates'
import { formatCurrency } from '@/utils/formatting'

export default function StaffDashboardPage() {
  const { token } = useAuth()
  const { config } = useHotel()
  const symbol = config?.currencySymbol ?? '₹'

  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ confirmed: 0, cancelled: 0, totalRevenue: 0 })

  useEffect(() => {
    if (!token) return
    staffApi.getBookings({ pageSize: 5 }, token)
      .then((res) => {
        setRecentBookings(res.bookings)
        const confirmed = res.bookings.filter((b) => b.status === 'confirmed').length
        const cancelled = res.bookings.filter((b) => b.status === 'cancelled').length
        const revenue = res.bookings
          .filter((b) => b.status === 'confirmed')
          .reduce((s, b) => s + b.totalAmount, 0)
        setStats({ confirmed, cancelled, totalRevenue: revenue })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="font-serif text-2xl">Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-6">
            <div className="h-4 bg-neutral-100 rounded animate-pulse w-1/2 mb-3" />
            <div className="h-8 bg-neutral-100 rounded animate-pulse w-1/3 mb-2" />
            <div className="h-3 bg-neutral-100 rounded animate-pulse w-2/3" />
          </div>
        ))}
      </div>
      <div className="card p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 bg-neutral-100 rounded animate-pulse mb-4" />
        ))}
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="font-serif text-2xl">Dashboard</h1>
        <Link to="/staff/bookings/new" className="btn-primary text-xs shrink-0">
          <Plus className="h-4 w-4" /> New Booking
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <CalendarCheck className="h-5 w-5 text-green-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Confirmed</span>
          </div>
          <p className="text-3xl font-semibold text-neutral-900">{stats.confirmed}</p>
          <p className="text-xs text-neutral-400 mt-1">Recent bookings</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-brand-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Revenue</span>
          </div>
          <p className="text-3xl font-semibold text-neutral-900">{formatCurrency(stats.totalRevenue, symbol)}</p>
          <p className="text-xs text-neutral-400 mt-1">Recent confirmed</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-red-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Cancelled</span>
          </div>
          <p className="text-3xl font-semibold text-neutral-900">{stats.cancelled}</p>
          <p className="text-xs text-neutral-400 mt-1">Recent bookings</p>
        </div>
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-neutral-700">Recent Bookings</h2>
          <Link to="/staff/bookings" className="text-xs text-brand-600 hover:underline">View all</Link>
        </div>
        <div className="card overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Ref</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Guest</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Check-in</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Check-out</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentBookings.map((b) => (
                <tr key={b.bookingId} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/staff/bookings/${b.bookingId}`} className="text-brand-600 hover:underline font-medium">
                      {b.bookingNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{b.guestName}</td>
                  <td className="px-4 py-3 text-neutral-600">{formatDate(b.checkIn)}</td>
                  <td className="px-4 py-3 text-neutral-600">{formatDate(b.checkOut)}</td>
                  <td className="px-4 py-3"><Badge status={b.status} /></td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(b.totalAmount, symbol)}</td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-400">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
