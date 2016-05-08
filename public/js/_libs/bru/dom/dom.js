goog.provide('bru.dom');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.style');



/**
 * Возвращает z-index ближайшего радителя с заданным z-index,
 * или null, если такого элемента не нашлось.
 * @param {Element!} element
 * @return {?number}
 */
bru.dom.getAncestorZIndex = function(element) {
  var zIndex;
  var ancestorWithZIndex = goog.dom.getAncestor(element, function(node) {
    if (node.nodeType == goog.dom.NodeType.ELEMENT) {
      goog.asserts.assertElement(node);
      var position = goog.style.getComputedPosition(node);
      if (position == 'absolute' || position == 'relative' || position == 'fixed') {
        zIndex = parseInt(goog.style.getComputedZIndex(node), 10);
        return !isNaN(zIndex) && zIndex !== 0;
      }
    }
    return false;
  }, true);
  return ancestorWithZIndex ? zIndex : null;
};


/**
 * Shortcut for getAttribute('data-' + attr).
 * @param {Node} node Element.
 * @param {string} attr Attribute.
 * @return {?string} Attribute value.
 * @deprecated Use goog.dom.dataset.get
 */
bru.dom.getDataAttribute = function(node, attr) {
  return node.getAttribute('data-' + attr);
};


/**
 * Shortcut for setAttribute('data-' + attr, val).
 * @param {Node} node Element.
 * @param {string} attr Attribute.
 * @param {string|number} val Value.
 * @deprecated Use goog.dom.dataset.set
 */
bru.dom.setDataAttribute = function(node, attr, val) {
  return node.setAttribute('data-' + attr, val);
};


/**
 * Shortcut for removeAttribute('data-' + attr).
 * @param {Node} node Element.
 * @param {string} attr Attribute.
 * @deprecated Use goog.dom.dataset.remove
 */
bru.dom.removeDataAttribute = function(node, attr) {
  return node.removeAttribute('data-' + attr);
};


/**
 * Shortcut for getAttribute('data-action').
 * @param {Node} node Element.
 * @return {?string} Attribute value.
 * @deprecated Use goog.dom.dataset.get
 */
bru.dom.getActionAttribute = function(node) {
  return bru.dom.getDataAttribute(node, 'action');
};


/**
 * Shortcut for setAttribute('data-action', val).
 * @param {Node} node Element.
 * @param {string|number} val Value.
 * @deprecated Use goog.dom.dataset.set
 */
bru.dom.setActionAttribute = function(node, val) {
  return bru.dom.setDataAttribute(node, 'action', val);
};


/**
 * Shortcut for removeAttribute('data-action').
 * @param {Node} node Element.
 * @deprecated Use bru.jsaction.EventContract.removeAction
 */
bru.dom.removeActionAttribute = function(node) {
  return bru.dom.removeDataAttribute(node, 'action');
};
