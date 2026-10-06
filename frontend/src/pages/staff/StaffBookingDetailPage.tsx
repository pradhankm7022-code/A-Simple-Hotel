import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { staffApi } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { useHotel } from '@/context/HotelContext'
import Spinner from '@/components/ui/Spinner'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Booking } from '@/types'
import { formatDate, countNights } from '@/utils/dates'
import { formatCurrency } from '@/utils/formatting'

export default function StaffBookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuth()
  const { config } = useHotel()
  const navigate = useNavigate()
  const symbol = config?.currencySymbol ?? '₹'

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editForm, setEditForm] = useState({ guestName: '', guestEmail: '', guestPhone: '', notes: '' })

  useEffect(() => {
    if (!id || !token) return
    staffApi.getBooking(id, token)
      .then((b) => {
        setBooking(b)
        setEditForm({ guestName: b.guestName, guestEmail: b.guestEmail, guestPhone: b.guestPhone, notes: b.notes ?? '' })
      })
      .catch(() => navigate('/staff/bookings'))
      .finally(() => setLoading(false))
  }, [id, token, navigate])

  async function handleSave() {
    if (!booking || !token) return
    setSaving(true)
    try {
      const updated = await staffApi.updateBooking(booking.bookingId, editForm, token)
      setBooking(updated)
      setEditing(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  async function handleCancel() {
    if (!booking || !token) return
    if (!confirm(`Cancel booking ${booking.bookingNumber}? This cannot be undone.`)) return
    setCancelling(true)
    try {
      const updated = await staffApi.cancelBooking(booking.bookingId, undefined, token)
      setBooking(updated)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to cancel')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>
  if (!booking) return null

  const nights = countNights(booking.checkIn, booking.checkOut)

  return (
    <div className="max-w-3xl">
      <Link to="/staff/bookings" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> All Bookings
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl">{booking.bookingNumber}</h1>
          <p className="text-neutral-500 text-sm mt-1">Created {booking.createdAt.slice(0, 10)}</p>
        </div>
        <Badge status={booking.status} className="text-sm px-3 py-1" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-6">{error}</div>
      )}

      {/* Guest details */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-neutral-700">Guest Details</h2>
          {booking.status === 'confirmed' && !editing && (
            <button onClick={() => setEditing(true)} className="text-xs text-brand-600 hover:underline">
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <Input label="Full Name" value={editForm.guestName} onChange={(e) => setEditForm((f) => ({ ...f, guestName: e.target.value }))} />
            <Input label="Email" type="email" value={editForm.guestEmail} onChange={(e) => setEditForm((f) => ({ ...f, guestEmail: e.target.value }))} />
            <Input label="Phone" value={editForm.guestPhone} onChange={(e) => setEditForm((f) => ({ ...f, guestPhone: e.target.value }))} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-600">Notes</label>
              <textarea className="input-field resize-none h-20" value={editForm.notes} onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} loading={saving} size="sm">Save</Button>
              <Button variant="ghost" onClick={() => setEditing(false)} size="sm">Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div><p className="text-xs text-neutral-400 mb-1">Name</p><p className="font-medium">{booking.guestName}</p></div>
            <div><p className="text-xs text-neutral-400 mb-1">Email</p><p>{booking.guestEmail}</p></div>
            <div><p className="text-xs text-neutral-400 mb-1">Phone</p><p>{booking.guestPhone}</p></div>
            {booking.notes && <div className="col-span-2"><p className="text-xs text-neutral-400 mb-1">Notes</p><p className="text-neutral-600">{booking.notes}</p></div>}
          </div>
        )}
      </div>

      {/* Stay details */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-neutral-700 mb-4">Stay Details</h2>
        <div className="grid grid-cols-3 gap-4 text-sm mb-6">
          <div><p className="text-xs text-neutral-400 mb-1">Check-in</p><p className="font-medium">{formatDate(booking.checkIn)}</p></div>
          <div><p className="text-xs text-neutral-400 mb-1">Check-out</p><p className="font-medium">{formatDate(booking.checkOut)}</p></div>
          <div><p className="text-xs text-neutral-400 mb-1">Nights</p><p className="font-medium">{nights}</p></div>
        </div>
        <div className="border-t border-neutral-100 pt-4">
          <p className="text-xs text-neutral-400 uppercase tracking-wider mb-3">Rooms</p>
          <ul className="space-y-2 text-sm">
            {booking.rooms.map((r) => (
              <li key={r.bookingRoomId} className="flex justify-between">
                <span>{r.roomTypeName} × {r.quantity}</span>
                <span className="text-neutral-500">
                  {formatCurrency(r.pricePerNight, symbol)}/night · {formatCurrency(r.subtotal, symbol)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-semibold text-sm mt-4 pt-4 border-t border-neutral-100">
            <span>Total</span>
            <span className="text-brand-700">{formatCurrency(booking.totalAmount, symbol)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {booking.status === 'confirmed' && (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            onClick={handleCancel}
            loading={cancelling}
            className="border-red-400 text-red-600 hover:bg-red-50 text-xs"
          >
            Cancel Booking
          </Button>
        </div>
      )}
    </div>
  )
}
