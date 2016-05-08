goog.provide('bru.style.css3');


/**
 * Whether CSS3 transform is supported.
 * @type {boolean}
 * @private
 */
bru.style.css3.transformSupported_;


/**
 * @type {string}
 * @private
 */
bru.style.css3.transformProperty_;


/**
 * @type {string}
 * @private
 */
bru.style.css3.transformCssProperty_;


/**
 * Whether CSS3 transition is supported.
 * @type {boolean}
 * @private
 */
bru.style.css3.transitionSupported_;


/**
 * @type {string}
 * @private
 */
bru.style.css3.transitionProperty_;


/**
 * @type {string}
 * @private
 */
bru.style.css3.transitionCssProperty_;


/**
 * CSS3 helper.
 * @private
 */
bru.style.css3.detectFeatures_ = function() {
  if (goog.isDef(bru.style.css3.transformSupported_)) {
    return;
  }
  bru.style.css3.transformSupported_ = false;
  bru.style.css3.transitionSupported_ = false;

  var el = document.createElement('div');
  var prefixes = ['Webkit', 'Moz', 'O', 'ms'];
  for (var i = 0, prefix; prefix = prefixes[i]; i++) {
    var lowercasePrefix = '-' + prefix.toLowerCase() + '-';
    var transformProperty = prefix + 'Transform';
    if (transformProperty in el.style) {
      bru.style.css3.transformSupported_ = true;
      bru.style.css3.transformProperty_ = transformProperty;
      bru.style.css3.transformCssProperty_ = lowercasePrefix + 'transform';
    }
    var transitionProperty = prefix + 'Transition';
    if (transitionProperty in el.style) {
      bru.style.css3.transitionSupported_ = true;
      bru.style.css3.transitionProperty_ = transitionProperty;
      bru.style.css3.transitionCssProperty_ = lowercasePrefix + 'transition';
    }
  }
};
bru.style.css3.detectFeatures_();
