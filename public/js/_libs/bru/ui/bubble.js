goog.provide('bru.ui');
goog.provide('bru.ui.Bubble');
goog.provide('bru.ui.Bubble.Type');
goog.provide('bru.ui.bubble');

goog.require('bru.dom');
goog.require('bru.i18n.Bubble');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.dom.classlist');
goog.require('goog.events.EventType');
goog.require('goog.fx.css3.Transition');
goog.require('goog.math.Box');
goog.require('goog.positioning');
goog.require('goog.positioning.AnchoredPosition');
goog.require('goog.positioning.AnchoredViewportPosition');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.CornerBit');
goog.require('goog.style');
goog.require('goog.style.transition');
goog.require('goog.ui.Component');
goog.require('goog.ui.Popup');
goog.require('goog.ui.PopupBase');
goog.require('goog.userAgent');



/**
 * The Bubble provides a general purpose bubble implementation that can be
 * anchored to a particular element.
 *
 * @param {string|Element} message HTML string or an element to display inside
 *     the bubble.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
bru.ui.Bubble = function(message, opt_domHelper) {
  goog.base(this, opt_domHelper);

  /**
   * The HTML string or element to display inside the bubble.
   *
   * @type {string|Element}
   * @private
   */
  this.message_ = message;

  /**
   * The Popup element used to position and display the bubble.
   *
   * @type {goog.ui.Popup}
   * @private
   */
  this.popup_ = new goog.ui.Popup();

  /**
   * Id of the close button for this bubble.
   *
   * @type {string}
   * @private
   */
  this.closeButtonId_ = this.makeId('cb');

  /**
   * Id of the div for the embedded element.
   *
   * @type {string}
   * @private
   */
  this.messageId_ = this.makeId('mi');

  this.setAutoHide(true);
  this.popup_.setHideOnEscape(true);
};
goog.inherits(bru.ui.Bubble, goog.ui.Component);


/**
 * Bubble type
 * @enum {number}
 */
bru.ui.Bubble.Type = {
  ALERT: 0,
  ERROR: 1,
  CONFIRM: 2
};


/**
 * @type {Element}
 * @private
 */
bru.ui.Bubble.prototype.anchor_;


/**
 * @type {boolean}
 * @private
 */
bru.ui.Bubble.prototype.fixedPosition_ = false;


/**
 * @type {number}
 * @private
 */
bru.ui.Bubble.prototype.marginShift_ = 28;


/**
 * Id of the close button for this bubble.
 *
 * @type {goog.positioning.Corner}
 * @private
 */
bru.ui.Bubble.prototype.corner_ = goog.positioning.Corner.BOTTOM_LEFT;


/**
 * @type {string}
 * @private
 */
bru.ui.Bubble.prototype.cssClass_ = '';


/**
 * @type {boolean}
 * @private
 */
bru.ui.Bubble.prototype.useTransitions_ = true;


/**
 * @param {boolean} b
 */
bru.ui.Bubble.prototype.setUseTransitions = function(b) {
  this.useTransitions_ = b;
};


/**
 * @param {goog.positioning.Corner} corner The corner.
 */
bru.ui.Bubble.prototype.setCorner = function(corner) {
  this.corner_ = corner;
};


/**
 * @param {string|Element} message
 */
bru.ui.Bubble.prototype.setMessage = function(message) {
  this.message_ = message;
};


/**
 * @param {string} className
 */
bru.ui.Bubble.prototype.setCssClass = function(className) {
  this.cssClass_ = className;
};


/**
 * @return {Element}
 */
bru.ui.Bubble.prototype.getAnchor = function() {
  return this.anchor_;
};


/**
 * @return {goog.ui.Popup}
 */
bru.ui.Bubble.prototype.getPopup = function() {
  return this.popup_;
};


/** @inheritDoc */
bru.ui.Bubble.prototype.createDom = function() {
  goog.base(this, 'createDom');

  var element = this.getElement();
  element.style.position = 'absolute';
  element.style.visibility = 'hidden';
  element.style.zIndex = 10;

  this.popup_.setElement(element);
};


/**
 * Attaches the bubble to an anchor element. Computes the positioning and
 * orientation of the bubble.
 *
 * @param {Element} anchorElement The element to which we are attaching.
 * @param {boolean=} opt_noAdjustCorner Не изменять угол при выводе.
 */
bru.ui.Bubble.prototype.attach = function(anchorElement, opt_noAdjustCorner) {
  this.anchor_ = anchorElement;
  this.popup_.setPinnedCorner(this.corner_);
  var margin = this.createMarginForCorner_();
  this.popup_.setMargin(margin);
  var anchorCorner = goog.positioning.flipCornerVertical(this.corner_);
  var position = opt_noAdjustCorner ?
      new goog.positioning.AnchoredPosition(anchorElement, anchorCorner) :
      new goog.positioning.AnchoredViewportPosition(anchorElement, anchorCorner);

  // Смотрим есть ли у родителей position: fixed.
  for (var ancestor = anchorElement;
      ancestor && ancestor != document.body;
      ancestor = ancestor.parentNode) {
    if (goog.style.getComputedPosition(/** @type {!Element} */ (ancestor)) == 'fixed') {
      this.fixedPosition_ = true;
      break;
    }
  }

  this.popup_.setPosition(position);
};


/**
 * Перемещаем bubble на новую позицию якоря.
 */
bru.ui.Bubble.prototype.reposition = function() {
  if (!this.anchor_) {
    return;
  }

  if (this.fixedPosition_) {
    this.popup_.reposition();
    this.fixedReposition_();
  } else {
    this.ajustCornerAndReposition_();
  }
};


/**
 * @private
 */
bru.ui.Bubble.prototype.fixedReposition_ = function() {
  var element = this.getElement();
  if (this.fixedPosition_ && element) {
    var scroll = goog.dom.getDocumentScroll();
    goog.style.setPosition(element,
      parseFloat(element.style.left) - scroll.x,
      parseFloat(element.style.top) - scroll.y);
    element.style.position = 'fixed';
  }
};


/**
 * Sets the corner of the bubble to used in the positioning algorithm.
 *
 * @param {goog.positioning.Corner} corner The bubble corner used for
 *     positioning constants.
 */
bru.ui.Bubble.prototype.setPinnedCorner = function(corner) {
  this.popup_.setPinnedCorner(corner);
};


/**
 * Sets whether the bubble should be automatically hidden whenever user clicks
 * outside the bubble element.
 *
 * @param {boolean} autoHide Whether to hide if user clicks outside the bubble.
 */
bru.ui.Bubble.prototype.setAutoHide = function(autoHide) {
  this.popup_.setAutoHide(autoHide);
};


/**
 * Sets whether the bubble should be visible.
 *
 * @param {boolean} visible Desired visibility state.
 */
bru.ui.Bubble.prototype.setVisible = function(visible) {
  if (visible && !this.popup_.isVisible()) {
    this.configureElement_();
  }

  this.popup_.setVisible(visible);
  this.fixedReposition_();

  // IE7,8 PIE class.
  if (visible && this.popup_ && goog.userAgent.IE && !goog.userAgent.isVersionOrHigher(9)) {
    var bubbleEl = goog.dom.getElementByClass('bubble', this.popup_.getElement());
    goog.dom.classlist.add(bubbleEl, 'bubble-pie');
  }

  if (this.popup_ && !this.popup_.isVisible()) {
    this.unconfigureElement_();
    this.dispose();
  }
};


/**
 * @return {boolean} Whether the bubble is visible.
 */
bru.ui.Bubble.prototype.isVisible = function() {
  return !!this.popup_ && this.popup_.isVisible();
};


/** @override */
bru.ui.Bubble.prototype.disposeInternal = function() {
  this.unconfigureElement_();
  this.popup_.dispose();
  this.popup_ = null;
  bru.ui.Bubble.superClass_.disposeInternal.call(this);
};


/**
 * Computes the right offset for a given bubble corner
 * and creates a margin element for it. This is done to have the
 * button anchor element on its frame rather than on the corner.
 *
 * @return {goog.math.Box} the computed margin. Only left or right fields are
 *     non-zero, but they may be negative.
 * @private
 */
bru.ui.Bubble.prototype.createMarginForCorner_ = function() {
  goog.asserts.assert(this.anchor_, 'Undefined anchor element.');

  var margin = new goog.math.Box(0, 0, 0, 0);
  // Для узких элементов позиционируем стрелку по-центру элемента,
  // для широких оставляем как есть.
  var halfWidth = this.anchor_.offsetWidth >> 1;
  var marginWidth = Math.max(this.marginShift_ - halfWidth, 0);
  if (this.corner_ & goog.positioning.CornerBit.RIGHT) {
    margin.right -= marginWidth;
  } else {
    margin.left -= marginWidth;
  }
  return margin;
};


/**
 * @private
 * @return {goog.positioning.Corner}
 */
bru.ui.Bubble.prototype.ajustCornerAndReposition_ = function() {
  var element = this.getElement();

  var corner = this.popup_.getPinnedCorner();
  element.innerHTML = this.computeHtmlForCorner_(corner);

  this.popup_.reposition();

  var pos = this.popup_.getPosition();
  var ajustedCorner = pos.ajustedCorner;
  if (ajustedCorner != null) {
    corner = ajustedCorner;
    element.innerHTML = this.computeHtmlForCorner_(ajustedCorner);
  }
  return corner;
};


/**
 * Creates element's contents. This is called on setVisible(true).
 * @private
 */
bru.ui.Bubble.prototype.configureElement_ = function() {
  if (!this.isInDocument()) {
    throw Error('You must render the bubble before showing it!');
  }

  // Магия с z-index'ом.
  // Вычисляем ближайший элемент с z-index'ом и ставим +1 у бабла.
  if (this.anchor_) {
    var aZIndex = bru.dom.getAncestorZIndex(this.anchor_) || 10;
    this.element_.style.zIndex = Math.max(aZIndex + 1, 10);
  }

  var corner = this.ajustCornerAndReposition_();
  var element = this.getElement();

  if (this.useTransitions_ && goog.style.transition.isSupported()) {
    var bottom = corner & goog.positioning.CornerBit.BOTTOM;
    var showTransition = new goog.fx.css3.Transition(element, 0.1,
        {opacity: 0, marginTop: bottom ? '6px' : '-6px'},
        {opacity: 1, marginTop: 0}, 'all .1s ease-out');
    var hideTransition = new goog.fx.css3.Transition(element, 0.1,
        {opacity: 1, marginTop: 0},
        {opacity: 0, marginTop: bottom ? '-6px' : '6px'}, 'all .1s ease-in');
    this.popup_.setTransition(showTransition, hideTransition);
  }

  if (typeof this.message_ == 'object') {
    var messageDiv = this.getDomHelper().getElement(this.messageId_);
    this.getDomHelper().appendChild(messageDiv, this.message_);
  }

  var closeButton = this.getDomHelper().getElement(this.closeButtonId_);
  this.vsm_ = this.vsm_ || goog.dom.ViewportSizeMonitor.getInstanceForWindow();
  this.getHandler()
      .listen(this.vsm_, goog.events.EventType.RESIZE, this.reposition)
      .listen(this.popup_, goog.ui.PopupBase.EventType.HIDE, this.hideBubble_)
      .listen(closeButton, goog.events.EventType.CLICK, this.hideBubble_);
};


/**
 * Gets rid of the element's contents.
 * This is called on dispose as well as on setVisible(false).
 * @private
 */
bru.ui.Bubble.prototype.unconfigureElement_ = function() {
  var element = this.getElement();
  if (element) {
    this.getDomHelper().removeChildren(element);
    element.innerHTML = '';
  }
};


/**
 * Hides the bubble.
 * @private
 */
bru.ui.Bubble.prototype.hideBubble_ = function() {
  this.setVisible(false);
};


/**
 * Returns an AnchoredPosition that will position the bubble optimally
 * given the position of the anchor element and the size of the viewport.
 *
 * @param {Element} anchorElement The element to which the bubble is attached.
 * @return {!goog.positioning.AnchoredPosition} The AnchoredPosition
 *     to give to {@link #setPosition}.
 */
bru.ui.Bubble.prototype.getComputedAnchoredPosition = function(anchorElement) {
  return new goog.positioning.AnchoredPosition(
      anchorElement, this.corner_);
};


/**
 * Computes the HTML string for a given bubble orientation.
 *
 * @param {goog.positioning.Corner} corner The corner.
 * @return {string} The HTML string to place inside the bubble's popup.
 * @private
 */
bru.ui.Bubble.prototype.computeHtmlForCorner_ = function(corner) {
  var bottom = corner & goog.positioning.CornerBit.BOTTOM;
  var right = corner & goog.positioning.CornerBit.RIGHT;
  var bubbleClass = bottom ?
      goog.getCssName('bubble-bottom') :
      goog.getCssName('bubble-top');
  var bubbleAnchorClass = bottom ?
      right ? goog.getCssName('bubble-anchor-bottom-right') :
              goog.getCssName('bubble-anchor-bottom-left') :
      right ? goog.getCssName('bubble-anchor-top-right') :
              goog.getCssName('bubble-anchor-top-left');
  var bubbleAnchorArrowClass = bottom ?
      goog.getCssName('bubble-anchor-arrow-bottom') :
      goog.getCssName('bubble-anchor-arrow-top');
  return '<div class="' + goog.getCssName('bubble') + ' ' + bubbleClass + ' ' + this.cssClass_ + '">' +
      (typeof this.message_ == 'object' ?
      '<div id="' + this.messageId_ + '"></div>' : this.message_) +
      '<div id="' + this.closeButtonId_ + '" class="' +
      goog.getCssName('bubble-close-button') + '"></div>' +
      '<div class="' + goog.getCssName('bubble-anchor') + ' ' + bubbleAnchorClass + '">' +
      '<div class="' + goog.getCssName('bubble-anchor-arrow') + ' ' + bubbleAnchorArrowClass + '"></div>' +
      '</div>' +
      '</div>';
};


/**
 * @type {bru.ui.Bubble}
 * @private
 */
bru.ui.Bubble.instance_;


/**
 * @type {bru.ui.Bubble}
 * @private
 */
bru.ui.Bubble.promptInstance_;


/**
 * @return {bru.ui.Bubble}
 */
bru.ui.getBubble = function() {
  return bru.ui.Bubble.instance_;
};


/**
 * @param {Element} el
 * @param {string} msg
 * @param {bru.ui.Bubble.Type=} opt_type
 * @param {goog.positioning.Corner=} opt_corner
 * @param {string=} opt_cssClass
 * @param {Function=} opt_callback
 * @param {?string=} opt_confirmMsg
 * @param {?string=} opt_cancelMsg
 * @param {boolean=} opt_noAutohide
 * @return {bru.ui.Bubble}
 */
bru.ui.bubble.bubble = function(el, msg, opt_type, opt_corner, opt_cssClass,
    opt_callback, opt_confirmMsg, opt_cancelMsg, opt_noAutohide) {
  bru.ui.bubble.dispose();

  if (opt_type == bru.ui.Bubble.Type.CONFIRM) {
    msg += '<div class="' + goog.getCssName('bubble-confirm-buttons') + '">' +
        '<button class="xbutton xbutton-mid ' +
        goog.getCssName('bubble-confirm-button') +
        '">' + (opt_confirmMsg || bru.i18n.Bubble.YES) + '</button> ' +
        '<button class="xbutton xbutton-mid ' +
        goog.getCssName('bubble-cancel-button') +
        '">' + (opt_cancelMsg || bru.i18n.Bubble.NO) + '</button></div>';
  }

  bru.ui.Bubble.instance_ = new bru.ui.Bubble(msg);
  if (opt_type || opt_cssClass) {
    bru.ui.Bubble.instance_.setCssClass('bubble-' +
        (opt_cssClass || (opt_type == bru.ui.Bubble.Type.ERROR ? 'error' : 'confirm')));
  }
  if (goog.isDefAndNotNull(opt_corner)) {
    bru.ui.Bubble.instance_.setCorner(opt_corner);
  }
  if (opt_noAutohide) {
    bru.ui.Bubble.instance_.setAutoHide(false);
  }
  bru.ui.Bubble.instance_.attach(el);
  bru.ui.Bubble.instance_.render();
  bru.ui.Bubble.instance_.setVisible(true);

  if (opt_type == bru.ui.Bubble.Type.CONFIRM) {
    goog.asserts.assertFunction(opt_callback);

    var bubbleEl = bru.ui.Bubble.instance_.getElement();
    var buttons = bubbleEl.getElementsByTagName('button');
    bru.ui.Bubble.instance_.getHandler()
        .listenOnce(buttons[0], goog.events.EventType.CLICK,
            goog.partial(bru.ui.bubble.confirmHelper_, opt_callback, true))
        .listenOnce(buttons[1], goog.events.EventType.CLICK,
            goog.partial(bru.ui.bubble.confirmHelper_, opt_callback, false));
    buttons[0].focus();
  }

  return bru.ui.Bubble.instance_;
};


/**
 * Set position fixed and recalc coords.
 * @param {Function} callback
 * @param {boolean} confirm
 * @private
 */
bru.ui.bubble.confirmHelper_ = function(callback, confirm) {
  bru.ui.Bubble.instance_.setVisible(false);
  callback.call(callback, confirm);
};


/**
 * @param {Element} el
 * @param {string} msg
 * @param {goog.positioning.Corner=} opt_corner
 * @param {string=} opt_cssClass
 * @return {bru.ui.Bubble}
 */
bru.ui.bubble.prompt = function(el, msg, opt_corner, opt_cssClass) {
  bru.ui.bubble.promptDispose();

  bru.ui.Bubble.promptInstance_ = new bru.ui.Bubble(msg);
  bru.ui.Bubble.promptInstance_.setAutoHide(false);
  if (opt_cssClass) {
    bru.ui.Bubble.promptInstance_.setCssClass('bubble-' + opt_cssClass);
  }
  if (opt_corner) {
    bru.ui.Bubble.promptInstance_.setCorner(opt_corner);
  }
  bru.ui.Bubble.promptInstance_.attach(el);
  bru.ui.Bubble.promptInstance_.render();
  bru.ui.Bubble.promptInstance_.setVisible(true);

  return bru.ui.Bubble.promptInstance_;
};


/**
 * Dispose bubble.
 */
bru.ui.bubble.dispose = function() {
  goog.dispose(bru.ui.Bubble.instance_);
};


/**
 * Dispose prompt bubble.
 */
bru.ui.bubble.promptDispose = function() {
  bru.ui.bubble.dispose();
  goog.dispose(bru.ui.Bubble.promptInstance_);
};


/**
 * Set position fixed and recalc coords.
 * @deprecated No need to use it anymore.
 */
bru.ui.bubble.setFixed = function() {
  var el = bru.ui.Bubble.instance_.getElement();
  var scroll = goog.dom.getDocumentScroll();
  goog.style.setPosition(el,
      parseFloat(el.style.left) - scroll.x, parseFloat(el.style.top) - scroll.y);
  el.style.position = 'fixed';
};
