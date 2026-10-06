import { Star, Wifi, Wind, Tv, Bath, ShieldCheck, Coffee, Waves, Snowflake, Zap } from 'lucide-react'

const SIZE = 'h-4 w-4'

export const ROOM_AMENITY_ICONS: Record<string, React.ReactNode> = {
  'AC':          <Wind className={SIZE} />,
  'TV':          <Tv className={SIZE} />,
  'Free WiFi':   <Wifi className={SIZE} />,
  'WiFi':        <Wifi className={SIZE} />,
  'Hot Water':   <Snowflake className={SIZE} />,
  'Bathtub':     <Bath className={SIZE} />,
  'Safe':        <ShieldCheck className={SIZE} />,
  'Minibar':     <Coffee className={SIZE} />,
  'Mini Bar':    <Coffee className={SIZE} />,
  'Pool View':   <Waves className={SIZE} />,
  'Power Backup':<Zap className={SIZE} />,
}

export function getRoomAmenityIcon(name: string): React.ReactNode {
  return ROOM_AMENITY_ICONS[name] ?? <Star className={SIZE} />
}
