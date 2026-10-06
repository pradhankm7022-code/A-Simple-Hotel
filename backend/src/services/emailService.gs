var EmailService = (function () {

  function sendConfirmation(booking) {
    var enabled = ConfigRepo.get('email_confirmation_enabled');
    if (enabled !== 'true') return;

    var hotelName = ConfigRepo.get('hotel_name') || 'The Paradise';
    var replyTo   = ConfigRepo.get('hotel_email_reply_to') || ConfigRepo.get('email') || '';

    var subject = '[' + hotelName + '] Booking Confirmed — ' + booking.bookingNumber;
    var body = buildHtmlEmail(booking, hotelName);

    GmailApp.sendEmail(booking.guestEmail, subject, '', {
      htmlBody: body,
      replyTo: replyTo,
      name: hotelName,
    });
  }

  function buildHtmlEmail(booking, hotelName) {
    var address  = ConfigRepo.get('address') || '';
    var phone    = ConfigRepo.get('phone') || '';
    var currency = ConfigRepo.get('currency_symbol') || '₹';

    var roomsHtml = '';
    booking.rooms.forEach(function (r) {
      roomsHtml +=
        '<tr>' +
        '<td style="padding:8px 12px;border-bottom:1px solid #eee;">' + r.roomTypeName + ' × ' + r.quantity + '</td>' +
        '<td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">' + currency + r.pricePerNight.toLocaleString() + '/night</td>' +
        '<td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">' + currency + r.subtotal.toLocaleString() + '</td>' +
        '</tr>';
    });

    return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f5f5f0;font-family:Arial,sans-serif;">' +
      '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:32px 0;">' +
      '<tr><td align="center">' +
      '<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0ddd5;">' +

      // Header
      '<tr><td style="background:#d4862a;padding:32px;text-align:center;">' +
      '<h1 style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:28px;font-weight:normal;">' + hotelName + '</h1>' +
      '<p style="margin:8px 0 0;color:#faefd9;font-size:14px;">Booking Confirmed</p>' +
      '</td></tr>' +

      // Body
      '<tr><td style="padding:32px;">' +
      '<p style="font-size:16px;color:#333;">Dear ' + booking.guestName + ',</p>' +
      '<p style="color:#555;">Your reservation at <strong>' + hotelName + '</strong> has been confirmed.</p>' +

      // Booking summary box
      '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;border:1px solid #e0ddd5;margin:24px 0;">' +
      '<tr><td style="padding:16px 20px;">' +
      '<h3 style="margin:0 0 12px;color:#7c421e;font-family:Georgia,serif;font-size:16px;">Booking Reference</h3>' +
      '<p style="margin:0;font-size:22px;font-weight:bold;color:#333;letter-spacing:1px;">' + booking.bookingNumber + '</p>' +
      '</td></tr>' +
      '</table>' +

      // Stay details
      '<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">' +
      '<tr>' +
      '<td width="50%" style="padding:8px 0;"><strong style="color:#555;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Check-in</strong><br><span style="font-size:16px;color:#333;">' + booking.checkIn + '</span></td>' +
      '<td width="50%" style="padding:8px 0;"><strong style="color:#555;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Check-out</strong><br><span style="font-size:16px;color:#333;">' + booking.checkOut + '</span></td>' +
      '</tr>' +
      '<tr>' +
      '<td style="padding:8px 0;"><strong style="color:#555;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Nights</strong><br><span style="font-size:16px;color:#333;">' + booking.nights + '</span></td>' +
      '<td style="padding:8px 0;"><strong style="color:#555;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Guests</strong><br><span style="font-size:16px;color:#333;">' + booking.guestName + '</span></td>' +
      '</tr>' +
      '</table>' +

      // Room breakdown
      '<h3 style="color:#7c421e;font-family:Georgia,serif;font-size:15px;margin:0 0 8px;">Rooms</h3>' +
      '<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0ddd5;">' +
      '<tr style="background:#f8f7f4;"><th style="padding:8px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#555;">Room</th><th style="padding:8px 12px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#555;">Rate</th><th style="padding:8px 12px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#555;">Total</th></tr>' +
      roomsHtml +
      '<tr style="background:#f8f7f4;"><td colspan="2" style="padding:10px 12px;font-weight:bold;text-align:right;color:#333;">Total Amount</td><td style="padding:10px 12px;font-weight:bold;text-align:right;color:#7c421e;font-size:16px;">' + currency + booking.totalAmount.toLocaleString() + '</td></tr>' +
      '</table>' +

      '<p style="color:#888;font-size:13px;margin-top:16px;">Payment is due at the hotel. Please present this booking number at check-in.</p>' +

      '</td></tr>' +

      // Footer
      '<tr><td style="background:#f8f7f4;padding:24px;text-align:center;border-top:1px solid #e0ddd5;">' +
      '<p style="margin:0;color:#888;font-size:13px;">' + hotelName + '</p>' +
      '<p style="margin:4px 0 0;color:#aaa;font-size:12px;">' + address + ' | ' + phone + '</p>' +
      '</td></tr>' +

      '</table>' +
      '</td></tr></table>' +
      '</body></html>';
  }

  return { sendConfirmation: sendConfirmation };
})();
