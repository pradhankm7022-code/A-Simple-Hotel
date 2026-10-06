var PricingRepo = (function () {

  var CACHE_KEY = 'pricing_rules_v1';
  var CACHE_TTL = 300;

  var COLS = {
    rule_id:          0,
    room_type_id:     1,
    rule_type:        2,
    start_date:       3,
    end_date:         4,
    days_of_week:     5,
    price_override:   6,
    price_multiplier: 7,
    priority:         8,
    active:           9,
  };

  function getSheet() {
    return SpreadsheetApp.openById(SHEET_ID).getSheetByName('PricingRules');
  }

  function rowToObject(row) {
    return {
      ruleId:          String(row[COLS.rule_id]).trim(),
      roomTypeId:      String(row[COLS.room_type_id]).trim(),
      ruleType:        String(row[COLS.rule_type]).trim(),
      startDate:       String(row[COLS.start_date] || '').trim(),
      endDate:         String(row[COLS.end_date] || '').trim(),
      daysOfWeek:      String(row[COLS.days_of_week] || '').split(',').map(function(s){ return s.trim(); }).filter(Boolean),
      priceOverride:   row[COLS.price_override] !== '' ? Number(row[COLS.price_override]) : null,
      priceMultiplier: row[COLS.price_multiplier] !== '' ? Number(row[COLS.price_multiplier]) : null,
      priority:        Number(row[COLS.priority]) || 0,
      active:          row[COLS.active] === true || String(row[COLS.active]).toUpperCase() === 'TRUE',
    };
  }

  function getActive() {
    var cache = CacheService.getScriptCache();
    var cached = cache.get(CACHE_KEY);
    if (cached) return JSON.parse(cached);

    var sheet = getSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];

    var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    var results = [];
    data.forEach(function (row) {
      if (!row[COLS.rule_id]) return;
      var obj = rowToObject(row);
      if (obj.active) results.push(obj);
    });

    // Sort descending by priority — highest priority first
    results.sort(function(a, b) { return b.priority - a.priority; });

    cache.put(CACHE_KEY, JSON.stringify(results), CACHE_TTL);
    return results;
  }

  return { getActive: getActive };
})();
