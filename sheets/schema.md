# Google Sheets Schema — The Paradise

## Setup Instructions

Create a new Google Sheet with the following tabs (sheets) in this order.
Use the exact column headers shown — the Apps Script backend references columns by name.

---

## Sheet 1: `HotelConfig`

Two-column key/value store. No header row needed — start at row 1.

| Column A (key)               | Column B (value)                          |
|------------------------------|-------------------------------------------|
| hotel_name                   | The Paradise                              |
| tagline                      | Where Luxury Meets Serenity               |
| logo_url                     | https://your-cdn.com/logo.png             |
| address                      | 123 Beach Road, Calangute, Goa 403516     |
| phone                        | +91-9876543210                            |
| email                        | info@theparadise.com                      |
| check_in_time                | 14:00                                     |
| check_out_time               | 11:00                                     |
| currency                     | INR                                       |
| currency_symbol              | ₹                                         |
| description                  | A luxury boutique hotel on the beach...   |
| amenities                    | Pool,Free WiFi,Restaurant,Spa,Parking     |
| cancellation_policy          | Contact hotel to modify or cancel         |
| max_advance_booking_days     | 365                                       |
| social_instagram             | https://instagram.com/theparadisegoa      |
| social_facebook              | https://facebook.com/theparadisegoa       |
| gallery_images               | url1\|url2\|url3\|url4\|url5              |

---

## Sheet 2: `RoomTypes`

Header row in row 1. Data starts at row 2.

| Column         | Type    | Notes                                         |
|----------------|---------|-----------------------------------------------|
| room_type_id   | string  | e.g. `rt_001` — set once, never change        |
| name           | string  | e.g. `Deluxe Room`                            |
| description    | string  | Marketing description shown on website        |
| max_occupancy  | integer | Maximum guests                                |
| total_inventory| integer | Total rooms of this type in the hotel         |
| base_price     | number  | Default price per night in hotel currency     |
| active         | boolean | TRUE/FALSE — hide a type without deleting it  |
| image_urls     | string  | Pipe-separated CDN URLs: `url1\|url2\|url3`   |
| amenities      | string  | Comma-separated: `AC,TV,WiFi,Minibar`         |
| size           | string  | e.g. `32 sqm`                                 |
| bed_type       | string  | e.g. `King Bed`                               |
| view           | string  | e.g. `Sea View`                               |

### Sample data

| room_type_id | name            | description                        | max_occupancy | total_inventory | base_price | active | image_urls               | amenities                  | size   | bed_type  | view      |
|--------------|-----------------|------------------------------------|---------------|-----------------|------------|--------|--------------------------|----------------------------|--------|-----------|-----------|
| rt_001       | Deluxe Room     | Spacious room with garden view     | 2             | 8               | 4500       | TRUE   | https://cdn.../del1.jpg  | AC,TV,WiFi,Hot Water       | 28 sqm | Queen Bed | Garden View |
| rt_002       | Premium Suite   | Luxury suite with private balcony  | 2             | 4               | 8000       | TRUE   | https://cdn.../suite1.jpg| AC,TV,WiFi,Minibar,Bathtub | 45 sqm | King Bed  | Sea View  |
| rt_003       | Family Room     | Two-bedroom setup for families     | 4             | 3               | 7000       | TRUE   | https://cdn.../fam1.jpg  | AC,TV,WiFi,Hot Water       | 52 sqm | 2 Queen Beds | Pool View |

---

## Sheet 3: `PricingRules`

Header row in row 1. Data starts at row 2.

| Column           | Type    | Notes                                                    |
|------------------|---------|----------------------------------------------------------|
| rule_id          | string  | e.g. `pr_001`                                            |
| room_type_id     | string  | FK to RoomTypes. Use `ALL` to apply to every room type   |
| rule_type        | string  | `seasonal` or `weekend`                                  |
| start_date       | string  | `yyyy-MM-dd`. Required for `seasonal`, blank for `weekend` |
| end_date         | string  | `yyyy-MM-dd`. Required for `seasonal`, blank for `weekend` |
| days_of_week     | string  | Comma-separated for `weekend`: `Fri,Sat`. Blank for seasonal |
| price_override   | number  | Exact price per night. Blank if using multiplier         |
| price_multiplier | number  | e.g. `1.5` = 50% more. Blank if using override          |
| priority         | integer | Higher number = higher priority. Wins over lower         |
| active           | boolean | TRUE/FALSE                                               |

### Sample data

| rule_id | room_type_id | rule_type | start_date | end_date   | days_of_week | price_override | price_multiplier | priority | active |
|---------|--------------|-----------|------------|------------|--------------|----------------|------------------|----------|--------|
| pr_001  | ALL          | seasonal  | 2024-12-20 | 2025-01-05 |              | 7500           |                  | 10       | TRUE   |
| pr_002  | rt_002       | seasonal  | 2024-12-20 | 2025-01-05 |              | 12000          |                  | 20       | TRUE   |
| pr_003  | ALL          | weekend   |            |            | Fri,Sat      |                | 1.2              | 5        | TRUE   |

---

## Sheet 4: `Bookings`

Header row in row 1. Data starts at row 2.

| Column         | Type    | Notes                                              |
|----------------|---------|----------------------------------------------------|
| booking_id     | string  | e.g. `bk_a1b2c3d4` — random hex, set by system    |
| booking_number | string  | e.g. `PAR-2024-0001` — human-readable              |
| guest_name     | string  |                                                    |
| guest_email    | string  |                                                    |
| guest_phone    | string  |                                                    |
| check_in       | string  | `yyyy-MM-dd`                                       |
| check_out      | string  | `yyyy-MM-dd`                                       |
| nights         | integer | Calculated: check_out - check_in                   |
| status         | string  | `confirmed` or `cancelled`                         |
| total_amount   | number  | Total charged amount                               |
| notes          | string  | Optional guest or staff notes                      |
| created_at     | string  | ISO datetime                                       |
| updated_at     | string  | ISO datetime                                       |

---

## Sheet 5: `BookingRooms`

Header row in row 1. Data starts at row 2.

| Column          | Type    | Notes                                  |
|-----------------|---------|----------------------------------------|
| booking_room_id | string  | e.g. `br_001`                          |
| booking_id      | string  | FK to Bookings.booking_id              |
| room_type_id    | string  | FK to RoomTypes.room_type_id           |
| room_type_name  | string  | Snapshot of name at booking time       |
| quantity        | integer | Number of rooms of this type booked    |
| price_per_night | number  | Snapshot of per-night price at booking |
| subtotal        | number  | price_per_night × quantity × nights    |

---

## Sheet 6: `BlockedDates`

Header row in row 1. Data starts at row 2.

| Column       | Type    | Notes                                                  |
|--------------|---------|--------------------------------------------------------|
| block_id     | string  | e.g. `bl_001`                                          |
| room_type_id | string  | FK to RoomTypes. Use `ALL` to block entire hotel       |
| start_date   | string  | `yyyy-MM-dd`                                           |
| end_date     | string  | `yyyy-MM-dd` inclusive                                 |
| quantity     | integer | How many rooms to block. Use total_inventory to block all |
| reason       | string  | e.g. `maintenance`, `staff use`                        |
| active       | boolean | TRUE/FALSE                                             |

---

## Sheet 7: `Settings`

Two-column key/value store. No header row — start at row 1.

| Column A (key)              | Column B (value)  | Notes                                  |
|-----------------------------|-------------------|----------------------------------------|
| booking_counter_2024        | 0                 | Incremented per booking, per year      |
| booking_counter_2025        | 0                 | Add new row each year                  |
| staff_password_hash         |                   | SHA-256 of staff password (hex string) |
| email_confirmation_enabled  | true              |                                        |
| hotel_email_reply_to        | info@theparadise.com |                                     |

---

## Sheet 8: `StaffSessions`

Header row in row 1. Data starts at row 2.

| Column     | Type   | Notes                              |
|------------|--------|------------------------------------|
| token      | string | 64-char random hex token           |
| expires_at | string | ISO datetime                       |
| created_at | string | ISO datetime                       |

Old/expired rows can be cleaned up periodically by a triggered Apps Script function.

---

## Notes

- All dates stored as `yyyy-MM-dd` strings (not Date objects) to avoid timezone issues in Sheets.
- All datetimes stored as ISO 8601 strings: `2024-12-01T14:00:00.000Z`.
- Pipe `|` is used as separator for multi-value strings (image_urls).
- Comma `,` is used as separator for list strings (amenities, days_of_week).
- Never rely on row numbers for IDs — always use the ID columns.
- The Apps Script service account email must be an Editor on the Sheet.
