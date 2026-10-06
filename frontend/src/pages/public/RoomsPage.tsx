import { Link } from 'react-router-dom'
import { Users, BedDouble, Maximize } from 'lucide-react'
import { useHotel } from '@/context/HotelContext'
import Spinner from '@/components/ui/Spinner'
import { getRoomAmenityIcon } from '@/utils/amenityIcons'

export default function RoomsPage() {
  const { config, roomTypes, loading } = useHotel()

  if (loading) return <div className="flex justify-center py-32"><Spinner /></div>

  const symbol = config?.currencySymbol ?? '₹'

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-brand-600 text-xs font-semibold uppercase tracking-[0.3em] mb-3">Accommodation</p>
        <h1 className="section-heading">Rooms & Suites</h1>
        <p className="text-neutral-500 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
          Each room is thoughtfully designed to provide comfort, elegance, and modern amenities.
        </p>
      </div>

      <div className="space-y-8">
        {roomTypes.map((room) => (
          <div key={room.roomTypeId} className="card overflow-hidden md:flex group">
            <div className="md:w-96 shrink-0 h-64 md:h-auto bg-neutral-100 overflow-hidden">
              {room.imageUrls[0] ? (
                <img
                  src={room.imageUrls[0]}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400 text-sm">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1 p-8 flex flex-col justify-between">
              <div>
                <h2 className="font-serif text-2xl mb-3">{room.name}</h2>
                <p className="text-neutral-500 text-sm leading-relaxed mb-6">{room.description}</p>
                <div className="flex flex-wrap gap-6 text-sm text-neutral-600 mb-6">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-brand-500" /> Up to {room.maxOccupancy} guests
                  </span>
                  {room.bedType && (
                    <span className="flex items-center gap-2">
                      <BedDouble className="h-4 w-4 text-brand-500" /> {room.bedType}
                    </span>
                  )}
                  {room.size && (
                    <span className="flex items-center gap-2">
                      <Maximize className="h-4 w-4 text-brand-500" /> {room.size}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.slice(0, 6).map((a) => (
                    <span key={a} className="flex items-center gap-1.5 bg-neutral-100 text-neutral-600 text-xs px-3 py-1">
                      <span className="text-brand-500">{getRoomAmenityIcon(a)}</span>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-100">
                <div>
                  <span className="text-xs text-neutral-500">From</span>
                  <p className="font-semibold text-brand-700 text-xl">
                    {symbol}{room.basePrice.toLocaleString()}
                    <span className="text-sm font-normal text-neutral-500">/night</span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link to={`/rooms/${room.roomTypeId}`} className="btn-secondary text-xs px-4 py-2">
                    Details
                  </Link>
                  <Link to="/availability" className="btn-primary text-xs px-4 py-2">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
