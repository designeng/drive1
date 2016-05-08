goog.provide('drive.form.Charcounter');

goog.require('goog.dom');
goog.require('goog.ui.CharCounter');
goog.require('goog.ui.CharCounter.Display');



/**
 * @param {string} field Field Id.
 * @constructor
 */
drive.form.Charcounter = function(field) {
  var el = /** @type {HTMLInputElement|HTMLTextAreaElement} */ (goog.dom.getElement(field));
  var maxlength = +el.getAttribute('maxlength');
  if (!maxlength) {
    return;
  }
  var counter = goog.dom.createDom('span', {'class' : 'charcounter'});
  goog.dom.insertSiblingAfter(counter, el);
  var charcounter = new goog.ui.CharCounter(el, counter, maxlength);
};


/**
 * Export
 */
goog.exportSymbol('drv.Charcounter', drive.form.Charcounter);
