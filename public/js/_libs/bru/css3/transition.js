goog.provide('bru.style.css3.transition');

goog.require('bru.style.css3');



/**
 * Sets the element CSS3 transition.
 * @param {Element} element The element to set transition on.
 * @param {string} property CSS string.
 */
bru.style.css3.transition.set = function(element, property) {
  element.style[bru.style.css3.transitionProperty_] = property;
};


/**
 * Removes any programmatically-added CSS3 transition in the given element.
 * @param {Element} element The element to remove transition from.
 */
bru.style.css3.transition.removeAll = function(element) {
  bru.style.css3.transition.set(element, '');
};


/**
 * Removes CSS3 transition duration in the given element.
 * @param {Element} element The element to remove duration from.
 * @return {string} original duration.
 */
bru.style.css3.transition.removeDuration = function(element) {
  if (bru.style.css3.transitionSupported_) {
    var property = bru.style.css3.transition.getProperty() + 'Duration';
    var duration = document.defaultView.getComputedStyle(element, null)[property];
    bru.style.css3.transition.setDuration(element, '0s');
    return duration;
  }
  return '';
};


/**
 * Set CSS3 transition duration in the given element.
 * @param {Element} element
 * @param {string} duration
 */
bru.style.css3.transition.setDuration = function(element, duration) {
  element.style[bru.style.css3.transitionProperty_ + 'Duration'] = duration;
};


/**
 * @return {boolean} Whether CSS3 transition is supported.
 */
bru.style.css3.transition.isSupported = function() {
  return bru.style.css3.transitionSupported_;
};


/**
 * @return {string}
 */
bru.style.css3.transition.getProperty = function() {
  return bru.style.css3.transitionProperty_;
};


/**
 * @return {string}
 */
bru.style.css3.transition.getCssProperty = function() {
  return bru.style.css3.transitionCssProperty_;
};
