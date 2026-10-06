var BookingService = (function () {

  function createBooking(body) {
    var lock = LockService.getScriptLock();

    try {
      // Acquire lock — wait up to 10 seconds
      lock.waitLock(10000);
    } catch (e) {
      return { success: false, error: 'Server is busy, please try again in a moment.', conflict: false };
    }

    try {
      // ── Inside the critical section ──────────────────────────────────────

      // 1. Re-verify availability with fresh data
      var availCheck = AvailabilityService.verifyAvailability(
        body.checkIn,
        body.checkOut,
        body.rooms
      );
      if (!availCheck.available) {
        return {
          success: false,
          error: 'Rooms no longer available: ' + availCheck.errors.join(', '),
          conflict: true,
        };
      }

      // 2. Calculate server-side prices
      var roomRows = [];
      var totalAmount = 0;
      var nights = PricingService.getDatesBetween(body.checkIn, body.checkOut).length;

      for (var i = 0; i < body.rooms.length; i++) {
        var req = body.rooms[i];
        var rt = RoomTypeRepo.getById(req.roomTypeId);
        var pricing = PricingService.calculatePricing(rt, body.checkIn, body.checkOut);
        var roomSubtotal = pricing.totalPrice * req.quantity;
        totalAmount += roomSubtotal;

        roomRows.push({
          bookingRoomId: IdGenerator.bookingRoomId(),
          bookingId:     null, // filled in after ID generated
          roomTypeId:    rt.roomTypeId,
          roomTypeName:  rt.name,
          quantity:      req.quantity,
          pricePerNight: pricing.pricePerNight,
          subtotal:      roomSubtotal,
        });
      }

      // 3. Generate IDs and booking number
      var bookingId = IdGenerator.bookingId();
      var year = new Date().getFullYear();
      var counter = BookingRepo.getNextBookingCounter(year);
      var bookingNumber = IdGenerator.bookingNumber(counter, year);
      var now = new Date().toISOString();

      roomRows.forEach(function (r) { r.bookingId = bookingId; });

      var booking = {
        bookingId:     bookingId,
        bookingNumber: bookingNumber,
        guestName:     Validator.sanitizeString(body.guestName, 100),
        guestEmail:    body.guestEmail.toLowerCase().trim(),
        guestPhone:    Validator.sanitizeString(body.guestPhone, 30),
        checkIn:       body.checkIn,
        checkOut:      body.checkOut,
        nights:        nights,
        status:        'confirmed',
        totalAmount:   totalAmount,
        notes:         Validator.sanitizeString(body.notes || '', 500),
        createdAt:     now,
        updatedAt:     now,
        rooms:         roomRows,
      };

      // 4. Write to sheets
      BookingRepo.appendBooking(booking);
      BookingRepo.appendBookingRooms(roomRows);

      // ── End of critical section ──────────────────────────────────────────

      lock.releaseLock();

      // 5. Send confirmation email (outside lock)
      try {
        EmailService.sendConfirmation(booking);
      } catch (emailErr) {
        Logger.log('Email failed for ' + bookingId + ': ' + emailErr.message);
        // Non-fatal — booking is still confirmed
      }

      return { success: true, booking: booking };

    } catch (err) {
      lock.releaseLock();
      Logger.log('createBooking error: ' + err.message + '\n' + err.stack);
      return { success: false, error: 'Failed to create booking. Please try again.', conflict: false };
    }
  }

  function cancelBooking(bookingId) {
    var result = BookingRepo.findById(bookingId);
    if (!result) return { success: false, error: 'Booking not found' };

    var booking = result.booking;
    if (booking.status === 'cancelled') {
      return { success: false, error: 'Booking is already cancelled' };
    }

    var now = new Date().toISOString();
    BookingRepo.updateStatus(result.rowIndex, 'cancelled', now);
    booking.status = 'cancelled';
    booking.updatedAt = now;

    return { success: true, booking: booking };
  }

  function updateBooking(bookingId, fields) {
    var result = BookingRepo.findById(bookingId);
    if (!result) return { success: false, error: 'Booking not found' };

    var booking = result.booking;
    var now = new Date().toISOString();

    var allowed = {};
    if (fields.guestName)  allowed.guestName  = Validator.sanitizeString(fields.guestName, 100);
    if (fields.guestEmail && Validator.isEmail(fields.guestEmail))
                           allowed.guestEmail = fields.guestEmail.toLowerCase().trim();
    if (fields.guestPhone) allowed.guestPhone = Validator.sanitizeString(fields.guestPhone, 30);
    if (fields.notes !== undefined) allowed.notes = Validator.sanitizeString(fields.notes, 500);

    BookingRepo.updateGuestDetails(result.rowIndex, allowed, now);

    // Merge into booking object for response
    for (var k in allowed) booking[k] = allowed[k];
    booking.updatedAt = now;

    return { success: true, booking: booking };
  }

  return {
    createBooking: createBooking,
    cancelBooking: cancelBooking,
    updateBooking: updateBooking,
  };
})();
