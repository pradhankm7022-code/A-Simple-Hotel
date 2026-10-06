import type {
  HotelConfig,
  RoomType,
  AvailabilityResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  Booking,
  StaffLoginRequest,
  StaffLoginResponse,
  StaffBookingListParams,
  StaffBookingListResponse,
  StaffUpdateBookingRequest,
  ApiResponse,
} from '@/types'

const API_URL = import.meta.env.VITE_API_URL as string

class ApiError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ─── Core fetch wrapper ────────────────────────────────────────────────────────

async function apiFetch<T>(
  action: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH'
    params?: Record<string, string | number | undefined>
    body?: unknown
    token?: string
  } = {}
): Promise<T> {
  const { params = {}, body, token } = options

  const base = API_URL.startsWith('http') ? API_URL : window.location.origin + API_URL
  const url = new URL(base)
  url.searchParams.set('action', action)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }
  // Encode body as a query param to avoid CORS preflight on POST
  if (body) url.searchParams.set('body', JSON.stringify(body))
  if (token) url.searchParams.set('token', token)

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new ApiError('NETWORK_ERROR', `HTTP ${response.status}: ${response.statusText}`)
  }

  const result = (await response.json()) as ApiResponse<T>

  if (!result.success) {
    throw new ApiError(result.code ?? 'API_ERROR', result.error)
  }

  return result.data
}

// ─── Public API ────────────────────────────────────────────────────────────────

export const api = {
  getHotelConfig(): Promise<HotelConfig> {
    return apiFetch('getHotelConfig')
  },

  getRoomTypes(): Promise<RoomType[]> {
    return apiFetch('getRoomTypes')
  },

  getRoomType(id: string): Promise<RoomType> {
    return apiFetch('getRoomType', { params: { id } })
  },

  checkAvailability(checkIn: string, checkOut: string): Promise<AvailabilityResponse> {
    return apiFetch('checkAvailability', { params: { checkIn, checkOut } })
  },

  createBooking(data: CreateBookingRequest): Promise<CreateBookingResponse> {
    return apiFetch('createBooking', { method: 'POST', body: data })
  },

  getBooking(bookingNumber: string, email: string): Promise<Booking> {
    return apiFetch('getBooking', { params: { bookingNumber, email } })
  },
}

// ─── Staff API ─────────────────────────────────────────────────────────────────

export const staffApi = {
  login(data: StaffLoginRequest): Promise<StaffLoginResponse> {
    return apiFetch('staffLogin', { method: 'POST', body: data })
  },

  logout(token: string): Promise<void> {
    return apiFetch('staffLogout', { method: 'POST', token })
  },

  getBookings(params: StaffBookingListParams, token: string): Promise<StaffBookingListResponse> {
    return apiFetch('staffGetBookings', {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        status: params.status,
        search: params.search,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
      },
      token,
    })
  },

  getBooking(id: string, token: string): Promise<Booking> {
    return apiFetch('staffGetBooking', { params: { id }, token })
  },

  checkAvailability(checkIn: string, checkOut: string, token: string): Promise<AvailabilityResponse> {
    return apiFetch('staffGetAvailability', { params: { checkIn, checkOut }, token })
  },

  createBooking(data: CreateBookingRequest, token: string): Promise<CreateBookingResponse> {
    return apiFetch('staffCreateBooking', { method: 'POST', body: data, token })
  },

  updateBooking(id: string, data: StaffUpdateBookingRequest, token: string): Promise<Booking> {
    return apiFetch('staffUpdateBooking', { method: 'PATCH', params: { id }, body: data, token })
  },

  cancelBooking(id: string, reason: string | undefined, token: string): Promise<Booking> {
    return apiFetch('staffCancelBooking', {
      method: 'POST',
      params: { id },
      body: { reason },
      token,
    })
  },
}

export { ApiError }
