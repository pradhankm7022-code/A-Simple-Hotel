import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useHotel } from '@/context/HotelContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { ApiError } from '@/services/api'

export default function StaffLoginPage() {
  const { login } = useAuth()
  const { config } = useHotel()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const hotelName = config?.hotelName ?? 'The Paradise'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(password)
      navigate('/staff')
    } catch (err) {
      if (err instanceof ApiError) {
        setError('Invalid password. Please try again.')
      } else {
        setError('Login failed. Please check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-white">{hotelName}</h1>
          <p className="text-neutral-400 text-sm mt-2">Staff Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 space-y-5">
          <h2 className="font-serif text-xl text-neutral-900 mb-2">Sign In</h2>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}
