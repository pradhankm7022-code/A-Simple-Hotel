var Validator = (function () {

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var DATE_RE  = /^\d{4}-\d{2}-\d{2}$/;

  function isString(v) { return typeof v === 'string' && v.trim().length > 0; }
  function isEmail(v)  { return isString(v) && EMAIL_RE.test(v.trim()); }
  function isDate(v)   { return isString(v) && DATE_RE.test(v) && !isNaN(new Date(v).getTime()); }
  function isInt(v, min, max) {
    var n = Number(v);
    if (!Number.isInteger(n)) return false;
    if (min !== undefined && n < min) return false;
    if (max !== undefined && n > max) return false;
    return true;
  }

  function validateCreateBooking(body) {
    var errors = [];

    if (!isString(body.guestName) || body.guestName.trim().length < 2)
      errors.push('guestName must be at least 2 characters');
    if (body.guestName && body.guestName.length > 100)
      errors.push('guestName must be 100 characters or fewer');

    if (!isEmail(body.guestEmail))
      errors.push('guestEmail must be a valid email address');

    if (!isString(body.guestPhone) || body.guestPhone.trim().length < 7)
      errors.push('guestPhone must be at least 7 characters');

    if (!isDate(body.checkIn))
      errors.push('checkIn must be a valid date (yyyy-MM-dd)');

    if (!isDate(body.checkOut))
      errors.push('checkOut must be a valid date (yyyy-MM-dd)');

    if (isDate(body.checkIn) && isDate(body.checkOut)) {
      var ci = new Date(body.checkIn);
      var co = new Date(body.checkOut);
      if (co <= ci) errors.push('checkOut must be after checkIn');
      var nights = Math.round((co - ci) / 86400000);
      if (nights > 90) errors.push('Maximum stay is 90 nights');

      var today = new Date();
      today.setHours(0, 0, 0, 0);
      if (ci < today) errors.push('checkIn cannot be in the past');
    }

    if (!Array.isArray(body.rooms) || body.rooms.length === 0)
      errors.push('rooms must be a non-empty array');

    if (Array.isArray(body.rooms)) {
      body.rooms.forEach(function (r, i) {
        if (!isString(r.roomTypeId))
          errors.push('rooms[' + i + '].roomTypeId is required');
        if (!isInt(r.quantity, 1, 10))
          errors.push('rooms[' + i + '].quantity must be between 1 and 10');
      });
    }

    return errors;
  }

  function validateAvailabilityParams(checkIn, checkOut) {
    var errors = [];
    if (!isDate(checkIn))  errors.push('checkIn must be a valid date (yyyy-MM-dd)');
    if (!isDate(checkOut)) errors.push('checkOut must be a valid date (yyyy-MM-dd)');
    if (isDate(checkIn) && isDate(checkOut)) {
      if (new Date(checkOut) <= new Date(checkIn))
        errors.push('checkOut must be after checkIn');
    }
    return errors;
  }

  function sanitizeString(v, maxLen) {
    if (typeof v !== 'string') return '';
    return v.trim().slice(0, maxLen || 500);
  }

  return {
    validateCreateBooking: validateCreateBooking,
    validateAvailabilityParams: validateAvailabilityParams,
    sanitizeString: sanitizeString,
    isEmail: isEmail,
    isDate: isDate,
    isString: isString,
  };
})();
