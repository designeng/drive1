goog.provide('bru.string');


/**
 * @param {string|number} val
 * @return {string}
 */
bru.string.formatMoney = function(val) {
  val = val + '';
  var separator = '&thinsp;';
  var l = val.length;
  var j = (l > 3) ? l % 3 : 0;
  return (j ? val.substring(0, j) + separator : '') +
      val.substring(j).replace(/(\d{3})(?=\d)/g, '$1' + separator);
};
