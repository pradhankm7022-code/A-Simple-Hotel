import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { staffApi } from '@/services/api'

const TOKEN_KEY = 'paradise_staff_token'
const EXPIRES_KEY = 'paradise_staff_expires'

interface AuthContextValue {
  token: string | null
  isAuthenticated: boolean
  login: (password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getStoredToken(): string | null {
  const token = sessionStorage.getItem(TOKEN_KEY)
  const expires = sessionStorage.getItem(EXPIRES_KEY)
  if (!token || !expires) return null
  if (new Date(expires) <= new Date()) {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(EXPIRES_KEY)
    return null
  }
  return token
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken)

  const login = useCallback(async (password: string) => {
    const result = await staffApi.login({ password })
    sessionStorage.setItem(TOKEN_KEY, result.token)
    sessionStorage.setItem(EXPIRES_KEY, result.expiresAt)
    setToken(result.token)
  }, [])

  const logout = useCallback(() => {
    if (token) staffApi.logout(token).catch(() => {})
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(EXPIRES_KEY)
    setToken(null)
  }, [token])

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
