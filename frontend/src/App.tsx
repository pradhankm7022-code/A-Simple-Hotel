import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { HotelProvider } from '@/context/HotelContext'
import { AuthProvider } from '@/context/AuthContext'
import PublicLayout from '@/layouts/PublicLayout'
import StaffLayout from '@/layouts/StaffLayout'
import ProtectedRoute from '@/components/staff/ProtectedRoute'

import HomePage from '@/pages/public/HomePage'
import RoomsPage from '@/pages/public/RoomsPage'
import RoomDetailPage from '@/pages/public/RoomDetailPage'
import AmenitiesPage from '@/pages/public/AmenitiesPage'
import GalleryPage from '@/pages/public/GalleryPage'
import AboutPage from '@/pages/public/AboutPage'
import AvailabilityPage from '@/pages/public/AvailabilityPage'
import BookingPage from '@/pages/public/BookingPage'
import ConfirmationPage from '@/pages/public/ConfirmationPage'
import ManageBookingPage from '@/pages/public/ManageBookingPage'

import StaffLoginPage from '@/pages/staff/StaffLoginPage'
import StaffDashboardPage from '@/pages/staff/StaffDashboardPage'
import StaffBookingsPage from '@/pages/staff/StaffBookingsPage'
import StaffAvailabilityPage from '@/pages/staff/StaffAvailabilityPage'
import StaffBookingDetailPage from '@/pages/staff/StaffBookingDetailPage'
import StaffCreateBookingPage from '@/pages/staff/StaffCreateBookingPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <HotelProvider>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/rooms/:id" element={<RoomDetailPage />} />
              <Route path="/amenities" element={<AmenitiesPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/availability" element={<AvailabilityPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/manage-booking" element={<ManageBookingPage />} />
            </Route>

            {/* Staff login (no layout) */}
            <Route path="/staff/login" element={<StaffLoginPage />} />

            {/* Staff protected routes */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute>
                  <StaffLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StaffDashboardPage />} />
              <Route path="bookings" element={<StaffBookingsPage />} />
              <Route path="bookings/new" element={<StaffCreateBookingPage />} />
              <Route path="bookings/:id" element={<StaffBookingDetailPage />} />
              <Route path="availability" element={<StaffAvailabilityPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </HotelProvider>
    </BrowserRouter>
  )
}
