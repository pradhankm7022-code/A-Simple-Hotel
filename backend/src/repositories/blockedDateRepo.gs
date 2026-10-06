var BlockedDateRepo = (function () {

  var COLS = {
    block_id:     0,
    room_type_id: 1,
    start_date:   2,
    end_date:     3,
    quantity:     4,
    reason:       5,
    active:       6,
  };

  function getSheet() {
    return SpreadsheetApp.openById(SHEET_ID).getSheetByName('BlockedDates');
  }

  function getActive() {
    var sheet = getSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];

    var data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    var results = [];
    data.forEach(function (row) {
      if (!row[COLS.block_id]) return;
      var active = row[COLS.active] === true || String(row[COLS.active]).toUpperCase() === 'TRUE';
      if (!active) return;
      results.push({
        blockId:    String(row[COLS.block_id]).trim(),
        roomTypeId: String(row[COLS.room_type_id]).trim(),
        startDate:  String(row[COLS.start_date]).trim(),
        endDate:    String(row[COLS.end_date]).trim(),
        quantity:   Number(row[COLS.quantity]) || 0,
        reason:     String(row[COLS.reason] || '').trim(),
      });
    });
    return results;
  }

  return { getActive: getActive };
})();
