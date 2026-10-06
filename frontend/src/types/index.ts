// ─── Hotel Config ─────────────────────────────────────────────────────────────

export interface HotelConfig {
  hotelName: string
  tagline: string
  logoUrl: string
  address: string
  phone: string
  email: string
  checkInTime: string
  checkOutTime: string
  currency: string
  currencySymbol: string
  description: string
  amenities: string[]
  cancellationPolicy: string
  maxAdvanceBookingDays: number
  socialInstagram: string
  socialFacebook: string
  galleryImages: string[]
}

// ─── Room Types ────────────────────────────────────────────────────────────────

export interface RoomType {
  roomTypeId: string
  name: string
  description: string
  maxOccupancy: number
  totalInventory: number
  basePrice: number
  active: boolean
  imageUrls: string[]
  amenities: string[]
  size?: string
  bedType?: string
  view?: string
}

// ─── Pricing ───────────────────────────────────────────────────────────────────

export interface PricingRule {
  ruleId: string
  roomTypeId: string
  ruleType: 'seasonal' | 'weekend'
  startDate?: string
  endDate?: string
  daysOfWeek?: string[]
  priceOverride?: number
  priceMultiplier?: number
  priority: number
}

export interface NightlyPrice {
  date: string
  price: number
  ruleApplied?: string
}

export interface RoomTypePricing {
  roomTypeId: string
  pricePerNight: number
  nightlyBreakdown: NightlyPrice[]
  totalPrice: number
  nights: number
}

// ─── Availability ──────────────────────────────────────────────────────────────

export interface AvailabilityRequest {
  checkIn: string
  checkOut: string
}

export interface AvailableRoomType extends RoomType {
  availableCount: number
  pricing: RoomTypePricing
}

export interface AvailabilityResponse {
  checkIn: string
  checkOut: string
  nights: number
  available: AvailableRoomType[]
}

// ─── Bookings ──────────────────────────────────────────────────────────────────

export type BookingStatus = 'confirmed' | 'cancelled'

export interface BookingRoom {
  bookingRoomId: string
  bookingId: string
  roomTypeId: string
  roomTypeName: string
  quantity: number
  pricePerNight: number
  subtotal: number
}

export interface Booking {
  bookingId: string
  bookingNumber: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  nights: number
  status: BookingStatus
  totalAmount: number
  rooms: BookingRoom[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface BookingRoomRequest {
  roomTypeId: string
  quantity: number
}

export interface CreateBookingRequest {
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  rooms: BookingRoomRequest[]
  notes?: string
}

export interface CreateBookingResponse {
  booking: Booking
  message: string
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export interface StaffLoginRequest {
  password: string
}

export interface StaffLoginResponse {
  token: string
  expiresAt: string
}

export interface StaffBookingListParams {
  page?: number
  pageSize?: number
  status?: BookingStatus | 'all'
  search?: string
  checkIn?: string
  checkOut?: string
}

export interface StaffBookingListResponse {
  bookings: Booking[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface StaffUpdateBookingRequest {
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  notes?: string
}

export interface StaffCancelBookingRequest {
  reason?: string
}

// ─── API Response wrapper ─────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: string
  code?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Booking flow state ───────────────────────────────────────────────────────

export interface BookingSelection {
  checkIn: string
  checkOut: string
  rooms: BookingRoomRequest[]
  availability: AvailabilityResponse | null
}

export interface BookingFlowState {
  selection: BookingSelection | null
  guestDetails: Partial<CreateBookingRequest> | null
  confirmation: Booking | null
}
