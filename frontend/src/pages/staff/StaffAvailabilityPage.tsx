import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Users } from 'lucide-react'
import { staffApi } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { useHotel } from '@/context/HotelContext'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import type { AvailabilityResponse } from '@/types'
import { toISODate, today, minCheckOut } from '@/utils/dates'
import { formatCurrency, pluralise } from '@/utils/formatting'

export default function StaffAvailabilityPage() {
  const { token } = useAuth()
  const { config } = useHotel()
  const symbol = config?.currencySymbol ?? '₹'

  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AvailabilityResponse | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!checkIn || !checkOut || !token) return
    setLoading(true)
    setError(null)
    try {
      const data = await staffApi.checkAvailability(toISODate(checkIn), toISODate(checkOut), token)
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to check')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-serif text-2xl mb-6">Availability Check</h1>

      <form onSubmit={handleSearch} className="card p-6 flex flex-col sm:flex-row gap-4 sm:items-end mb-8">
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-1.5">Check-in</label>
          <DatePicker
            selected={checkIn}
            onChange={(d) => { setCheckIn(d); if (checkOut && d && checkOut <= d) setCheckOut(null) }}
            minDate={new Date(today())}
            dateFormat="dd MMM yyyy"
            placeholderText="Select date"
            className="input-field w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-1.5">Check-out</label>
          <DatePicker
            selected={checkOut}
            onChange={setCheckOut}
            minDate={checkIn ? minCheckOut(toISODate(checkIn)) : new Date(today())}
            dateFormat="dd MMM yyyy"
            placeholderText="Select date"
            className="input-field w-full"
          />
        </div>
        <Button type="submit" loading={loading} className="w-full sm:w-auto">Check</Button>
      </form>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-6">{error}</div>}

      {loading && <div className="flex justify-center py-12"><Spinner /></div>}

      {result && !loading && (
        <div>
          <p className="text-sm text-neutral-500 mb-4">
            {result.checkIn} → {result.checkOut} &nbsp;·&nbsp; {pluralise(result.nights, 'night')}
          </p>
          <div className="card overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Room Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Total Rooms</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Available</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Occupancy</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Rate/night</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {result.available.map((r) => {
                  const occupancy = r.totalInventory - r.availableCount
                  const pct = Math.round((occupancy / r.totalInventory) * 100)
                  return (
                    <tr key={r.roomTypeId} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                          <Users className="h-3 w-3" /> {r.maxOccupancy}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{r.totalInventory}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${r.availableCount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {r.availableCount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-neutral-200 rounded-full">
                            <div className="h-1.5 bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-neutral-500">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(r.pricing.pricePerNight, symbol)}
                      </td>
                    </tr>
                  )
                })}
                {result.available.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-400">No active room types found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
