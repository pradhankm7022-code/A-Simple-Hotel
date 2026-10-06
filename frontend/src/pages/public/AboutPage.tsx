import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useHotel } from '@/context/HotelContext'
import Spinner from '@/components/ui/Spinner'

export default function AboutPage() {
  const { config, loading } = useHotel()
  if (loading) return <div className="flex justify-center py-32"><Spinner /></div>

  const hotelName = config?.hotelName ?? 'The Paradise'

  return (
    <div>
      {/* Hero */}
      <div className="bg-neutral-900 py-24 text-center px-6">
        <p className="text-brand-400 text-xs font-semibold uppercase tracking-[0.3em] mb-3">Our Story</p>
        <h1 className="font-serif text-5xl text-white font-normal">About {hotelName}</h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16">
        <div>
          <h2 className="section-heading mb-6">Welcome</h2>
          <p className="text-neutral-600 leading-relaxed">
            {config?.description ?? 'A luxury hotel where every detail is crafted for your comfort.'}
          </p>
          {config?.cancellationPolicy && (
            <div className="mt-8 p-6 bg-neutral-50 border border-neutral-200">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                Cancellation Policy
              </h3>
              <p className="text-sm text-neutral-600">{config.cancellationPolicy}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="section-heading text-2xl">Contact & Hours</h2>
          <ul className="space-y-4 text-sm text-neutral-600">
            {config?.address && (
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                <span>{config.address}</span>
              </li>
            )}
            {config?.phone && (
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-brand-500 shrink-0" />
                <a href={`tel:${config.phone}`} className="hover:text-neutral-900 transition-colors">
                  {config.phone}
                </a>
              </li>
            )}
            {config?.email && (
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-brand-500 shrink-0" />
                <a href={`mailto:${config.email}`} className="hover:text-neutral-900 transition-colors">
                  {config.email}
                </a>
              </li>
            )}
            {config?.checkInTime && (
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-brand-500 shrink-0" />
                <span>Check-in: {config.checkInTime} &nbsp;|&nbsp; Check-out: {config.checkOutTime}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
