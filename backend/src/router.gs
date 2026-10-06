// ─── Constants ────────────────────────────────────────────────────────────────
// Set SHEET_ID to your Google Sheet's ID (from the URL).
var SHEET_ID = PropertiesService.getScriptProperties().getProperty('SHEET_ID');

// ─── Entry Points ─────────────────────────────────────────────────────────────

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    var params = e.parameter || {};
    var action = params.action;

    if (!action) {
      return respond(400, false, null, 'Missing action parameter');
    }

    // Staff actions require auth token
    if (action.indexOf('staff') === 0 && action !== 'staffLogin') {
      var token = getAuthToken(e);
      if (!token) {
        return respond(401, false, null, 'Missing authorization token');
      }
      var authResult = AuthService.validateToken(token);
      if (!authResult.valid) {
        return respond(401, false, null, 'Invalid or expired token');
      }
      return routeStaff(action, method, e, params);
    }

    return routePublic(action, method, e, params);

  } catch (err) {
    Logger.log('Unhandled error: ' + err.message + '\n' + err.stack);
    return respond(500, false, null, 'Internal server error');
  }
}

function getAuthToken(e) {
  // Apps Script doesn't expose Authorization header directly.
  // Staff token is passed as ?token= query param as a workaround.
  return (e.parameter && e.parameter.token) || null;
}

// ─── Public Router ────────────────────────────────────────────────────────────

function routePublic(action, method, e, params) {
  switch (action) {
    case 'getHotelConfig':
      return PublicHandlers.getHotelConfig();

    case 'getRoomTypes':
      return PublicHandlers.getRoomTypes();

    case 'getRoomType':
      return PublicHandlers.getRoomType(params.id);

    case 'checkAvailability':
      return PublicHandlers.checkAvailability(params.checkIn, params.checkOut);

    case 'createBooking':
      return PublicHandlers.createBooking(parseBody(e));

    case 'getBooking':
      return PublicHandlers.getBooking(params.bookingNumber, params.email);

    case 'staffLogin':
      return StaffHandlers.login(parseBody(e));

    default:
      return respond(404, false, null, 'Unknown action: ' + action);
  }
}

// ─── Staff Router ─────────────────────────────────────────────────────────────

function routeStaff(action, method, e, params) {
  switch (action) {
    case 'staffLogout':
      return StaffHandlers.logout(getAuthToken(e));

    case 'staffGetBookings':
      return StaffHandlers.getBookings(params);

    case 'staffGetBooking':
      return StaffHandlers.getBooking(params.id);

    case 'staffGetAvailability':
      return StaffHandlers.checkAvailability(params.checkIn, params.checkOut);

    case 'staffCreateBooking':
      return StaffHandlers.createBooking(parseBody(e));

    case 'staffUpdateBooking':
      return StaffHandlers.updateBooking(params.id, parseBody(e));

    case 'staffCancelBooking':
      return StaffHandlers.cancelBooking(params.id, parseBody(e));

    default:
      return respond(404, false, null, 'Unknown staff action: ' + action);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseBody(e) {
  try {
    // Body is passed as a JSON-encoded ?body= query param (GET-only strategy to avoid CORS preflight)
    if (e.parameter && e.parameter.body) {
      return JSON.parse(e.parameter.body);
    }
    // Fallback: legacy POST body
    return e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : {};
  } catch (_) {
    return {};
  }
}

function respond(statusCode, success, data, error) {
  var payload = success
    ? { success: true, data: data }
    : { success: false, error: error || 'Unknown error' };

  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function ok(data) {
  return respond(200, true, data, null);
}

function err(message, code) {
  var payload = { success: false, error: message };
  if (code) payload.code = code;
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
