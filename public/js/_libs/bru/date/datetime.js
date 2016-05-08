goog.provide('bru.date');



/**
 * @param {number=} opt_year
 * @return {Array.<Date>}
 */
bru.date.getDstSwitch = function(opt_year) {
  var year = opt_year || new Date().getFullYear();

  var firstSwitch = 0;
  var secondSwitch = 0;
  var lastOffset = 99;

  // Loop through every month of the current year
  for (var i = 0; i < 12; i++) {
    // Fetch the timezone value for the month
    var newDate = bru.date.UtcDateTime_(year, i);
    var tz = bru.date.getTimezoneOffset_(newDate);

    // Capture when a timzezone change occurs
    if (tz > lastOffset) {
      firstSwitch = i - 1;
    } else if (tz < lastOffset) {
      secondSwitch = i - 1;
    }
    lastOffset = tz;
  }

  // Go figure out date/time occurences a minute before
  // a DST adjustment occurs
  var secondDstDate = bru.date.findDstSwitch_(year, secondSwitch);
  var firstDstDate = bru.date.findDstSwitch_(year, firstSwitch);

  return firstDstDate && secondDstDate ? [firstDstDate, secondDstDate] : null;
};


/**
 * @param {number} year
 * @param {number} month
 * @return {Date}
 * @private
 */
bru.date.findDstSwitch_ = function(year, month) {
  // Set the starting date
  var baseDate = bru.date.UtcDateTime_(year, month);
  var changeDay = 0;
  var changeMinute = -1;
  var baseOffset = bru.date.getTimezoneOffset_(baseDate);

  // Loop to find the exact day a timezone adjust occurs
  for (var day = 0; day < 50; day++) {
    var tmpDate = bru.date.UtcDateTime_(year, month, day);
    var tmpOffset = bru.date.getTimezoneOffset_(tmpDate);

    // Check if the timezone changed from one day to the next
    if (tmpOffset != baseOffset) {
      var minutes = 0;
      changeDay = day;

      // Back-up one day and grap the offset
      tmpDate = bru.date.UtcDateTime_(year, month, day - 1);
      tmpOffset = bru.date.getTimezoneOffset_(tmpDate);

      // Count the minutes until a timezone chnage occurs
      while (changeMinute == -1) {
        tmpDate = bru.date.UtcDateTime_(year, month, day - 1, 0, minutes);
        tmpOffset = bru.date.getTimezoneOffset_(tmpDate);

        // Determine the exact minute a timezone change
        // occurs
        if (tmpOffset != baseOffset) {
          // Back-up a minute to get the date/time just
          // before a timezone change occurs
          tmpDate = bru.date.UtcDateTime_(year, month, day - 1, 0, minutes - 1);
          changeMinute = minutes;
          break;
        } else {
          minutes++;
        }
      }
      return tmpDate;
    }
  }
  return null;
};


/**
 * @param {number} year Four digit UTC year or a date-like object.
 * @param {number=} opt_month UTC month, 0 = Jan, 11 = Dec.
 * @param {number=} opt_date UTC date of month, 1 - 31.
 * @param {number=} opt_hours UTC hours, 0 - 23.
 * @param {number=} opt_minutes UTC minutes, 0 - 59.
 * @return {Date}
 * @private
 */
bru.date.UtcDateTime_ = function(year, opt_month, opt_date, opt_hours, opt_minutes) {
  var timestamp = Date.UTC(year, opt_month || 0, opt_date || 1,
                         opt_hours || 0, opt_minutes || 0, 0, 0);
  return new Date(timestamp);
};


/**
 * @param {Date} date
 * @return {number}
 * @private
 */
bru.date.getTimezoneOffset_ = function(date) {
  return -1 * date.getTimezoneOffset() / 60;
};
