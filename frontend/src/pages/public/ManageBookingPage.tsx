import { useState } from 'react'
import { api } from '@/services/api'
import { useHotel } from '@/context/HotelContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import type { Booking } from '@/types'
import { formatDate, countNights } from '@/utils/dates'
import { formatCurrency } from '@/utils/formatting'

export default function ManageBookingPage() {
  const { config } = useHotel()
  const symbol = config?.currencySymbol ?? '₹'

  const [bookingNumber, setBookingNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setBooking(null)
    try {
      const data = await api.getBooking(bookingNumber.trim().toUpperCase(), email.trim().toLowerCase())
      setBooking(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Booking not found')
    } finally {
      setLoading(false)
    }
  }

  const nights = booking ? countNights(booking.checkIn, booking.checkOut) : 0

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-brand-600 text-xs font-semibold uppercase tracking-[0.3em] mb-3">Reservations</p>
        <h1 className="section-heading">Find Your Booking</h1>
      </div>

      <form onSubmit={handleLookup} className="card p-8 space-y-5 mb-8">
        <Input
          label="Booking Reference"
          placeholder=""
          value={bookingNumber}
          onChange={(e) => setBookingNumber(e.target.value)}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="Email used at booking"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          {loading ? 'Looking up…' : 'Find Booking'}
        </Button>
      </form>

      {booking && (
        <div className="card p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-serif text-2xl">{booking.bookingNumber}</p>
              <p className="text-sm text-neutral-500 mt-1">Booked by {booking.guestName}</p>
            </div>
            <Badge status={booking.status} />
          </div>

          <div className="grid grid-cols-2 gap-y-4 text-sm border-t border-neutral-100 pt-6">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Check-in</p>
              <p className="font-medium">{formatDate(booking.checkIn)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Check-out</p>
              <p className="font-medium">{formatDate(booking.checkOut)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Nights</p>
              <p className="font-medium">{nights}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Total</p>
              <p className="font-semibold text-brand-700">{formatCurrency(booking.totalAmount, symbol)}</p>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">Rooms</p>
            <ul className="space-y-2 text-sm">
              {booking.rooms.map((r) => (
                <li key={r.bookingRoomId} className="flex justify-between">
                  <span>{r.roomTypeName} × {r.quantity}</span>
                  <span className="text-neutral-500">{formatCurrency(r.subtotal, symbol)}</span>
                </li>
              ))}
            </ul>
          </div>

          {booking.notes && (
            <div className="border-t border-neutral-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1">Notes</p>
              <p className="text-sm text-neutral-600">{booking.notes}</p>
            </div>
          )}

          {config?.cancellationPolicy && booking.status === 'confirmed' && (
            <div className="bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800">
              <strong className="block mb-1">Cancellation Policy</strong>
              {config.cancellationPolicy}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
