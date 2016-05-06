goog.provide('bru.locale');



/**
 * @param {string} formatString
 * @param {Array.<string>} params
 * @return {string}
 */
bru.locale.lFormat = function(formatString, params) {
  for (var i = 0; i < params.length; i++) {
    formatString = formatString.replace('{' + i + '}', params[i]);
  }

  var re = /\{(\d+)\:\$(\S+)\}/g;
  var formatParams;
  var resString = formatString;
  while (formatParams = re.exec(formatString)) {
    var param = params[formatParams[1]];
    var formatParts = formatParams[2].split(':');
    if (formatParts[0] == 'N' && param) {
      param = /** @type {number} */ (+param);
      resString = resString.replace(formatParams[0],
          bru.locale.lFormat_(param, formatParts));
    }
  }

  return resString;
};


/**
 * @param {number} number
 * @param {Array.<string>} formatParts
 * @return {string}
 * @private
 */
bru.locale.lFormat_ = function(number, formatParts) {
  if (number < 0) {
    number = -number;
  }
  number %= 100;
  if (number < 11 || number > 19) {
    number %= 10;
    if (number == 1 && formatParts.length > 2) {
      return formatParts[1];
    }
    if ((number == 2 || number == 3 || number == 4) && formatParts.length > 3) {
      return formatParts[3];
    }
  }
  return formatParts[2];
};
