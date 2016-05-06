goog.provide('bru.ui.Dialog');

goog.require('bru.style.css3.transform');
goog.require('bru.ui.DialogBase');
goog.require('goog.dom');
goog.require('goog.fx.Animation');
goog.require('goog.fx.Transition');
goog.require('goog.fx.css3.Transition');
goog.require('goog.fx.easing');
goog.require('goog.style.transition');


/**
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link
 *     goog.ui.Component} for semantics.
 * @extends {bru.ui.DialogBase}
 */
bru.ui.Dialog = function(opt_domHelper) {
  bru.ui.DialogBase.call(this, opt_domHelper);

};
goog.inherits(bru.ui.Dialog, bru.ui.DialogBase);


/**
 * Duration of open/close animation, in seconds.
 * @type {number}
 */
bru.ui.Dialog.TRANSITION_DURATION = 0.25;


/** @inheritDoc */
bru.ui.Dialog.prototype.onShow = function() {
  goog.dispose(this.showTransition_);
  goog.dispose(this.showBgTransition_);

  bru.style.css3.transform.removeAll(this.getElement());

  bru.ui.Dialog.superClass_.onShow.call(this);
};


/** @inheritDoc */
bru.ui.Dialog.prototype.onHide = function() {
  goog.dispose(this.hideTransition_);
  goog.dispose(this.hideBgTransition_);

  bru.ui.Dialog.superClass_.onHide.call(this);
};


/**
 * @param {boolean} visible
 * @protected
 */
bru.ui.Dialog.prototype.setVisibleInit = function(visible) {
  var transition;
  var bgTransition;

  var viewSize = goog.dom.getViewportSize(window);

  if (goog.style.transition.isSupported()) {
    var showTransform = 'rotate(35deg) skew(-50deg,0) translate(-' + viewSize.width + 'px,0) scale(.1)';
    var visibleTransform = 'rotate(0) skew(0,0) translate(0,0) scale(1)';
    var hideTransform = 'rotate(0) skew(25deg,0) translate(' + viewSize.width + 'px,0) scale(.5)';
    transition = bru.ui.Dialog.getCss3Transition_(this.getElement(),
          visible, false, showTransform, visibleTransform, hideTransform);
    bgTransition = bru.ui.Dialog.getCss3Transition_(this.bgEl_, visible, true);
  } else {
    var left = this.getElement().offsetLeft;

    transition = new goog.fx.Animation(
        [visible ? 0 : 1, left - (visible ? viewSize.width : 0)],
        [visible ? 1 : 0, left + (visible ? 0 : viewSize.width)],
        bru.ui.Dialog.TRANSITION_DURATION * 1000,
        visible ? goog.fx.easing.easeOut : goog.fx.easing.easeIn);

    var events = [goog.fx.Transition.EventType.BEGIN,
        goog.fx.Animation.EventType.ANIMATE,
        goog.fx.Transition.EventType.END];
    this.getHandler()
        .listen(transition, events, this.onAnimate);
  }
  if (visible) {
    this.showTransition_ = transition;
    this.showBgTransition_ = bgTransition;
  } else {
    this.hideTransition_ = transition;
    this.hideBgTransition_ = bgTransition;
  }
};


/**
 * Css3 Transition Helper.
 * @param {Element} element
 * @param {boolean} visible
 * @param {boolean} canChangeOpacity
 * @param {string=} opt_showTransform
 * @param {string=} opt_visibleTransform
 * @param {string=} opt_hideTransform
 * @return {goog.fx.css3.Transition}
 * @private
 */
bru.ui.Dialog.getCss3Transition_ = function(element, visible, canChangeOpacity,
    opt_showTransform, opt_visibleTransform, opt_hideTransform) {
  if (!element) {
    return null;
  }

  var initialStyle = {};
  var finalStyle = {};
  if (canChangeOpacity) {
    initialStyle.opacity = visible ? 0 : 1;
    finalStyle.opacity = visible ? 1 : 0;
  }
  if (opt_showTransform && opt_visibleTransform) {
    initialStyle[bru.style.css3.transform.getProperty()] =
        visible ? opt_showTransform : opt_visibleTransform;
    finalStyle[bru.style.css3.transform.getProperty()] =
        visible ? opt_visibleTransform : opt_hideTransform || opt_showTransform;
  }

  var timing = visible ? 'ease-out' : 'ease-in';
  return new goog.fx.css3.Transition(element, bru.ui.Dialog.TRANSITION_DURATION,
      initialStyle, finalStyle,
      (opt_showTransform && opt_visibleTransform ? 'all ' : 'opacity ') +
      bru.ui.Dialog.TRANSITION_DURATION + 's ' + timing);
};


/**
 * @param {goog.events.Event} e The event.
 * @protected
 */
bru.ui.Dialog.prototype.onAnimate = function(e) {
  if (this.bgEl_) {
    var style = this.bgEl_.style;
    if ('opacity' in style) {
      style.opacity = e.x;
    } else {
      style.filter = 'alpha(opacity=' + e.x * 40 + ')';
    }
  }
  this.getElement().style.left = Math.round(e.y) + 'px';
};
