goog.provide('bru.style.css3.transform');

goog.require('bru.style.css3');



/**
 * Sets the element CSS3 transform.
 * @param {Element} element The element to set transform on.
 * @param {string} property CSS string.
 */
bru.style.css3.transform.set = function(element, property) {
  element.style[bru.style.css3.transformProperty_] = property;
};


/**
 * Removes any programmatically-added CSS3 transform in the given element.
 * @param {Element} element The element to remove transform from.
 */
bru.style.css3.transform.removeAll = function(element) {
  bru.style.css3.transform.set(element, '');
};


/**
 * @return {boolean} Whether CSS3 transform is supported.
 */
bru.style.css3.transform.isSupported = function() {
  return bru.style.css3.transformSupported_;
};


/**
 * @return {string}
 */
bru.style.css3.transform.getProperty = function() {
  return bru.style.css3.transformProperty_;
};


/**
 * @return {string}
 */
bru.style.css3.transform.getCssProperty = function() {
  return bru.style.css3.transformCssProperty_;
};
