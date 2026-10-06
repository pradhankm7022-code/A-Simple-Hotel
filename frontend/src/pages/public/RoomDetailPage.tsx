import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { Users, BedDouble, Maximize, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useHotel } from '@/context/HotelContext'
import Spinner from '@/components/ui/Spinner'
import { getRoomAmenityIcon } from '@/utils/amenityIcons'

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { config, roomTypes, loading } = useHotel()
  const [imgIdx, setImgIdx] = useState(0)

  if (loading) return <div className="flex justify-center py-32"><Spinner /></div>

  const room = roomTypes.find((r) => r.roomTypeId === id)
  if (!room) {
    return (
      <div className="text-center py-32">
        <p className="text-neutral-500 mb-4">Room not found.</p>
        <Link to="/rooms" className="btn-secondary text-xs">Back to Rooms</Link>
      </div>
    )
  }

  const symbol = config?.currencySymbol ?? '₹'
  const images = room.imageUrls

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <Link to="/rooms" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 mb-8 transition-colors">
        <ChevronLeft className="h-4 w-4" /> All Rooms
      </Link>

      <div className="grid lg:grid-cols-2 gap-16">
        {/* Image gallery */}
        <div>
          <div className="relative overflow-hidden bg-neutral-100 h-80">
            {images.length > 0 ? (
              <img
                src={images[imgIdx]}
                alt={`${room.name} - ${imgIdx + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400 text-sm">
                No image
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1.5 hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1.5 hover:bg-black/60 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`w-16 h-12 overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-brand-600' : 'border-transparent'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="font-serif text-4xl mb-3">{room.name}</h1>
          <p className="text-brand-700 text-2xl font-semibold mb-6">
            {symbol}{room.basePrice.toLocaleString()}
            <span className="text-sm font-normal text-neutral-500"> / night</span>
          </p>
          <p className="text-neutral-600 leading-relaxed mb-8">{room.description}</p>

          <div className="flex flex-wrap gap-6 text-sm text-neutral-600 mb-8 pb-8 border-b border-neutral-100">
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-brand-500" /> Up to {room.maxOccupancy} guests</span>
            {room.bedType && <span className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-brand-500" /> {room.bedType}</span>}
            {room.size && <span className="flex items-center gap-2"><Maximize className="h-4 w-4 text-brand-500" /> {room.size}</span>}
            {room.view && <span className="flex items-center gap-2"><Eye className="h-4 w-4 text-brand-500" /> {room.view}</span>}
          </div>

          <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">Room Amenities</h3>
          <div className="flex flex-wrap gap-2 mb-10">
            {room.amenities.map((a) => (
              <span key={a} className="flex items-center gap-1.5 bg-neutral-100 text-neutral-700 text-xs px-3 py-1.5">
                <span className="text-brand-500">{getRoomAmenityIcon(a)}</span>
                {a}
              </span>
            ))}
          </div>

          <Link to="/availability" className="btn-primary w-full text-center">
            Check Availability & Book
          </Link>
        </div>
      </div>
    </div>
  )
}
