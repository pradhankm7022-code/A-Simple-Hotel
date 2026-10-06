# The Paradise — Setup & Deployment Guide

## Prerequisites

- Google Account (for Sheets + Apps Script)
- Cloudflare account (for Pages)
- Node.js 18+ (for local development)
- Image hosting account (Cloudinary or Cloudflare R2)

---

## Step 1 — Create Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet.
2. Name it: `The Paradise — Hotel Database`
3. Create the following sheets (tabs) in this exact order:
   - `HotelConfig`
   - `RoomTypes`
   - `PricingRules`
   - `Bookings`
   - `BookingRooms`
   - `BlockedDates`
   - `Settings`
   - `StaffSessions`
4. Follow `sheets/schema.md` to add column headers and seed data to each sheet.
5. Copy the **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/**SPREADSHEET_ID**/edit`

---

## Step 2 — Set Up Google Apps Script

1. Go to [script.google.com](https://script.google.com) → New Project.
2. Name it: `The Paradise — Backend`
3. Copy the contents of each `.gs` file from `backend/src/` into the Apps Script editor.
   Create separate script files for each `.gs` file (File → New Script).
   **Important: create files in this order** so dependencies resolve correctly:
   ```
   router.gs
   utils/response.gs
   utils/idGenerator.gs
   utils/validator.gs
   repositories/configRepo.gs
   repositories/roomTypeRepo.gs
   repositories/pricingRepo.gs
   repositories/blockedDateRepo.gs
   repositories/bookingRepo.gs
   services/pricingService.gs
   services/availabilityService.gs
   services/bookingService.gs
   services/emailService.gs
   services/authService.gs
   api/publicHandlers.gs
   api/staffHandlers.gs
   ```
4. Replace the contents of `appsscript.json` with the file from `backend/appsscript.json`.
   (Click Project Settings → enable "Show `appsscript.json` manifest file")

---

## Step 3 — Configure Apps Script Properties

1. In Apps Script editor → Project Settings → Script Properties.
2. Add property:
   - **Name:** `SHEET_ID`
   - **Value:** `[your spreadsheet ID from Step 1]`

---

## Step 4 — Set Staff Password

1. In Apps Script editor, open `authService.gs`.
2. In the editor, run the function `AuthService.setPassword` manually:
   - Select the function from the dropdown: choose `setPassword`
   - This won't work directly because it needs a parameter.
   - Instead, create a temporary one-off function at the bottom of `router.gs`:
     ```javascript
     function setupPassword() {
       AuthService.setPassword('your_secure_password_here');
     }
     ```
   - Run `setupPassword` once from the Apps Script editor.
   - **Delete `setupPassword` after running it.**

---

## Step 5 — Deploy Apps Script as Web App

1. In Apps Script editor → Deploy → New Deployment.
2. Select type: **Web App**.
3. Settings:
   - **Execute as:** Me
   - **Who has access:** Anyone (anonymous)
4. Click Deploy.
5. Copy the **Web App URL** (format: `https://script.google.com/macros/s/XXXXXXX/exec`).

---

## Step 6 — Configure Frontend

1. In the `frontend/` directory, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Edit `.env.local`:
   ```
   VITE_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   VITE_ENV=production
   ```

---

## Step 7 — Local Development

```bash
cd frontend
npm install
npm run dev
```

The app will run at `http://localhost:5173`.

---

## Step 8 — Deploy to Cloudflare Pages

1. Push the project to a GitHub repository.
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → Create Application.
3. Connect to your GitHub repository.
4. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `frontend`
5. Environment variables (in Cloudflare Pages settings):
   - `VITE_API_URL` = your Apps Script web app URL
   - `VITE_ENV` = `production`
6. Deploy.

---

## Step 9 — Configure Hotel Information

All hotel-specific content is stored in the Google Sheet — **not in the code**.

To configure The Paradise:
1. Open the `HotelConfig` sheet.
2. Fill in all key/value rows (see `sheets/schema.md`).
3. Open the `RoomTypes` sheet and add your room types.
4. Open the `PricingRules` sheet and add pricing rules if needed.

Changes to the Sheet take effect within ~5 minutes (CacheService TTL).

To clear the cache immediately: in Apps Script editor, run:
```javascript
function clearCache() {
  CacheService.getScriptCache().removeAll(['hotel_config_v1', 'room_types_v1', 'room_types_v1_active', 'pricing_rules_v1']);
}
```

---

## Replicating for Another Hotel

1. Clone/fork this repository.
2. Create a new Google Sheet (Step 1).
3. Create a new Apps Script project (Steps 2–5).
4. Create a new Cloudflare Pages project (Step 8).
5. All hotel data goes in the new Sheet — no code changes needed.
6. Each hotel has completely isolated data, backend, and frontend.

---

## Staff Access

Staff panel is at: `https://your-domain.com/staff/login`

Use the password set in Step 4.

To change the password:
1. Run `AuthService.setPassword('new_password')` in Apps Script editor.
2. All existing staff sessions are automatically invalidated on next request
   (they expire within 8 hours anyway).

---

## Troubleshooting

| Problem | Solution |
|---|---|
| API returns 500 | Check Apps Script execution logs (View → Executions) |
| "Missing SHEET_ID" error | Check Script Properties in Apps Script |
| Bookings not saving | Verify the Sheet ID is correct and the script account has Editor access |
| Email not sending | Check Gmail quota and `email_confirmation_enabled` setting in Settings sheet |
| Availability looks wrong | Verify date format in Bookings sheet is `yyyy-MM-dd` (not a Date type) |
| Cache stale | Run `clearCache()` function in Apps Script editor |
