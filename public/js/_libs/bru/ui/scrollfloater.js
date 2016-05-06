/**
 * @fileoverview  Class for making an element detach and float to remain
 * visible when otherwise it would have scrolled up out of view.
 *
 * Based on bru.ui.ScrollFloater
 */


goog.provide('bru.ui.ScrollFloater');
goog.provide('bru.ui.ScrollFloater.EventType');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('goog.pubsub.PubSub');
goog.require('goog.style');
goog.require('goog.ui.Component');



/**
 * Creates a ScrollFloater; see file overview for details.
 *
 * @param {Element=} opt_parentElement Where to attach the element when it's
 *     floating.  Default is the document body.  If the floating element
 *     contains form inputs, it will be necessary to attach it to the
 *     corresponding form element, or to an element in the DOM subtree under
 *     the form element.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
bru.ui.ScrollFloater = function(opt_parentElement, opt_domHelper) {
  // If a parentElement is supplied, we want to use its domHelper,
  // ignoring the caller-supplied one.
  var domHelper = opt_parentElement ?
      goog.dom.getDomHelper(opt_parentElement) : opt_domHelper;

  goog.ui.Component.call(this, domHelper);

  /**
   * The element to which the scroll-floated element will be attached
   * when it is floating.
   * @type {Element}
   * @private
   */
  this.parentElement_ =
      opt_parentElement || this.getDomHelper().getDocument().body;

  /**
   * The original styles applied to the element before it began floating;
   * used to restore those styles when the element stops floating.
   * @type {Object}
   * @private
   */
  this.originalStyles_ = {};

  /**
   * @type {boolean}
   * @private
   */
  this.isPaused_ = false;

  /**
   * @type {goog.pubsub.PubSub}
   */
  var pubsub = goog.pubsub.PubSub.getInstance();
  pubsub.subscribe('sf-pause', this.pause, this);
};
goog.inherits(bru.ui.ScrollFloater, goog.ui.Component);


/**
 * Events dispatched by this component.
 * @enum {string}
 */
bru.ui.ScrollFloater.EventType = {
  /**
   * Dispatched when the component starts floating. The event is
   * cancellable.
   */
  FLOAT: 'float',

  /**
   * Dispatched when the component stops floating and returns to its
   * original state. The event is cancellable.
   */
  DOCK: 'dock'
};


/**
 * The placeholder element dropped in to hold the layout for
 * the floated element.
 * @type {Element}
 * @private
 */
bru.ui.ScrollFloater.prototype.placeholder_;


/**
 * Whether scrolling is enabled for this element; true by default.
 * The {@link #setScrollingEnabled} method can be used to change this value.
 * @type {boolean}
 * @private
 */
bru.ui.ScrollFloater.prototype.scrollingEnabled_ = true;


/**
 * A flag indicating whether this instance is currently floating.
 * @type {boolean}
 * @private
 */
bru.ui.ScrollFloater.prototype.floating_ = false;


/**
 * The original vertical page offset at which the top of the element
 * was rendered.
 * @type {number}
 * @private
 */
bru.ui.ScrollFloater.prototype.originalOffset_;


/**
 * The style properties which are stored when we float an element, so they
 * can be restored when it 'docks' again.
 * @type {Array.<string>}
 * @private
 */
bru.ui.ScrollFloater.STORED_STYLE_PROPS_ = [
  'position', 'top', 'left', 'width', 'cssFloat'];


/**
 * The style elements managed for the placeholder object.
 * @type {Array.<string>}
 * @private
 */
bru.ui.ScrollFloater.PLACEHOLDER_STYLE_PROPS_ = [
  'position', 'top', 'left', 'display', 'cssFloat',
  'marginTop', 'marginLeft', 'marginRight', 'marginBottom'];


/**
 * The class name applied to the floating element.
 * @type {string}
 * @private
 */
bru.ui.ScrollFloater.CSS_CLASS_ = goog.getCssName('scrollfloater');


/**
 * @param {boolean} b
 */
bru.ui.ScrollFloater.prototype.pause = function(b) {
  this.isPaused_ = b;
};


/**
 * Delegates dom creation to superclass, then constructs and
 * decorates required DOM elements.
 * @override
 */
bru.ui.ScrollFloater.prototype.createDom = function() {
  bru.ui.ScrollFloater.superClass_.createDom.call(this);

  this.decorateInternal(this.getElement());
};


/**
 * Decorates the floated element with the standard ScrollFloater CSS class.
 * @param {Element} element The element to decorate.
 * @override
 */
bru.ui.ScrollFloater.prototype.decorateInternal = function(element) {
  bru.ui.ScrollFloater.superClass_.decorateInternal.call(this, element);

  goog.dom.classlist.add(element, bru.ui.ScrollFloater.CSS_CLASS_);
};


/** @override */
bru.ui.ScrollFloater.prototype.enterDocument = function() {
  bru.ui.ScrollFloater.superClass_.enterDocument.call(this);

  if (!this.placeholder_) {
    this.placeholder_ =
        this.getDomHelper().createDom('div', {'style': 'visibility:hidden'});
  }

  this.originalOffset_ = goog.style.getPageOffsetTop(this.getElement());
  this.setScrollingEnabled(this.scrollingEnabled_);
  this.getHandler().listen(
      window, goog.events.EventType.SCROLL, this.update);
  this.getHandler().listen(
      window, goog.events.EventType.RESIZE, this.handleResize_);
};


/** @override */
bru.ui.ScrollFloater.prototype.disposeInternal = function() {
  bru.ui.ScrollFloater.superClass_.disposeInternal.call(this);

  delete this.placeholder_;
};


/**
 * Sets whether the element should be floated if it scrolls out of view.
 * @param {boolean} enable Whether floating is enabled for this element.
 */
bru.ui.ScrollFloater.prototype.setScrollingEnabled = function(enable) {
  this.scrollingEnabled_ = enable;

  if (enable) {
    this.update();
  } else {
    this.stopFloating_();
  }
};


/**
 * @return {boolean} Whether the component is enabled for scroll-floating.
 */
bru.ui.ScrollFloater.prototype.isScrollingEnabled = function() {
  return this.scrollingEnabled_;
};


/**
 * @return {boolean} Whether the component is currently scroll-floating.
 */
bru.ui.ScrollFloater.prototype.isFloating = function() {
  return this.floating_;
};


/**
 * When a scroll event occurs, compares the element's position to the current
 * document scroll position, and stops or starts floating behavior if needed.
 * @param {goog.events.Event=} opt_e The event, which is ignored.
 */
bru.ui.ScrollFloater.prototype.update = function(opt_e) {
  if (this.scrollingEnabled_ && !this.isPaused_) {
    var doc = this.getDomHelper().getDocument();
    var currentScrollTop = this.getDomHelper().getDocumentScroll().y;

    var now = goog.now();
    if (!this.originalOffsetTimestamp_ || now - this.originalOffsetTimestamp_ > 250) {
      this.originalOffsetTimestamp_ = now;
      this.originalOffset_ = goog.style.getPageOffsetTop(
          this.floating_ ? this.placeholder_ : this.element_);
    }

    if (currentScrollTop > this.originalOffset_) {
      this.startFloating_();
    } else {
      this.stopFloating_();
    }
  }
};


/**
 * Begins floating behavior, making the element position:fixed (or IE hacked
 * equivalent) and inserting a placeholder where it used to be to keep the
 * layout from shifting around.
 * @private
 */
bru.ui.ScrollFloater.prototype.startFloating_ = function() {
  // Ignore if the component is floating or the FLOAT event is cancelled.
  if (this.floating_ ||
      !this.dispatchEvent(bru.ui.ScrollFloater.EventType.FLOAT)) {
    return;
  }

  var elem = this.getElement();
  var doc = this.getDomHelper().getDocument();

  // Read properties of element before modifying it.
  var originalLeft_ = goog.style.getPageOffsetLeft(elem);
  var originalWidth_ = goog.style.getContentBoxSize(elem).width;

  this.originalStyles_ = {};

  // Store styles while not floating so we can restore them when the
  // element stops floating.
  goog.object.forEach(bru.ui.ScrollFloater.STORED_STYLE_PROPS_,
                      function(property) {
                        this.originalStyles_[property] = elem.style[property];
                      },
                      this);

  // Copy relevant styles to placeholder so it will be layed out the same
  // as the element that's about to be floated.
  goog.object.forEach(bru.ui.ScrollFloater.PLACEHOLDER_STYLE_PROPS_,
                      function(property) {
                        this.placeholder_.style[property] =
                            elem.style[property] ||
                                goog.style.getCascadedStyle(elem, property) ||
                                goog.style.getComputedStyle(elem, property);
                      },
                      this);

  goog.style.setSize(this.placeholder_, elem.offsetWidth, elem.offsetHeight);

  // Make element float.

  goog.style.setStyle(elem, {
    'left': originalLeft_ + 'px',
    'width': originalWidth_ + 'px',
    'cssFloat': 'none'
  });

  // If parents are the same, avoid detaching and reattaching elem.
  // This prevents Flash embeds from being reloaded, for example.
  if (elem.parentNode == this.parentElement_) {
    elem.parentNode.insertBefore(this.placeholder_, elem);
  } else {
    elem.parentNode.replaceChild(this.placeholder_, elem);
    this.parentElement_.appendChild(elem);
  }

  elem.style.position = 'fixed';
  elem.style.top = '0';

  this.floating_ = true;
};


/**
 * Stops floating behavior, returning element to its original state.
 * @private
 */
bru.ui.ScrollFloater.prototype.stopFloating_ = function() {
  // Ignore if the component is docked or the DOCK event is cancelled.
  if (!this.floating_ ||
      !this.dispatchEvent(bru.ui.ScrollFloater.EventType.DOCK)) {
    return;
  }

  var elem = this.getElement();

  for (var prop in this.originalStyles_) {
    elem.style[prop] = this.originalStyles_[prop];
  }

  // If placeholder_ was inserted and didn't replace elem then elem has
  // the right parent already, no need to replace (which removes elem before
  // inserting it).
  if (this.placeholder_.parentNode == this.parentElement_) {
    this.placeholder_.parentNode.removeChild(this.placeholder_);
  } else {
    this.placeholder_.parentNode.replaceChild(elem, this.placeholder_);
  }
  this.floating_ = false;
};


/**
 * Responds to window resize events by snapping the floater back to the new
 * version of its original position, then allowing it to float again if
 * appropriate.
 * @private
 */
bru.ui.ScrollFloater.prototype.handleResize_ = function() {
  this.stopFloating_();
  this.originalOffset_ = goog.style.getPageOffsetTop(this.getElement());
  this.update();
};
