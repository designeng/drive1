goog.provide('bru.ui.Lightbox2');

goog.require('bru.ui.Dialog2');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events.EventType');
goog.require('goog.math.Size');
goog.require('goog.style');



/**
 * @constructor
 * @param {Element=} opt_anchor Элемент от которого будет "раскрываться" lightbox.
 * @param {boolean=} opt_useIframeMask Work around windowed controls z-index
 *     issue by using an iframe instead of a div for bg element.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper
 * @extends {bru.ui.Dialog2}
 */
bru.ui.Lightbox2 = function(opt_anchor, opt_useIframeMask, opt_domHelper) {
  goog.base(this, opt_anchor, opt_useIframeMask, opt_domHelper);
};
goog.inherits(bru.ui.Lightbox2, bru.ui.Dialog2);


/** @override */
bru.ui.Lightbox2.prototype.backgroundMaxOpacity_ = 0.9;


/** @override */
bru.ui.Lightbox2.prototype.allowChangeOpacity_ = false;

/**
 * @type {number}
 * @private
 */
bru.ui.Lightbox2.prototype.maxWidth_ = 960;


/**
 * @type {number}
 * @private
 */
bru.ui.Lightbox2.prototype.margin_ = 0;


/**
 * @type {string}
 * @private
 */
bru.ui.Lightbox2.prototype.linkText_;


/**
 * @param {number} width
 */
bru.ui.Lightbox2.prototype.setMaxWidth = function(width) {
  this.maxWidth_ = width;
};


/**
 * @param {number} margin
 */
bru.ui.Lightbox2.prototype.setMargin = function(margin) {
  this.margin_ = margin;
};


/**
 * @param {string} text
 */
bru.ui.Lightbox2.prototype.setLinkText = function(text) {
  this.linkText_ = text;
};


/**
 * Вычислаем размер прямоугольника, который может нормально
 * поместиться в текущее окно.
 * @param {goog.math.Size} size
 * @param {goog.math.Size=} opt_viewportSize
 * @return {goog.math.Size}
 * @private
 */
bru.ui.Lightbox2.prototype.getSize_ = function(size, opt_viewportSize) {
  var viewportSize = opt_viewportSize ?
      opt_viewportSize.clone() : goog.dom.getViewportSize();
  viewportSize.width = Math.min(this.maxWidth_, viewportSize.width);
  viewportSize.height -= 46;
  return size.scaleToFit(viewportSize).round();
};


/** @inheritDoc */
bru.ui.Lightbox2.prototype.setVisible = function(visible) {
  goog.asserts.assert(this.anchor_, 'Undefined anchor.');

  if (visible) {
    var pic = this.anchor_.getElementsByTagName('IMG');
    if (!pic.length) {
      return;
    }
    pic = pic[0];

    var content = bru.ui.Lightbox2.getHtml_(pic.src, true) +
        bru.ui.Lightbox2.getHtml_(pic.src) +
        bru.ui.Lightbox2.getHtml_(this.anchor_.href);
    if (this.linkText_) {
      content += '<a href="' + this.anchor_.href + '" target="_black" class="' +
      goog.getCssName('dialog-lightbox-link') + '">' + this.linkText_ + '</a>';
    }
    this.setContent(content);
    goog.style.setSize(this.element_,
        this.getSize_(new goog.math.Size(pic.offsetWidth, pic.offsetHeight)));
    goog.dom.classlist.add(this.element_, goog.getCssName('dialog-lightbox'));
  }

  goog.base(this, 'setVisible', visible);
};


/**
 * Helper
 * @param {string} url
 * @param {boolean=} opt_first
 * @return {string}
 * @private
 */
bru.ui.Lightbox2.getHtml_ = function(url, opt_first) {
  return '<div class="dialog-lightbox-pic' +
      (opt_first ? ' dialog-lightbox-pic-lowres' : '') +
      '"><img src="' + url + '" width="100%"></div>';
};


/** @inheritDoc */
bru.ui.Lightbox2.prototype.onShow = function() {
  goog.base(this, 'onShow');

  this.getHandler()
      .listen(goog.dom.getOwnerDocument(this.element_),
      [goog.events.EventType.MOUSEDOWN, goog.events.EventType.TOUCHSTART],
      this.onCloseClick_, true);
};
