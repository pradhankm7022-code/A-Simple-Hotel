var AuthService = (function () {

  var TOKEN_EXPIRY_HOURS = 8;

  function getSheet() {
    return SpreadsheetApp.openById(SHEET_ID).getSheetByName('StaffSessions');
  }

  function login(password) {
    if (!password) return { success: false, error: 'Password is required' };

    var storedHash = ConfigRepo.get('staff_password_hash');
    if (!storedHash) return { success: false, error: 'Staff account not configured' };

    var inputHash = hashPassword(password);
    if (inputHash !== storedHash) {
      return { success: false, error: 'Invalid password' };
    }

    var token = IdGenerator.sessionToken();
    var now = new Date();
    var expires = new Date(now.getTime() + TOKEN_EXPIRY_HOURS * 3600 * 1000);

    getSheet().appendRow([token, expires.toISOString(), now.toISOString()]);

    return {
      success: true,
      token: token,
      expiresAt: expires.toISOString(),
    };
  }

  function validateToken(token) {
    if (!token || token.length !== 64) return { valid: false };

    var sheet = getSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return { valid: false };

    var data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    var now = new Date();

    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      if (String(row[0]).trim() === token) {
        var expires = new Date(String(row[1]).trim());
        if (expires > now) return { valid: true };
        return { valid: false }; // expired
      }
    }
    return { valid: false };
  }

  function logout(token) {
    if (!token) return;
    var sheet = getSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    var data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === token) {
        // Expire the token by overwriting with past date
        sheet.getRange(i + 2, 2).setValue('2000-01-01T00:00:00.000Z');
        return;
      }
    }
  }

  // SHA-256 hex string using Apps Script Utilities
  function hashPassword(password) {
    var bytes = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      password,
      Utilities.Charset.UTF_8
    );
    return bytes.map(function (b) {
      return ('0' + (b & 0xff).toString(16)).slice(-2);
    }).join('');
  }

  // Call this once from the Apps Script console to set the initial password
  function setPassword(plaintext) {
    var hash = hashPassword(plaintext);
    ConfigRepo.set('staff_password_hash', hash);
    Logger.log('Password hash set: ' + hash);
  }

  return { login: login, validateToken: validateToken, logout: logout, setPassword: setPassword };
})();
