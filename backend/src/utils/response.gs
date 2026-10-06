var Response = (function () {

  function ok(data) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  function error(message, code) {
    var payload = { success: false, error: message };
    if (code) payload.code = code;
    return ContentService
      .createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  }

  function badRequest(message) {
    return error(message || 'Bad request', 'BAD_REQUEST');
  }

  function notFound(message) {
    return error(message || 'Not found', 'NOT_FOUND');
  }

  function conflict(message) {
    return error(message || 'Conflict', 'CONFLICT');
  }

  function serverError(message) {
    return error(message || 'Internal server error', 'SERVER_ERROR');
  }

  return { ok: ok, error: error, badRequest: badRequest, notFound: notFound, conflict: conflict, serverError: serverError };
})();
