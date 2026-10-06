import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Users } from 'lucide-react'
import { api } from '@/services/api'
import { useHotel } from '@/context/HotelContext'
import Button from '@/components/ui/Button'
import type { AvailabilityResponse, BookingRoomRequest } from '@/types'
import { toISODate, minCheckOut, today } from '@/utils/dates'
import { formatCurrency, pluralise } from '@/utils/formatting'

export default function AvailabilityPage() {
  const { config } = useHotel()
  const navigate = useNavigate()

  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AvailabilityResponse | null>(null)

  const [selected, setSelected] = useState<Record<string, number>>({})

  const symbol = config?.currencySymbol ?? '₹'

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!checkIn || !checkOut) return

    setLoading(true)
    setError(null)
    setResult(null)
    setSelected({})

    try {
      const data = await api.checkAvailability(toISODate(checkIn), toISODate(checkOut))
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to check availability')
    } finally {
      setLoading(false)
    }
  }

  function handleQuantityChange(roomTypeId: string, qty: number) {
    setSelected((prev) => {
      if (qty <= 0) {
        const next = { ...prev }
        delete next[roomTypeId]
        return next
      }
      return { ...prev, [roomTypeId]: qty }
    })
  }

  function handleProceed() {
    if (!result || Object.keys(selected).length === 0) return
    const rooms: BookingRoomRequest[] = Object.entries(selected).map(([roomTypeId, quantity]) => ({
      roomTypeId,
      quantity,
    }))
    // Store selection in sessionStorage for BookingPage
    sessionStorage.setItem(
      'booking_selection',
      JSON.stringify({
        checkIn: result.checkIn,
        checkOut: result.checkOut,
        rooms,
        availability: result,
      })
    )
    navigate('/booking')
  }

  const hasSelection = Object.values(selected).some((q) => q > 0)

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-brand-600 text-xs font-semibold uppercase tracking-[0.3em] mb-3">Plan Your Stay</p>
        <h1 className="section-heading">Check Availability</h1>
      </div>

      {/* Search form */}
      <form
        onSubmit={handleSearch}
        className="card p-8 flex flex-col md:flex-row gap-6 items-end mb-12"
      >
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-1.5">
            Check-in
          </label>
          <DatePicker
            selected={checkIn}
            onChange={(d) => {
              setCheckIn(d)
              if (checkOut && d && checkOut <= d) setCheckOut(null)
            }}
            minDate={new Date(today())}
            dateFormat="dd MMM yyyy"
            placeholderText="Select date"
            className="input-field w-full"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-1.5">
            Check-out
          </label>
          <DatePicker
            selected={checkOut}
            onChange={setCheckOut}
            minDate={checkIn ? minCheckOut(toISODate(checkIn)) : new Date(today())}
            dateFormat="dd MMM yyyy"
            placeholderText="Select date"
            className="input-field w-full"
            required
          />
        </div>
        <Button type="submit" loading={loading} className="md:w-auto w-full shrink-0">
          {loading ? 'Searching…' : 'Check Availability'}
        </Button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 text-sm mb-8">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          <h2 className="font-serif text-2xl mb-2">
            Available Rooms
          </h2>
          <p className="text-neutral-500 text-sm mb-8">
            {result.checkIn} → {result.checkOut} &nbsp;·&nbsp; {pluralise(result.nights, 'night')}
          </p>

          {result.available.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 border border-neutral-200">
              <p className="text-neutral-600 mb-2">No rooms available for these dates.</p>
              <p className="text-neutral-400 text-sm">Try different dates.</p>
            </div>
          ) : (
            <>
              <div className="space-y-6 mb-8">
                {result.available.map((room) => {
                  const qty = selected[room.roomTypeId] ?? 0
                  return (
                    <div key={room.roomTypeId} className="card p-0 overflow-hidden md:flex">
                      <div className="md:w-56 shrink-0 h-48 md:h-auto bg-neutral-100">
                        {room.imageUrls[0] ? (
                          <img src={room.imageUrls[0]} alt={room.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-neutral-200" />
                        )}
                      </div>
                      <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <h3 className="font-serif text-xl mb-1">{room.name}</h3>
                          <p className="text-neutral-500 text-sm leading-relaxed mb-3 line-clamp-2">
                            {room.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-neutral-600">
                            <span className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5 text-brand-500" /> {room.maxOccupancy} guests
                            </span>
                            <span className="text-xs text-neutral-400">
                              {room.availableCount} room{room.availableCount > 1 ? 's' : ''} left
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-4">
                          <div className="text-right">
                            <p className="text-brand-700 font-semibold text-xl">
                              {formatCurrency(room.pricing.pricePerNight, symbol)}
                            </p>
                            <p className="text-xs text-neutral-500">per night avg</p>
                            <p className="text-sm font-semibold text-neutral-700 mt-1">
                              Total: {formatCurrency(room.pricing.totalPrice, symbol)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(room.roomTypeId, qty - 1)}
                              disabled={qty === 0}
                              className="w-8 h-8 border border-neutral-300 text-neutral-600 flex items-center justify-center disabled:opacity-30 hover:border-brand-500 transition-colors"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                            <button
                              onClick={() => handleQuantityChange(room.roomTypeId, Math.min(qty + 1, room.availableCount))}
                              disabled={qty >= room.availableCount}
                              className="w-8 h-8 border border-neutral-300 text-neutral-600 flex items-center justify-center disabled:opacity-30 hover:border-brand-500 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProceed} disabled={!hasSelection} size="lg">
                  Continue to Booking
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
