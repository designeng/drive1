goog.provide('bru.ui.Lightbox');

goog.require('bru.ui.Dialog');
goog.require('goog.events.EventType');
goog.require('goog.fx.Animation');
goog.require('goog.fx.Transition');
goog.require('goog.fx.easing');
goog.require('goog.style');



/**
 * @constructor
 * @param {Element=} opt_anchor Элемент от которого будет "раскрываться" lightbox.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link
 *     goog.ui.Component} for semantics.
 * @extends {bru.ui.Dialog}
 */
bru.ui.Lightbox = function(opt_anchor, opt_domHelper) {
  bru.ui.Dialog.call(this, opt_domHelper);

  /**
   * @type {Element}
   * @private
   */
  this.anchor_ = opt_anchor || null;
};
goog.inherits(bru.ui.Lightbox, bru.ui.Dialog);


/**
 * Anchor element.
 * @type {Element}
 * @private
 */
bru.ui.Lightbox.prototype.anchor_ = null;


/**
 * @type {string}
 * @private
 */
bru.ui.Lightbox.prototype.class_ = goog.getCssName('lightbox');


/**
 * @type {number}
 * @private
 */
bru.ui.Lightbox.prototype.margin_ = 15;


/**
 * @param {Element} anchor
 */
bru.ui.Lightbox.prototype.setAnchor = function(anchor) {
  this.anchor_ = anchor;
};


/**
 * @param {number} margin
 */
bru.ui.Lightbox.prototype.setMargin = function(margin) {
  this.margin_ = margin;
};


/**
 * @param {string} src
 * @param {number} width
 * @param {number} height
 */
bru.ui.Lightbox.prototype.setImage = function(src, width, height) {
  this.setContent('<img src="' + src + '" width="' + width + '" height="' + height + '">');
};


/** @inheritDoc */
bru.ui.Lightbox.prototype.setVisible = function(visible) {
  bru.ui.Lightbox.superClass_.setVisible.call(this, visible);

  if (this.anchor_ && visible) {
    this.anchor_.style.visibility = 'hidden';
  }
};

/** @inheritDoc */
bru.ui.Lightbox.prototype.onShow = function() {
  this.getHandler().
      listen(this.getDomHelper().getDocument(), goog.events.EventType.CLICK,
          goog.bind(this.setVisible, this, false));

  bru.ui.Lightbox.superClass_.onShow.call(this);
};


/** @inheritDoc */
bru.ui.Lightbox.prototype.onHide = function() {
  if (this.anchor_) {
    this.anchor_.style.visibility = 'visible';
  }

  bru.ui.Lightbox.superClass_.onHide.call(this);
};


/** @inheritDoc */
bru.ui.Lightbox.prototype.setVisibleInit = function(visible) {
  if (!this.anchor_) {
    bru.ui.Lightbox.superClass_.setVisibleInit.call(this, visible);
    return;
  }

  //var viewSize = goog.dom.getViewportSize(window);

  var doc = this.getDomHelper().getDocument();
  var x = 0;
  var y = 0;
  if (goog.style.getComputedPosition(this.getElement()) == 'fixed') {
    var scroll = this.getDomHelper().getDocumentScroll();
    x = -scroll.x;
    y = -scroll.y;
  }

  var anchorPos = goog.style.getPageOffset(this.anchor_);
  var anchorSize = goog.style.getSize(this.anchor_);

  var pos = goog.style.getPageOffset(this.getElement());
  var size = goog.style.getSize(this.getElement());

  var start = [x + anchorPos.x - this.margin_, y + anchorPos.y - this.margin_,
      anchorSize.width, anchorSize.height];
  var end = [x + pos.x, y + pos.y, size.width - 2 * this.margin_, size.height - 2 * this.margin_];

  var transition = new goog.fx.Animation(
      visible ? start : end,
      visible ? end : start,
      bru.ui.Dialog.TRANSITION_DURATION * 1000,
      visible ? goog.fx.easing.easeOut : goog.fx.easing.easeIn);

  var events = [goog.fx.Transition.EventType.BEGIN,
      goog.fx.Animation.EventType.ANIMATE,
      goog.fx.Transition.EventType.END];
  this.getHandler()
      .listen(transition, events, this.onAnimate);

  if (visible) {
    this.showTransition_ = transition;
  } else {
    this.hideTransition_ = transition;
  }
};


/** @inheritDoc */
bru.ui.Lightbox.prototype.onAnimate = function(e) {
  this.getElement().style.left = Math.round(e.x) + 'px';
  this.getElement().style.top = Math.round(e.y) + 'px';
  this.contentEl_.firstChild.style.width = Math.round(e.z) + 'px';
  this.contentEl_.firstChild.style.height = Math.round(e.coords[3]) + 'px';
};
