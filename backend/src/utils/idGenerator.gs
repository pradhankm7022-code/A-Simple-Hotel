var IdGenerator = (function () {

  function randomHex(bytes) {
    var result = '';
    for (var i = 0; i < bytes; i++) {
      result += ('0' + Math.floor(Math.random() * 256).toString(16)).slice(-2);
    }
    return result;
  }

  function bookingId() {
    return 'bk_' + randomHex(8);
  }

  function bookingRoomId() {
    return 'br_' + randomHex(6);
  }

  function blockId() {
    return 'bl_' + randomHex(6);
  }

  // PAR-2024-0001 format
  function bookingNumber(counter, year) {
    var y = year || new Date().getFullYear();
    var n = String(counter);
    while (n.length < 4) n = '0' + n;
    return 'PAR-' + y + '-' + n;
  }

  function sessionToken() {
    return randomHex(32); // 64 hex chars
  }

  return {
    bookingId: bookingId,
    bookingRoomId: bookingRoomId,
    blockId: blockId,
    bookingNumber: bookingNumber,
    sessionToken: sessionToken,
    randomHex: randomHex
  };
})();
