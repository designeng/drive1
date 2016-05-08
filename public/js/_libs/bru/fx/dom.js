goog.provide('goog.fx.dom.SlideLeft');
goog.provide('goog.fx.dom.SlideResize');
goog.provide('goog.fx.dom.SlideResizeFrom');

goog.require('goog.fx.dom.PredefinedEffect');


/**
 * @param {Element} element Dom Node to be used in the animation.
 * @param {Array.<number>} start 4D array for start coordinates (X, Y, W, H).
 * @param {Array.<number>} end 4D array for end coordinates (X, Y, W, H).
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.PredefinedEffect}
 * @constructor
 * @deprecated
 */
goog.fx.dom.SlideResize = function(element, start, end, time, opt_acc) {
  if (start.length != 4 || end.length != 4) {
    throw Error('Start and end points must be 4D');
  }
  goog.fx.dom.PredefinedEffect.apply(this, arguments);
};
goog.inherits(goog.fx.dom.SlideResize, goog.fx.dom.PredefinedEffect);

/** @inheritDoc */
goog.fx.dom.SlideResize.prototype.updateStyle = function() {
  this.element.style.left = Math.round(this.coords[0]) + 'px';
  this.element.style.top = Math.round(this.coords[1]) + 'px';
  this.element.style.width = Math.round(this.coords[2]) + 'px';
  this.element.style.height = Math.round(this.coords[3]) + 'px';
};


/**
 * @param {Element} element DOM node to be used in the animation.
 * @param {Array.<number>} end 4D array for end coordinates (X, Y, W, H).
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.SlideResize}
 * @constructor
 * @deprecated
 */
goog.fx.dom.SlideResizeFrom = function(element, end, time, opt_acc) {
  var start = [element.offsetLeft, element.offsetTop,
      element.offsetWidth, element.offsetHeight];
  goog.fx.dom.SlideResize.call(this, element, start, end, time, opt_acc);
};
goog.inherits(goog.fx.dom.SlideResizeFrom, goog.fx.dom.SlideResize);


/**
 * Creates an animation object that will slide an element from A to B.  (This
 * in effect automatically sets up the onanimate event for an Animation object)
 *
 * Start and End should be 1 dimensional arrays
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {Array.<number>} start 1D array for start coordinates (X).
 * @param {Array.<number>} end 1D array for end coordinates (X).
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.PredefinedEffect}
 * @constructor
 * @deprecated
 */
goog.fx.dom.SlideLeft = function(element, start, end, time, opt_acc) {
  goog.fx.dom.PredefinedEffect.apply(this, arguments);
};
goog.inherits(goog.fx.dom.SlideLeft, goog.fx.dom.PredefinedEffect);


/** @inheritDoc */
goog.fx.dom.SlideLeft.prototype.updateStyle = function() {
  this.element.style.left = Math.round(this.coords[0]) + 'px';
};
