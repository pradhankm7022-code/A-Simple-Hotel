var RoomTypeRepo = (function () {

  var CACHE_KEY = 'room_types_v1';
  var CACHE_TTL = 300;

  var COLS = {
    room_type_id:    0,
    name:            1,
    description:     2,
    max_occupancy:   3,
    total_inventory: 4,
    base_price:      5,
    active:          6,
    image_urls:      7,
    amenities:       8,
    size:            9,
    bed_type:        10,
    view:            11,
  };

  function getSheet() {
    return SpreadsheetApp.openById(SHEET_ID).getSheetByName('RoomTypes');
  }

  function rowToObject(row) {
    return {
      roomTypeId:      String(row[COLS.room_type_id]).trim(),
      name:            String(row[COLS.name]).trim(),
      description:     String(row[COLS.description]).trim(),
      maxOccupancy:    Number(row[COLS.max_occupancy]) || 1,
      totalInventory:  Number(row[COLS.total_inventory]) || 0,
      basePrice:       Number(row[COLS.base_price]) || 0,
      active:          row[COLS.active] === true || String(row[COLS.active]).toUpperCase() === 'TRUE',
      imageUrls:       String(row[COLS.image_urls] || '').split('|').map(function(s){ return s.trim(); }).filter(Boolean),
      amenities:       String(row[COLS.amenities] || '').split(',').map(function(s){ return s.trim(); }).filter(Boolean),
      size:            String(row[COLS.size] || '').trim(),
      bedType:         String(row[COLS.bed_type] || '').trim(),
      view:            String(row[COLS.view] || '').trim(),
    };
  }

  function getAll(activeOnly) {
    var cache = CacheService.getScriptCache();
    var cacheKey = activeOnly ? CACHE_KEY + '_active' : CACHE_KEY;
    var cached = cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    var sheet = getSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];

    var data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
    var results = [];
    data.forEach(function (row) {
      if (!row[COLS.room_type_id]) return;
      var obj = rowToObject(row);
      if (activeOnly && !obj.active) return;
      results.push(obj);
    });

    cache.put(cacheKey, JSON.stringify(results), CACHE_TTL);
    return results;
  }

  function getById(roomTypeId) {
    var all = getAll(false);
    for (var i = 0; i < all.length; i++) {
      if (all[i].roomTypeId === roomTypeId) return all[i];
    }
    return null;
  }

  function invalidateCache() {
    var cache = CacheService.getScriptCache();
    cache.remove(CACHE_KEY);
    cache.remove(CACHE_KEY + '_active');
  }

  return { getAll: getAll, getById: getById, invalidateCache: invalidateCache };
})();
