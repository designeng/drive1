goog.provide('drive.spinner');

goog.require('bru.ui.Spinner');


/**
 * @param {string|Element} target Target element for the spinner.
 */
drive.spinner = function(target) {
  return new bru.ui.Spinner(target,
      new goog.math.Size(16, 15),
      new goog.math.Box(240, 48 + 16 * 9, 240, 48),
      9 * 100);
};