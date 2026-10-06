var BookingRepo = (function () {

  var BOOKING_COLS = {
    booking_id:     0,
    booking_number: 1,
    guest_name:     2,
    guest_email:    3,
    guest_phone:    4,
    check_in:       5,
    check_out:      6,
    nights:         7,
    status:         8,
    total_amount:   9,
    notes:          10,
    created_at:     11,
    updated_at:     12,
  };

  var ROOM_COLS = {
    booking_room_id: 0,
    booking_id:      1,
    room_type_id:    2,
    room_type_name:  3,
    quantity:        4,
    price_per_night: 5,
    subtotal:        6,
  };

  function getBookingsSheet() {
    return SpreadsheetApp.openById(SHEET_ID).getSheetByName('Bookings');
  }

  function getRoomsSheet() {
    return SpreadsheetApp.openById(SHEET_ID).getSheetByName('BookingRooms');
  }

  function cellToDateString(val) {
    // Sheets auto-converts YYYY-MM-DD strings to Date objects
    if (val instanceof Date && !isNaN(val.getTime())) {
      var y = val.getFullYear();
      var m = ('0' + (val.getMonth() + 1)).slice(-2);
      var d = ('0' + val.getDate()).slice(-2);
      return y + '-' + m + '-' + d;
    }
    return String(val).trim();
  }

  function rowToBooking(row) {
    return {
      bookingId:     String(row[BOOKING_COLS.booking_id]).trim(),
      bookingNumber: String(row[BOOKING_COLS.booking_number]).trim(),
      guestName:     String(row[BOOKING_COLS.guest_name]).trim(),
      guestEmail:    String(row[BOOKING_COLS.guest_email]).trim(),
      guestPhone:    String(row[BOOKING_COLS.guest_phone]).trim(),
      checkIn:       cellToDateString(row[BOOKING_COLS.check_in]),
      checkOut:      cellToDateString(row[BOOKING_COLS.check_out]),
      nights:        Number(row[BOOKING_COLS.nights]) || 0,
      status:        String(row[BOOKING_COLS.status]).trim(),
      totalAmount:   Number(row[BOOKING_COLS.total_amount]) || 0,
      notes:         String(row[BOOKING_COLS.notes] || '').trim(),
      createdAt:     String(row[BOOKING_COLS.created_at]).trim(),
      updatedAt:     String(row[BOOKING_COLS.updated_at]).trim(),
      rooms:         [],
    };
  }

  function rowToBookingRoom(row) {
    return {
      bookingRoomId: String(row[ROOM_COLS.booking_room_id]).trim(),
      bookingId:     String(row[ROOM_COLS.booking_id]).trim(),
      roomTypeId:    String(row[ROOM_COLS.room_type_id]).trim(),
      roomTypeName:  String(row[ROOM_COLS.room_type_name]).trim(),
      quantity:      Number(row[ROOM_COLS.quantity]) || 0,
      pricePerNight: Number(row[ROOM_COLS.price_per_night]) || 0,
      subtotal:      Number(row[ROOM_COLS.subtotal]) || 0,
    };
  }

  // Load all bookings + rooms that could overlap with the date range.
  // overlap condition: booking.check_in < checkOut AND booking.check_out > checkIn
  function getConfirmedOverlapping(checkIn, checkOut) {
    var bSheet = getBookingsSheet();
    var bLastRow = bSheet.getLastRow();
    if (bLastRow < 2) return [];

    var bData = bSheet.getRange(2, 1, bLastRow - 1, 13).getValues();
    var overlapping = [];
    var ids = {};

    bData.forEach(function (row) {
      if (!row[BOOKING_COLS.booking_id]) return;
      if (String(row[BOOKING_COLS.status]) !== 'confirmed') return;
      var ci = cellToDateString(row[BOOKING_COLS.check_in]);
      var co = cellToDateString(row[BOOKING_COLS.check_out]);
      if (ci < checkOut && co > checkIn) {
        var b = rowToBooking(row);
        overlapping.push(b);
        ids[b.bookingId] = b;
      }
    });

    if (overlapping.length === 0) return [];

    // Load BookingRooms for these booking IDs
    var rSheet = getRoomsSheet();
    var rLastRow = rSheet.getLastRow();
    if (rLastRow < 2) return overlapping;

    var rData = rSheet.getRange(2, 1, rLastRow - 1, 7).getValues();
    rData.forEach(function (row) {
      if (!row[ROOM_COLS.booking_room_id]) return;
      var bid = String(row[ROOM_COLS.booking_id]).trim();
      if (ids[bid]) {
        ids[bid].rooms.push(rowToBookingRoom(row));
      }
    });

    return overlapping;
  }

  function findByNumberAndEmail(bookingNumber, email) {
    var bSheet = getBookingsSheet();
    var lastRow = bSheet.getLastRow();
    if (lastRow < 2) return null;

    var data = bSheet.getRange(2, 1, lastRow - 1, 13).getValues();
    var match = null;
    var matchRow = null;

    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      if (
        String(row[BOOKING_COLS.booking_number]).trim() === bookingNumber &&
        String(row[BOOKING_COLS.guest_email]).trim().toLowerCase() === email
      ) {
        match = rowToBooking(row);
        break;
      }
    }

    if (!match) return null;

    // Load rooms
    var rSheet = getRoomsSheet();
    var rLastRow = rSheet.getLastRow();
    if (rLastRow >= 2) {
      var rData = rSheet.getRange(2, 1, rLastRow - 1, 7).getValues();
      rData.forEach(function (row) {
        if (String(row[ROOM_COLS.booking_id]).trim() === match.bookingId) {
          match.rooms.push(rowToBookingRoom(row));
        }
      });
    }

    return match;
  }

  function findById(bookingId) {
    var bSheet = getBookingsSheet();
    var lastRow = bSheet.getLastRow();
    if (lastRow < 2) return null;

    var data = bSheet.getRange(2, 1, lastRow - 1, 13).getValues();
    var match = null;
    var matchRowIndex = -1;

    for (var i = 0; i < data.length; i++) {
      if (String(data[i][BOOKING_COLS.booking_id]).trim() === bookingId) {
        match = rowToBooking(data[i]);
        matchRowIndex = i + 2; // 1-indexed + header
        break;
      }
    }

    if (!match) return null;

    var rSheet = getRoomsSheet();
    var rLastRow = rSheet.getLastRow();
    if (rLastRow >= 2) {
      var rData = rSheet.getRange(2, 1, rLastRow - 1, 7).getValues();
      rData.forEach(function (row) {
        if (String(row[ROOM_COLS.booking_id]).trim() === bookingId) {
          match.rooms.push(rowToBookingRoom(row));
        }
      });
    }

    return { booking: match, rowIndex: matchRowIndex };
  }

  function appendBooking(booking) {
    var sheet = getBookingsSheet();
    sheet.appendRow([
      booking.bookingId,
      booking.bookingNumber,
      booking.guestName,
      booking.guestEmail,
      booking.guestPhone,
      booking.checkIn,
      booking.checkOut,
      booking.nights,
      booking.status,
      booking.totalAmount,
      booking.notes || '',
      booking.createdAt,
      booking.updatedAt,
    ]);
  }

  function appendBookingRooms(rooms) {
    var sheet = getRoomsSheet();
    rooms.forEach(function (r) {
      sheet.appendRow([
        r.bookingRoomId,
        r.bookingId,
        r.roomTypeId,
        r.roomTypeName,
        r.quantity,
        r.pricePerNight,
        r.subtotal,
      ]);
    });
  }

  function updateStatus(rowIndex, status, updatedAt) {
    var sheet = getBookingsSheet();
    sheet.getRange(rowIndex, BOOKING_COLS.status + 1).setValue(status);
    sheet.getRange(rowIndex, BOOKING_COLS.updated_at + 1).setValue(updatedAt);
  }

  function updateGuestDetails(rowIndex, fields, updatedAt) {
    var sheet = getBookingsSheet();
    if (fields.guestName)  sheet.getRange(rowIndex, BOOKING_COLS.guest_name + 1).setValue(fields.guestName);
    if (fields.guestEmail) sheet.getRange(rowIndex, BOOKING_COLS.guest_email + 1).setValue(fields.guestEmail);
    if (fields.guestPhone) sheet.getRange(rowIndex, BOOKING_COLS.guest_phone + 1).setValue(fields.guestPhone);
    if (fields.notes !== undefined) sheet.getRange(rowIndex, BOOKING_COLS.notes + 1).setValue(fields.notes);
    sheet.getRange(rowIndex, BOOKING_COLS.updated_at + 1).setValue(updatedAt);
  }

  function getForStaff(params) {
    var bSheet = getBookingsSheet();
    var lastRow = bSheet.getLastRow();
    if (lastRow < 2) return { bookings: [], total: 0 };

    var data = bSheet.getRange(2, 1, lastRow - 1, 13).getValues();
    var search = params.search ? params.search.toLowerCase() : '';
    var statusFilter = params.status && params.status !== 'all' ? params.status : null;
    var checkIn = params.checkIn || '';
    var checkOut = params.checkOut || '';

    var filtered = [];
    data.forEach(function (row) {
      if (!row[BOOKING_COLS.booking_id]) return;
      var b = rowToBooking(row);

      if (statusFilter && b.status !== statusFilter) return;

      if (checkIn && checkOut) {
        // Overlapping bookings
        if (b.checkIn >= checkOut || b.checkOut <= checkIn) return;
      }

      if (search) {
        var haystack = [b.bookingNumber, b.guestName, b.guestEmail, b.guestPhone].join(' ').toLowerCase();
        if (haystack.indexOf(search) === -1) return;
      }

      filtered.push(b);
    });

    // Sort descending by created_at
    filtered.sort(function (a, b) { return b.createdAt > a.createdAt ? 1 : -1; });

    var page = Math.max(1, parseInt(params.page) || 1);
    var pageSize = Math.min(100, parseInt(params.pageSize) || 20);
    var total = filtered.length;
    var start = (page - 1) * pageSize;
    var paged = filtered.slice(start, start + pageSize);

    // Attach rooms to paged results only
    if (paged.length > 0) {
      var idSet = {};
      paged.forEach(function (b) { idSet[b.bookingId] = b; });

      var rSheet = getRoomsSheet();
      var rLastRow = rSheet.getLastRow();
      if (rLastRow >= 2) {
        var rData = rSheet.getRange(2, 1, rLastRow - 1, 7).getValues();
        rData.forEach(function (row) {
          var bid = String(row[ROOM_COLS.booking_id]).trim();
          if (idSet[bid]) idSet[bid].rooms.push(rowToBookingRoom(row));
        });
      }
    }

    return {
      bookings: paged,
      total: total,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  function getNextBookingCounter(year) {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Settings');
    var key = 'booking_counter_' + year;
    var data = sheet.getDataRange().getValues();
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === key) {
        var current = Number(data[i][1]) || 0;
        var next = current + 1;
        sheet.getRange(i + 1, 2).setValue(next);
        return next;
      }
    }
    // Key doesn't exist — create it
    sheet.appendRow([key, 1]);
    return 1;
  }

  return {
    getConfirmedOverlapping: getConfirmedOverlapping,
    findByNumberAndEmail: findByNumberAndEmail,
    findById: findById,
    appendBooking: appendBooking,
    appendBookingRooms: appendBookingRooms,
    updateStatus: updateStatus,
    updateGuestDetails: updateGuestDetails,
    getForStaff: getForStaff,
    getNextBookingCounter: getNextBookingCounter,
  };
})();
