import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ChevronLeft } from 'lucide-react'
import { staffApi } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { useHotel } from '@/context/HotelContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { AvailabilityResponse, BookingRoomRequest } from '@/types'
import { toISODate, today, minCheckOut } from '@/utils/dates'
import { formatCurrency } from '@/utils/formatting'

export default function StaffCreateBookingPage() {
  const { token } = useAuth()
  const { config } = useHotel()
  const navigate = useNavigate()
  const symbol = config?.currencySymbol ?? '₹'

  const [step, setStep] = useState<'availability' | 'details'>('availability')
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [avLoading, setAvLoading] = useState(false)
  const [avError, setAvError] = useState<string | null>(null)
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null)
  const [selected, setSelected] = useState<Record<string, number>>({})

  const [form, setForm] = useState({ guestName: '', guestEmail: '', guestPhone: '', notes: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  async function handleCheckAvailability(e: React.FormEvent) {
    e.preventDefault()
    if (!checkIn || !checkOut || !token) return
    setAvLoading(true)
    setAvError(null)
    try {
      const data = await staffApi.checkAvailability(toISODate(checkIn), toISODate(checkOut), token)
      setAvailability(data)
    } catch (err: unknown) {
      setAvError(err instanceof Error ? err.message : 'Failed to check')
    } finally {
      setAvLoading(false)
    }
  }

  function handleProceed() {
    if (!availability || Object.keys(selected).length === 0) return
    setStep('details')
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.guestName.trim()) e.guestName = 'Required'
    if (!form.guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail)) e.guestEmail = 'Valid email required'
    if (!form.guestPhone.trim()) e.guestPhone = 'Required'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!availability || !token) return
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const rooms: BookingRoomRequest[] = Object.entries(selected).map(([roomTypeId, quantity]) => ({ roomTypeId, quantity }))

    setBookingLoading(true)
    setBookingError(null)
    try {
      const result = await staffApi.createBooking({
        guestName: form.guestName.trim(),
        guestEmail: form.guestEmail.trim().toLowerCase(),
        guestPhone: form.guestPhone.trim(),
        checkIn: availability.checkIn,
        checkOut: availability.checkOut,
        rooms,
        notes: form.notes.trim(),
      }, token)
      navigate(`/staff/bookings/${result.booking.bookingId}`)
    } catch (err: unknown) {
      setBookingError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setBookingLoading(false)
    }
  }

  const hasSelection = Object.values(selected).some((q) => q > 0)
  const totalAmount = availability
    ? Object.entries(selected).reduce((sum, [id, qty]) => {
        const r = availability.available.find((a) => a.roomTypeId === id)
        return sum + (r ? r.pricing.totalPrice * qty : 0)
      }, 0)
    : 0

  return (
    <div className="max-w-4xl">
      <Link to="/staff/bookings" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="font-serif text-2xl mb-8">New Booking</h1>

      {step === 'availability' && (
        <>
          <form onSubmit={handleCheckAvailability} className="card p-6 flex gap-4 items-end mb-8">
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-1.5">Check-in</label>
              <DatePicker selected={checkIn} onChange={(d) => { setCheckIn(d); if (checkOut && d && checkOut <= d) setCheckOut(null) }} minDate={new Date(today())} dateFormat="dd MMM yyyy" placeholderText="Select date" className="input-field w-full" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-1.5">Check-out</label>
              <DatePicker selected={checkOut} onChange={setCheckOut} minDate={checkIn ? minCheckOut(toISODate(checkIn)) : new Date(today())} dateFormat="dd MMM yyyy" placeholderText="Select date" className="input-field w-full" />
            </div>
            <Button type="submit" loading={avLoading}>Check</Button>
          </form>

          {avError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-6">{avError}</div>}

          {availability && (
            <div className="space-y-4 mb-8">
              {availability.available.map((room) => {
                const qty = selected[room.roomTypeId] ?? 0
                return (
                  <div key={room.roomTypeId} className="card p-4 flex items-center justify-between gap-6">
                    <div className="flex-1">
                      <p className="font-medium">{room.name}</p>
                      <p className="text-sm text-neutral-500">{room.availableCount} available · {formatCurrency(room.pricing.pricePerNight, symbol)}/night</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected((s) => { const n = { ...s }; if (qty <= 1) { delete n[room.roomTypeId] } else n[room.roomTypeId] = qty - 1; return n })} disabled={qty === 0} className="w-8 h-8 border border-neutral-300 flex items-center justify-center disabled:opacity-30 hover:border-brand-500">−</button>
                      <span className="w-8 text-center font-semibold">{qty}</span>
                      <button onClick={() => setSelected((s) => ({ ...s, [room.roomTypeId]: Math.min((s[room.roomTypeId] ?? 0) + 1, room.availableCount) }))} disabled={qty >= room.availableCount} className="w-8 h-8 border border-neutral-300 flex items-center justify-center disabled:opacity-30 hover:border-brand-500">+</button>
                    </div>
                    <p className="w-28 text-right font-medium">{formatCurrency(room.pricing.totalPrice * qty, symbol)}</p>
                  </div>
                )
              })}
            </div>
          )}

          {availability && (
            <div className="flex items-center justify-between">
              <p className="font-semibold">Total: {formatCurrency(totalAmount, symbol)}</p>
              <Button onClick={handleProceed} disabled={!hasSelection}>Continue</Button>
            </div>
          )}
        </>
      )}

      {step === 'details' && (
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <div className="card p-6 space-y-4">
            <h2 className="font-serif text-xl">Guest Details</h2>
            <Input label="Full Name" value={form.guestName} onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))} error={errors.guestName} />
            <Input label="Email" type="email" value={form.guestEmail} onChange={(e) => setForm((f) => ({ ...f, guestEmail: e.target.value }))} error={errors.guestEmail} />
            <Input label="Phone" value={form.guestPhone} onChange={(e) => setForm((f) => ({ ...f, guestPhone: e.target.value }))} error={errors.guestPhone} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-600">Notes</label>
              <textarea className="input-field resize-none h-20" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          {bookingError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{bookingError}</div>}
          <div className="flex gap-4">
            <Button variant="secondary" type="button" onClick={() => setStep('availability')}>Back</Button>
            <Button type="submit" loading={bookingLoading}>Create Booking</Button>
          </div>
        </form>
      )}
    </div>
  )
}
