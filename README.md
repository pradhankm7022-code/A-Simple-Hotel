# The Paradise — Hotel Booking & Management System

A lightweight, production-ready hotel booking platform built with:

- **Frontend:** React + TypeScript + Vite + Tailwind CSS → Cloudflare Pages
- **Backend:** Google Apps Script Web App
- **Database:** Google Sheets
- **Images:** Cloudinary / Cloudflare R2

## Features

**Guest-facing:**
- Browse hotel, rooms, amenities, gallery
- Check real-time availability with date picker
- Select room types and quantities
- Complete booking with guest details
- Receive on-screen and email confirmation
- Retrieve existing booking by reference + email

**Staff panel:**
- View, search, and filter all bookings
- Check availability across date ranges
- Create bookings on behalf of guests
- Edit guest details
- Cancel bookings
- Dashboard with recent bookings

## Architecture Highlights

- Availability is always calculated server-side
- Double-booking prevented via `LockService` critical section
- Seasonal and weekend pricing rules engine
- Multi-room-type bookings supported
- Complete isolation between hotel instances
- Hotel configuration loaded from Google Sheets — no hardcoded hotel data

## Quick Start

See [docs/setup.md](docs/setup.md) for full deployment instructions.

## Repository Structure

```
hotel-template/
├── frontend/          ← React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/api.ts
│   │   ├── context/
│   │   ├── types/
│   │   └── utils/
│   └── ...
├── backend/           ← Google Apps Script
│   └── src/
│       ├── router.gs
│       ├── api/
│       ├── services/
│       ├── repositories/
│       └── utils/
├── sheets/
│   └── schema.md      ← Google Sheets column definitions
└── docs/
    └── setup.md       ← Deployment guide
```

## Replicating for Another Hotel

1. Clone this repo
2. Create new Google Sheet + Apps Script project
3. Create new Cloudflare Pages project
4. Set `VITE_API_URL` to new Apps Script URL
5. Fill hotel data in the Sheet
6. Deploy

Each hotel is completely isolated with its own Sheet, Script, and Pages project.
