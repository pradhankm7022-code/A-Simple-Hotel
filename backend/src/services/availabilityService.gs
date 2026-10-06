var AvailabilityService = (function () {

  // Main public function — returns available room types with pricing
  function checkAvailability(checkIn, checkOut) {
    var nights = PricingService.getDatesBetween(checkIn, checkOut);
    var nightCount = nights.length;

    // Load all confirmed bookings and booking rooms in one batch read
    var confirmedBookings = BookingRepo.getConfirmedOverlapping(checkIn, checkOut);
    var blockedDates = BlockedDateRepo.getActive();
    var roomTypes = RoomTypeRepo.getAll(true);

    var available = [];

    roomTypes.forEach(function (rt) {
      var minAvail = rt.totalInventory;

      // Check each night
      for (var i = 0; i < nights.length; i++) {
        var night = nights[i];
        var occupied = occupiedOnNight(rt.roomTypeId, night, confirmedBookings);
        var blocked  = blockedOnNight(rt.roomTypeId, night, blockedDates, rt.totalInventory);
        var avail = rt.totalInventory - occupied - blocked;
        if (avail < minAvail) minAvail = avail;
        if (minAvail <= 0) break; // short-circuit
      }

      if (minAvail > 0) {
        var pricing = PricingService.calculatePricing(rt, checkIn, checkOut);
        var result = {};
        // Spread rt fields
        for (var key in rt) result[key] = rt[key];
        result.availableCount = minAvail;
        result.pricing = pricing;
        available.push(result);
      }
    });

    return {
      checkIn:  checkIn,
      checkOut: checkOut,
      nights:   nightCount,
      available: available,
    };
  }

  // How many rooms of this type are occupied on a given night?
  // A booking occupies night N if: check_in <= N < check_out  (exclusive check-out)
  function occupiedOnNight(roomTypeId, night, confirmedBookings) {
    var count = 0;
    for (var i = 0; i < confirmedBookings.length; i++) {
      var b = confirmedBookings[i];
      if (b.checkIn <= night && b.checkOut > night) {
        var roomRows = b.rooms || [];
        for (var j = 0; j < roomRows.length; j++) {
          if (roomRows[j].roomTypeId === roomTypeId) {
            count += roomRows[j].quantity;
          }
        }
      }
    }
    return count;
  }

  // How many rooms of this type are blocked on a given night?
  function blockedOnNight(roomTypeId, night, blockedDates, totalInventory) {
    var count = 0;
    for (var i = 0; i < blockedDates.length; i++) {
      var b = blockedDates[i];
      if (b.startDate <= night && b.endDate >= night) {
        if (b.roomTypeId === 'ALL' || b.roomTypeId === roomTypeId) {
          // If quantity == totalInventory, it means "block all"
          count += Math.min(b.quantity, totalInventory);
        }
      }
    }
    return Math.min(count, totalInventory);
  }

  // Used inside booking lock to re-verify a specific request
  function verifyAvailability(checkIn, checkOut, requestedRooms) {
    var nights = PricingService.getDatesBetween(checkIn, checkOut);
    var confirmedBookings = BookingRepo.getConfirmedOverlapping(checkIn, checkOut);
    var blockedDates = BlockedDateRepo.getActive();

    var errors = [];

    requestedRooms.forEach(function (req) {
      var rt = RoomTypeRepo.getById(req.roomTypeId);
      if (!rt || !rt.active) {
        errors.push('Room type ' + req.roomTypeId + ' is not available');
        return;
      }

      var minAvail = rt.totalInventory;
      for (var i = 0; i < nights.length; i++) {
        var night = nights[i];
        var occupied = occupiedOnNight(rt.roomTypeId, night, confirmedBookings);
        var blocked  = blockedOnNight(rt.roomTypeId, night, blockedDates, rt.totalInventory);
        var avail = rt.totalInventory - occupied - blocked;
        if (avail < minAvail) minAvail = avail;
      }

      if (minAvail < req.quantity) {
        errors.push(
          rt.name + ': requested ' + req.quantity +
          ' but only ' + minAvail + ' available'
        );
      }
    });

    return { available: errors.length === 0, errors: errors };
  }

  return {
    checkAvailability: checkAvailability,
    verifyAvailability: verifyAvailability,
  };
})();
