import { useState } from 'react'
import { useHotel } from '@/context/HotelContext'
import Spinner from '@/components/ui/Spinner'

export default function GalleryPage() {
  const { config, loading } = useHotel()
  const [selected, setSelected] = useState<string | null>(null)

  if (loading) return <div className="flex justify-center py-32"><Spinner /></div>

  const images = config?.galleryImages ?? []
  const hotelName = config?.hotelName ?? 'The Paradise'

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-brand-600 text-xs font-semibold uppercase tracking-[0.3em] mb-3">Visuals</p>
        <h1 className="section-heading">Gallery</h1>
      </div>

      {images.length === 0 ? (
        <p className="text-center text-neutral-500 py-16">Gallery coming soon.</p>
      ) : (
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setSelected(url)}
              className="w-full overflow-hidden block break-inside-avoid group"
            >
              <img
                src={url}
                alt={`${hotelName} gallery ${i + 1}`}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <img src={selected} alt="Gallery" className="max-h-[90vh] max-w-full object-contain" />
          <button
            className="absolute top-4 right-4 text-white text-2xl font-light"
            onClick={() => setSelected(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
