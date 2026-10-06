import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import { useHotel } from '@/context/HotelContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { BookingSelection } from '@/types'
import { formatCurrency } from '@/utils/formatting'

export default function BookingPage() {
  const { config } = useHotel()
  const navigate = useNavigate()
  const symbol = config?.currencySymbol ?? '₹'

  const [selection, setSelection] = useState<BookingSelection | null>(null)
  const [form, setForm] = useState({ guestName: '', guestEmail: '', guestPhone: '', notes: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('booking_selection')
    if (!raw) { navigate('/availability'); return }
    try { setSelection(JSON.parse(raw)) } catch { navigate('/availability') }
  }, [navigate])

  if (!selection) return null

  const avail = selection.availability
  const totalAmount = selection.rooms.reduce((sum, req) => {
    const roomAvail = avail?.available.find((r) => r.roomTypeId === req.roomTypeId)
    if (!roomAvail) return sum
    return sum + roomAvail.pricing.totalPrice * req.quantity
  }, 0)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.guestName.trim() || form.guestName.trim().length < 2) e.guestName = 'Name is required'
    if (!form.guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail))
      e.guestEmail = 'Valid email is required'
    if (!form.guestPhone.trim() || form.guestPhone.trim().length < 7)
      e.guestPhone = 'Phone number is required'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    setApiError(null)

    const currentSelection = selection
    if (!currentSelection) return

    try {
      const result = await api.createBooking({
        guestName:   form.guestName.trim(),
        guestEmail:  form.guestEmail.trim().toLowerCase(),
        guestPhone:  form.guestPhone.trim(),
        checkIn:     currentSelection.checkIn,
        checkOut:    currentSelection.checkOut,
        rooms:       currentSelection.rooms,
        notes:       form.notes.trim(),
      })
      sessionStorage.removeItem('booking_selection')
      sessionStorage.setItem('booking_confirmation', JSON.stringify(result.booking))
      navigate('/confirmation')
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-brand-600 text-xs font-semibold uppercase tracking-[0.3em] mb-3">Almost There</p>
        <h1 className="section-heading">Complete Your Booking</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Guest details form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="card p-8 space-y-5">
            <h2 className="font-serif text-xl mb-2">Guest Details</h2>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={form.guestName}
              onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))}
              error={errors.guestName}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={form.guestEmail}
              onChange={(e) => setForm((f) => ({ ...f, guestEmail: e.target.value }))}
              error={errors.guestEmail}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 9876543210"
              value={form.guestPhone}
              onChange={(e) => setForm((f) => ({ ...f, guestPhone: e.target.value }))}
              error={errors.guestPhone}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-600">
                Special Requests (optional)
              </label>
              <textarea
                className="input-field resize-none h-24"
                placeholder="Early check-in, dietary requirements, etc."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>

          {config?.cancellationPolicy && (
            <div className="bg-neutral-50 border border-neutral-200 p-4 text-xs text-neutral-600">
              <strong className="block text-neutral-700 mb-1">Cancellation Policy</strong>
              {config.cancellationPolicy}
            </div>
          )}

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm">
              {apiError}
            </div>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full">
            {loading ? 'Confirming…' : 'Confirm Booking'}
          </Button>
          <p className="text-xs text-neutral-400 text-center">
            No payment required now. Payment is due at the hotel.
          </p>
        </form>

        {/* Booking summary */}
        <div className="card p-6 h-fit space-y-4">
          <h3 className="font-serif text-lg">Booking Summary</h3>
          <div className="text-sm space-y-1 text-neutral-600">
            <p><strong>Check-in:</strong> {selection.checkIn}</p>
            <p><strong>Check-out:</strong> {selection.checkOut}</p>
            <p><strong>Nights:</strong> {avail?.nights}</p>
          </div>
          <div className="border-t border-neutral-100 pt-4 space-y-3">
            {selection.rooms.map((req) => {
              const roomAvail = avail?.available.find((r) => r.roomTypeId === req.roomTypeId)
              if (!roomAvail) return null
              return (
                <div key={req.roomTypeId} className="text-sm">
                  <p className="font-medium">{roomAvail.name} × {req.quantity}</p>
                  <p className="text-neutral-500">
                    {formatCurrency(roomAvail.pricing.pricePerNight, symbol)}/night ×{' '}
                    {avail?.nights} nights = {formatCurrency(roomAvail.pricing.totalPrice * req.quantity, symbol)}
                  </p>
                </div>
              )
            })}
          </div>
          <div className="border-t border-neutral-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">Total</span>
              <span className="font-semibold text-brand-700 text-lg">{formatCurrency(totalAmount, symbol)}</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">Payable at hotel</p>
          </div>
        </div>
      </div>
    </div>
  )
}
