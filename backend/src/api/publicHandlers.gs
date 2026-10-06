var PublicHandlers = (function () {

  function getHotelConfig() {
    var raw = ConfigRepo.getAll();
    return Response.ok(ConfigRepo.toApiShape(raw));
  }

  function getRoomTypes() {
    var rooms = RoomTypeRepo.getAll(true);
    return Response.ok(rooms);
  }

  function getRoomType(id) {
    if (!id) return Response.badRequest('id is required');
    var room = RoomTypeRepo.getById(id);
    if (!room) return Response.notFound('Room type not found');
    return Response.ok(room);
  }

  function checkAvailability(checkIn, checkOut) {
    var errors = Validator.validateAvailabilityParams(checkIn, checkOut);
    if (errors.length > 0) return Response.badRequest(errors.join('; '));

    var result = AvailabilityService.checkAvailability(checkIn, checkOut);
    return Response.ok(result);
  }

  function createBooking(body) {
    var errors = Validator.validateCreateBooking(body);
    if (errors.length > 0) return Response.badRequest(errors.join('; '));

    var result = BookingService.createBooking(body);
    if (!result.success) {
      return result.conflict
        ? Response.conflict(result.error)
        : Response.badRequest(result.error);
    }
    return Response.ok({ booking: result.booking, message: 'Booking confirmed' });
  }

  function getBooking(bookingNumber, email) {
    if (!bookingNumber) return Response.badRequest('bookingNumber is required');
    if (!email) return Response.badRequest('email is required');

    var booking = BookingRepo.findByNumberAndEmail(bookingNumber, email.toLowerCase().trim());
    if (!booking) return Response.notFound('Booking not found');
    return Response.ok(booking);
  }

  return {
    getHotelConfig: getHotelConfig,
    getRoomTypes: getRoomTypes,
    getRoomType: getRoomType,
    checkAvailability: checkAvailability,
    createBooking: createBooking,
    getBooking: getBooking,
  };
})();
