goog.provide('drive.pin');

goog.require('drive.init');
goog.require('goog.ui.ScrollFloater');



/**
 * @param {Element} element
 */
drive.pin = function(element) {
  var floater = new goog.ui.ScrollFloater();
  floater.decorate(goog.dom.getElement(element));
  floater.setScrollingEnabled(true);
};


/**
 * Export
 */
goog.exportSymbol('drv.pin', drive.pin);
