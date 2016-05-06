goog.provide('bru.form.charcounter');

goog.require('bru.ui.CharCounter');
goog.require('goog.dom');



/**
 * @param {string|Element} field Field Id.
 * @return {bru.ui.CharCounter}
 */
bru.form.charcounter = function(field) {
  var el = /** @type {HTMLInputElement|HTMLTextAreaElement} */ (goog.dom.getElement(field));
  var maxlength = +el.getAttribute('maxlength');
  if (!maxlength) {
    return null;
  }
  var counter = goog.dom.createDom('span', {'class' : 'charcounter'});
  goog.dom.insertSiblingAfter(counter, el);
  return new bru.ui.CharCounter(el, counter, maxlength);
};
