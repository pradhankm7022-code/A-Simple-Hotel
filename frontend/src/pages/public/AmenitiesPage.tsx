import {
  Waves, Wifi, UtensilsCrossed, Coffee, Beer, Sparkles, Dumbbell, Wind,
  Car, Plane, BellRing, Bath, Tv, ShieldCheck, Shirt, TreePine,
  FlameKindling, MapPin, Clock, Star
} from 'lucide-react'
import { useHotel } from '@/context/HotelContext'
import Spinner from '@/components/ui/Spinner'

const ICON_MAP: Record<string, React.ReactNode> = {
  'Swimming Pool':   <Waves className="h-8 w-8" />,
  'Free WiFi':       <Wifi className="h-8 w-8" />,
  'Restaurant':      <UtensilsCrossed className="h-8 w-8" />,
  'Free Breakfast':  <Coffee className="h-8 w-8" />,
  'Bar':             <Beer className="h-8 w-8" />,
  'Spa':             <Sparkles className="h-8 w-8" />,
  'Gym':             <Dumbbell className="h-8 w-8" />,
  'AC':              <Wind className="h-8 w-8" />,
  'Free Parking':    <Car className="h-8 w-8" />,
  'Airport Shuttle': <Plane className="h-8 w-8" />,
  'Room Service':    <BellRing className="h-8 w-8" />,
  'Bathtub':         <Bath className="h-8 w-8" />,
  'TV':              <Tv className="h-8 w-8" />,
  '24/7 Security':   <ShieldCheck className="h-8 w-8" />,
  'Laundry Service': <Shirt className="h-8 w-8" />,
  'Garden':          <TreePine className="h-8 w-8" />,
  'Bonfire':         <FlameKindling className="h-8 w-8" />,
  'Tour Desk':       <MapPin className="h-8 w-8" />,
  'Early Check-in':  <Clock className="h-8 w-8" />,
  'Late Check-out':  <Clock className="h-8 w-8" />,
}

export default function AmenitiesPage() {
  const { config, loading } = useHotel()
  if (loading) return <div className="flex justify-center py-32"><Spinner /></div>

  const amenities = config?.amenities ?? []

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <p className="text-brand-600 text-xs font-semibold uppercase tracking-[0.3em] mb-3">What We Offer</p>
        <h1 className="section-heading">Hotel Amenities</h1>
        <p className="text-neutral-500 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
          Everything you need for an exceptional stay.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {amenities.map((a) => (
          <div key={a} className="flex flex-col items-center text-center p-8 card hover:border-brand-200 transition-colors">
            <div className="text-brand-600 mb-4">
              {ICON_MAP[a] ?? <Star className="h-8 w-8" />}
            </div>
            <h3 className="font-medium text-neutral-900">{a}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}
