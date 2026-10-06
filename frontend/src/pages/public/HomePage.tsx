import { Link } from 'react-router-dom'
import { ArrowRight, Star, Waves, Wifi, UtensilsCrossed, Coffee, Beer, Sparkles, Dumbbell, Wind, Car, Plane, BellRing, Bath, Tv, ShieldCheck, Shirt, TreePine, FlameKindling, MapPin, Clock } from 'lucide-react'
import { useHotel } from '@/context/HotelContext'
import Spinner from '@/components/ui/Spinner'

const ICON_MAP: Record<string, React.ReactNode> = {
  'Swimming Pool':   <Waves className="h-6 w-6" />,
  'Free WiFi':       <Wifi className="h-6 w-6" />,
  'WiFi':            <Wifi className="h-6 w-6" />,
  'Restaurant':      <UtensilsCrossed className="h-6 w-6" />,
  'Free Breakfast':  <Coffee className="h-6 w-6" />,
  'Bar':             <Beer className="h-6 w-6" />,
  'Spa':             <Sparkles className="h-6 w-6" />,
  'Gym':             <Dumbbell className="h-6 w-6" />,
  'AC':              <Wind className="h-6 w-6" />,
  'Free Parking':    <Car className="h-6 w-6" />,
  'Airport Shuttle': <Plane className="h-6 w-6" />,
  'Room Service':    <BellRing className="h-6 w-6" />,
  'Bathtub':         <Bath className="h-6 w-6" />,
  'TV':              <Tv className="h-6 w-6" />,
  '24/7 Security':   <ShieldCheck className="h-6 w-6" />,
  'Laundry Service': <Shirt className="h-6 w-6" />,
  'Garden':          <TreePine className="h-6 w-6" />,
  'Bonfire':         <FlameKindling className="h-6 w-6" />,
  'Tour Desk':       <MapPin className="h-6 w-6" />,
  'Early Check-in':  <Clock className="h-6 w-6" />,
  'Late Check-out':  <Clock className="h-6 w-6" />,
}

export default function HomePage() {
  const { config, roomTypes, loading } = useHotel()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    )
  }

  const hotelName = config?.hotelName ?? 'The Paradise'
  const tagline = config?.tagline ?? 'Where Luxury Meets Serenity'
  const heroImage = config?.galleryImages?.[0] ?? ''
  const featuredRooms = roomTypes.slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section
        className="relative flex items-center justify-center min-h-[90vh] bg-neutral-900"
        style={heroImage ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {heroImage && <div className="absolute inset-0 bg-black/45" />}
        <div className="relative text-center px-6 max-w-3xl">
          <p className="text-brand-300 text-xs font-semibold uppercase tracking-[0.3em] mb-4">
            Welcome to
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-white font-normal leading-tight mb-6">
            {hotelName}
          </h1>
          <p className="text-neutral-200 text-lg md:text-xl font-light mb-10 leading-relaxed">
            {tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/availability" className="btn-primary text-sm">
              Check Availability
            </Link>
            <Link to="/rooms" className="btn-secondary border-white text-white hover:bg-white/10 text-sm">
              Explore Rooms
            </Link>
          </div>
        </div>
      </section>

      {/* Quick booking bar */}
      <section className="bg-brand-600 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white font-serif text-lg">Begin Your Stay</p>
          <Link to="/availability" className="btn-secondary border-white text-white hover:bg-white/10 text-xs">
            View Availability & Rates <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* About intro */}
      <section className="py-20 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-brand-600 text-xs font-semibold uppercase tracking-[0.3em] mb-3">About Us</p>
          <h2 className="section-heading mb-6">A Place Like No Other</h2>
          <p className="text-neutral-600 leading-relaxed mb-8">
            {config?.description ?? 'Experience luxury and comfort at its finest.'}
          </p>
          <Link to="/about" className="btn-secondary text-xs">
            Our Story
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {config?.galleryImages?.slice(1, 5).map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${hotelName} gallery ${i + 2}`}
              className={`w-full object-cover ${i === 0 ? 'row-span-2' : ''}`}
              style={{ height: i === 0 ? '100%' : '160px' }}
            />
          ))}
        </div>
      </section>

      {/* Amenities strip */}
      {config?.amenities && config.amenities.length > 0 && (
        <section className="bg-neutral-50 border-y border-neutral-200 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500 mb-8">
              Hotel Amenities
            </p>
            <div className="flex flex-wrap justify-center gap-10">
              {config.amenities.map((a) => (
                <div key={a} className="flex flex-col items-center gap-2 text-neutral-700">
                  <div className="text-brand-600">
                    {ICON_MAP[a] ?? <Star className="h-6 w-6" />}
                  </div>
                  <span className="text-xs font-medium">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured rooms */}
      {featuredRooms.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-brand-600 text-xs font-semibold uppercase tracking-[0.3em] mb-3">Accommodation</p>
            <h2 className="section-heading">Our Rooms & Suites</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <div key={room.roomTypeId} className="card group overflow-hidden">
                <div className="overflow-hidden h-56 bg-neutral-100">
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
                <div className="p-6">
                  <h3 className="font-serif text-lg mb-2">{room.name}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-4 line-clamp-2">
                    {room.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-neutral-500">From</span>
                      <p className="font-semibold text-brand-700">
                        {config?.currencySymbol ?? '₹'}{room.basePrice.toLocaleString()}
                        <span className="text-xs font-normal text-neutral-500">/night</span>
                      </p>
                    </div>
                    <Link to={`/rooms/${room.roomTypeId}`} className="btn-secondary text-xs px-4 py-2">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/rooms" className="btn-primary text-xs">
              All Rooms & Suites
            </Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-neutral-900 py-24 text-center px-6">
        <p className="text-brand-400 text-xs font-semibold uppercase tracking-[0.3em] mb-4">Reserve Your Stay</p>
        <h2 className="font-serif text-4xl text-white font-normal mb-6">Experience True Comfort</h2>
        <p className="text-neutral-400 max-w-lg mx-auto mb-10 leading-relaxed">
          Book directly with us for the best rates and a personalized experience.
        </p>
        <Link to="/availability" className="btn-primary">
          Book Now
        </Link>
      </section>
    </>
  )
}
