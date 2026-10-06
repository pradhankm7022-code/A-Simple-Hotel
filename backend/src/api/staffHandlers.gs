var StaffHandlers = (function () {

  function login(body) {
    var result = AuthService.login(body.password);
    if (!result.success) return Response.error(result.error, 'AUTH_FAILED');
    return Response.ok({ token: result.token, expiresAt: result.expiresAt });
  }

  function logout(token) {
    AuthService.logout(token);
    return Response.ok({ message: 'Logged out' });
  }

  function getBookings(params) {
    var result = BookingRepo.getForStaff({
      page:     params.page,
      pageSize: params.pageSize,
      status:   params.status,
      search:   params.search,
      checkIn:  params.checkIn,
      checkOut: params.checkOut,
    });
    return Response.ok(result);
  }

  function getBooking(id) {
    if (!id) return Response.badRequest('id is required');
    var result = BookingRepo.findById(id);
    if (!result) return Response.notFound('Booking not found');
    return Response.ok(result.booking);
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

  function updateBooking(id, body) {
    if (!id) return Response.badRequest('id is required');
    var result = BookingService.updateBooking(id, body);
    if (!result.success) return Response.badRequest(result.error);
    return Response.ok(result.booking);
  }

  function cancelBooking(id, body) {
    if (!id) return Response.badRequest('id is required');
    var result = BookingService.cancelBooking(id);
    if (!result.success) return Response.badRequest(result.error);
    return Response.ok(result.booking);
  }

  return {
    login: login,
    logout: logout,
    getBookings: getBookings,
    getBooking: getBooking,
    checkAvailability: checkAvailability,
    createBooking: createBooking,
    updateBooking: updateBooking,
    cancelBooking: cancelBooking,
  };
})();
