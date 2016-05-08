goog.provide('drive.Slider');
goog.provide('drive.Slider.Orientation');

goog.require('goog.dom');
goog.require('goog.a11y.aria');
goog.require('goog.ui.SliderBase');
goog.require('goog.ui.SliderBase.Orientation');



/**
 * This creates a slider object.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.SliderBase}
 */
drive.Slider = function(opt_domHelper) {
  goog.ui.SliderBase.call(this, opt_domHelper);
  this.rangeModel.setExtent(0);
};
goog.inherits(drive.Slider, goog.ui.SliderBase);


/**
 * Expose Enum of superclass (representing the orientation of the slider) within
 * Slider namespace.
 *
 * @enum {string}
 */
drive.Slider.Orientation = goog.ui.SliderBase.Orientation;


/**
 * The prefix we use for the CSS class names for the slider and its elements.
 * @type {string}
 */
drive.Slider.CSS_CLASS_PREFIX = goog.getCssName('slider');


/**
 * CSS class name for the single thumb element.
 * @type {string}
 */
drive.Slider.THUMB_CSS_CLASS =
    goog.getCssName(drive.Slider.CSS_CLASS_PREFIX, 'thumb');


/**
 * Returns CSS class applied to the slider element.
 * @param {goog.ui.SliderBase.Orientation} orient Orientation of the slider.
 * @return {string} The CSS class applied to the slider element.
 * @protected
 */
drive.Slider.prototype.getCssClass = function(orient) {
  return orient == goog.ui.SliderBase.Orientation.VERTICAL ?
      goog.getCssName(drive.Slider.CSS_CLASS_PREFIX, 'vertical') :
      goog.getCssName(drive.Slider.CSS_CLASS_PREFIX, 'horizontal');
};


/** @inheritDoc */
drive.Slider.prototype.createThumbs = function() {
  // find thumb
  var element = this.getElement();
  var thumb = goog.dom.getElementsByTagNameAndClass(
      null, drive.Slider.THUMB_CSS_CLASS, element)[0];
  if (!thumb) {
    thumb = this.createThumb_();
    element.appendChild(thumb);
  }
  this.valueThumb = this.extentThumb = thumb;
};


/**
 * Creates the thumb element.
 * @return {HTMLDivElement} The created thumb element.
 * @private
 */
drive.Slider.prototype.createThumb_ = function() {
  var thumb =
      this.getDomHelper().createDom('div', drive.Slider.THUMB_CSS_CLASS);
  goog.a11y.aria.setRole(thumb, goog.dom.a11y.Role.BUTTON);
  return /** @type {HTMLDivElement} */ (thumb);
};


/**
 * Убираем реакцию на колесо мышки.
 * @param {goog.events.MouseWheelEvent} e  The mouse wheel event object.
 * @private
 */
drive.Slider.prototype.handleMouseWheel_ = function(e) {
};