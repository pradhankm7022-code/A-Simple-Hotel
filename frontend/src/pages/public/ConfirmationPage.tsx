import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import type { Booking } from '@/types'
import { useHotel } from '@/context/HotelContext'
import Badge from '@/components/ui/Badge'
import { formatDate, countNights } from '@/utils/dates'
import { formatCurrency } from '@/utils/formatting'

export default function ConfirmationPage() {
  const { config } = useHotel()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const symbol = config?.currencySymbol ?? '₹'

  useEffect(() => {
    const raw = sessionStorage.getItem('booking_confirmation')
    if (!raw) {
      // Only redirect if we don't already have booking data (second Strict Mode run)
      setBooking(prev => {
        if (!prev) navigate('/')
        return prev
      })
      return
    }
    try {
      const parsed = JSON.parse(raw)
      sessionStorage.removeItem('booking_confirmation')
      setBooking(parsed)
    } catch { navigate('/') }
  }, [])

  if (!booking) return null

  const nights = countNights(booking.checkIn, booking.checkOut)

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      {/* Success header */}
      <div className="text-center mb-10">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="font-serif text-4xl mb-2">Booking Confirmed!</h1>
        <p className="text-neutral-500">
          A confirmation email has been sent to{' '}
          <strong className="text-neutral-700">{booking.guestEmail}</strong>.
        </p>
      </div>

      {/* Booking reference */}
      <div className="card p-8 text-center mb-6 bg-brand-50 border-brand-200">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2">
          Booking Reference
        </p>
        <p className="font-serif text-4xl text-brand-800 tracking-wider">{booking.bookingNumber}</p>
        <p className="text-xs text-neutral-500 mt-2">Save this number to manage your booking</p>
      </div>

      {/* Details */}
      <div className="card p-8 space-y-6">
        <div className="grid grid-cols-2 gap-y-4 text-sm">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Guest</p>
            <p className="font-medium">{booking.guestName}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Status</p>
            <Badge status={booking.status} />
          </div>
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

        <div className="border-t border-neutral-100 pt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">Rooms</p>
          <ul className="space-y-2">
            {booking.rooms.map((r) => (
              <li key={r.bookingRoomId} className="flex justify-between text-sm">
                <span>{r.roomTypeName} × {r.quantity}</span>
                <span className="text-neutral-500">
                  {formatCurrency(r.pricePerNight, symbol)}/night
                </span>
              </li>
            ))}
          </ul>
        </div>

        {config?.checkInTime && (
          <div className="bg-neutral-50 border border-neutral-200 p-4 text-xs text-neutral-600">
            Check-in from <strong>{config.checkInTime}</strong> &nbsp;·&nbsp;
            Check-out by <strong>{config.checkOutTime}</strong>
            <br />
            Payment is due at the hotel. Please present your booking reference at check-in.
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-8">
        <Link to="/" className="btn-secondary flex-1 text-center text-xs">
          Back to Home
        </Link>
        <Link to="/manage-booking" className="btn-primary flex-1 text-center text-xs">
          Manage Booking
        </Link>
      </div>
    </div>
  )
}
