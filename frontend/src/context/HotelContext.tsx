import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '@/services/api'
import type { HotelConfig, RoomType } from '@/types'

interface HotelContextValue {
  config: HotelConfig | null
  roomTypes: RoomType[]
  loading: boolean
  error: string | null
}

const HotelContext = createContext<HotelContextValue | null>(null)

export function HotelProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<HotelConfig | null>(null)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.getHotelConfig(), api.getRoomTypes()])
      .then(([cfg, rooms]) => {
        setConfig(cfg)
        setRoomTypes(rooms)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <HotelContext.Provider value={{ config, roomTypes, loading, error }}>
      {children}
    </HotelContext.Provider>
  )
}

export function useHotel() {
  const ctx = useContext(HotelContext)
  if (!ctx) throw new Error('useHotel must be used within HotelProvider')
  return ctx
}
