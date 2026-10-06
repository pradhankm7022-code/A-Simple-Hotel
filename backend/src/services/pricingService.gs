var PricingService = (function () {

  var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Returns price for a single night for a given room type
  // date: 'yyyy-MM-dd'
  function priceForNight(roomType, date, rules) {
    var d = new Date(date + 'T00:00:00');
    var dayName = DAY_NAMES[d.getDay()];

    // rules are pre-sorted by priority desc — first match wins
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (!ruleAppliesToRoomType(rule, roomType.roomTypeId)) continue;
      if (!ruleAppliesToDate(rule, date, dayName)) continue;

      var ruleId = rule.ruleId;
      if (rule.priceOverride !== null) {
        return { price: rule.priceOverride, ruleApplied: ruleId };
      }
      if (rule.priceMultiplier !== null) {
        return { price: Math.round(roomType.basePrice * rule.priceMultiplier), ruleApplied: ruleId };
      }
    }

    return { price: roomType.basePrice, ruleApplied: null };
  }

  function ruleAppliesToRoomType(rule, roomTypeId) {
    return rule.roomTypeId === 'ALL' || rule.roomTypeId === roomTypeId;
  }

  function ruleAppliesToDate(rule, date, dayName) {
    if (rule.ruleType === 'seasonal') {
      if (!rule.startDate || !rule.endDate) return false;
      return date >= rule.startDate && date <= rule.endDate;
    }
    if (rule.ruleType === 'weekend') {
      return rule.daysOfWeek.indexOf(dayName) !== -1;
    }
    return false;
  }

  // Returns full pricing breakdown for a room type over a date range
  // Returns { pricePerNight (avg), nightlyBreakdown, totalPrice, nights }
  function calculatePricing(roomType, checkIn, checkOut) {
    var rules = PricingRepo.getActive();
    var nights = getDatesBetween(checkIn, checkOut); // exclusive of checkOut
    var breakdown = [];
    var total = 0;

    nights.forEach(function (date) {
      var result = priceForNight(roomType, date, rules);
      breakdown.push({ date: date, price: result.price, ruleApplied: result.ruleApplied });
      total += result.price;
    });

    var avgPerNight = nights.length > 0 ? Math.round(total / nights.length) : roomType.basePrice;

    return {
      roomTypeId:      roomType.roomTypeId,
      pricePerNight:   avgPerNight,
      nightlyBreakdown: breakdown,
      totalPrice:      total,
      nights:          nights.length,
    };
  }

  // Returns array of date strings [checkIn, checkOut) — exclusive of checkOut
  function getDatesBetween(checkIn, checkOut) {
    var dates = [];
    var cur = new Date(checkIn + 'T00:00:00');
    var end = new Date(checkOut + 'T00:00:00');
    while (cur < end) {
      dates.push(formatDate(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  }

  function formatDate(d) {
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
  }

  return {
    calculatePricing: calculatePricing,
    getDatesBetween: getDatesBetween,
    formatDate: formatDate,
  };
})();
