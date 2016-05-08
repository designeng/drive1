goog.provide('bru.ui.popup.Base');
goog.provide('bru.ui.popup.Event');
goog.provide('bru.ui.popup.EventType');

goog.require('bru.ui.popup.EventType');
goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.fx.Animation');
goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.fx.dom.Fade');
goog.require('goog.fx.dom.SlideResize');
goog.require('goog.fx.easing');
goog.require('goog.math.Rect');
goog.require('goog.math.Size');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.userAgent');


/**
 * @constructor
 * @param {Element=} opt_element "Прикрепленный" элемент. Его позиция будет
 *    использована как начальная для анимации открытия попапа.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link
 *    goog.ui.Component} for semantics.
 * @extends {goog.ui.Component}
 */
bru.ui.popup.Base = function(opt_element, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  if (opt_element) {
    this.pinnedEl_ = opt_element;
  }
};
goog.inherits(bru.ui.popup.Base, goog.ui.Component);


/**
 * className попапа
 * @type {string}
 * @private
 */
bru.ui.popup.Base.prototype.class_ = 'popup';


/**
 * Width of popup
 * @type {number|string}
 * @private
 */
bru.ui.popup.Base.prototype.width_ = 350;


/**
 * Height of popup
 * @type {number|string}
 * @private
 */
bru.ui.popup.Base.prototype.height_ = 'auto';


/**
 * className попапа.
 * @type {string}
 * @private
 */
bru.ui.popup.Base.prototype.content_ = '';


/**
 * Элемент рисующий тень. Div с box-shadow или таблица с png для IE < 9.
 * @type {Element}
 * @private
 */
bru.ui.popup.Base.prototype.shadowEl_ = null;


/**
 * Элемент к которому "прикреплен" попап.
 * @type {Element}
 * @private
 */
bru.ui.popup.Base.prototype.pinnedEl_ = null;


/**
 * Whether popup is visible.
 * @type {boolean}
 * @private
 */
bru.ui.popup.Base.prototype.visible_ = false;


/**
 * Анимировать ли элемент при показе попапа. Пригодиться если в элементе изображение.
 * @type {boolean}
 * @private
 */
bru.ui.popup.Base.prototype.liveAnimation_ = false;


/**
 * Дилельность анимации.
 * @type {number}
 * @private
 */
bru.ui.popup.Base.prototype.animationDuration_ = 250;


/**
 * Whether the popup should be disposed when it is hidden.
 * @type {boolean}
 * @private
 */
bru.ui.popup.Base.prototype.disposeOnHide_ = false;


/**
 * @type {boolean} legacyShadow
 * @private
 */
bru.ui.popup.Base.prototype.legacyShadow_ = goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9');

/**
 * Dialog event class.
 * @param {string} etype
 * @param {Element=} opt_el
 * @constructor
 * @extends {goog.events.Event}
 */
bru.ui.popup.Event = function(etype, opt_el) {
  this.type = etype;
  this.relatedTarget = opt_el;
};
goog.inherits(bru.ui.popup.Event, goog.events.Event);


/**
 * @param {number|string} width
 */
bru.ui.popup.Base.prototype.setWidth = function(width) {
  this.width_ = width;
};


/**
 * @param {number|string} height
 */
bru.ui.popup.Base.prototype.setHeight = function(height) {
  this.height_ = height;
};


/**
 * Устанавливает "прикрепленный" элемент
 * @param {string} html
 */
bru.ui.popup.Base.prototype.setContent = function(html) {
  this.content_ = html;
  if (this.contentEl_) {
    this.contentEl_.innerHTML = html;
  }
};


/**
 * Устанавливает "прикрепленный" элемент
 * @param {Element} element
 */
bru.ui.popup.Base.prototype.pinTo = function(element) {
  this.pinnedEl_ = element;
};


bru.ui.popup.Base.prototype.getPinned = function() {
  return this.pinnedEl_;
};


/**
 */
bru.ui.popup.Base.prototype.isVisible = function() {
  return this.visible_;
};


/**
 * Удалять ли попап после закрытия
 * @param {boolean} b
 */
bru.ui.popup.Base.prototype.setDisposeOnHide = function(b) {
  this.disposeOnHide_ = b;
};


/**
 * Gets the popup shadow.
 * @return {Element}
 */
bru.ui.popup.Base.prototype.getShadow = function() {
  return this.shadowEl_;
};


/**
 * Creates an initial DOM representation for the component.
 */
bru.ui.popup.Base.prototype.createDom = function() {
  this.createShadowDom();

  this.setElementInternal(
    this.getDomHelper().createDom('div', {'className': this.class_},
        this.contentEl_ = this.getDomHelper().createDom('div', {'className': goog.getCssName(this.class_, 'content')})
        )
  );

  if (this.content_) {
    this.contentEl_.innerHTML = this.content_;
  }

  goog.style.setElementShown(this.element_, false);
};


/**
 * Creates of the DOM for shadow elements.
 * @protected
 */
bru.ui.popup.Base.prototype.createShadowDom = function() {
  var dom = this.getDomHelper();

  // <table class="boxshadow"><tbody>
  //   <tr><td class="boxshadow-tl"></td><td class="boxshadow-tr"></td></tr>
  //   <tr><td class="boxshadow-bl"></td><td class="boxshadow-br"></td></tr>
  // </tbody></table>
  this.shadowEl_ = dom.createDom('table', {'className': goog.getCssName('boxshadow')},
      dom.createDom('tbody', null,
      dom.createDom('tr', null,
      dom.createDom('td', {'className': goog.getCssName('boxshadow-tl')}),
      dom.createDom('td', {'className': goog.getCssName('boxshadow-tr')})
      ),
      dom.createDom('tr', null,
      dom.createDom('td', {'className': goog.getCssName('boxshadow-bl')}),
      dom.createDom('td', {'className': goog.getCssName('boxshadow-br')})
      )
      )
      );
};


/**
 * @throws {goog.ui.Component.Error.ALREADY_RENDERED} If the component is
 *    already rendered.
 */
bru.ui.popup.Base.prototype.render = function() {
  if (this.isInDocument()) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }

  if (!this.getElement()) {
    this.createDom();
  }

  var parent = this.getDomHelper().getDocument().body;
  this.renderShadow(parent);

  bru.ui.popup.Base.superClass_.render.call(this, parent);
};


/**
 * Renders the shadoe elements.
 * @param {Element} parent Parent element; typically the document body.
 * @protected
 */
bru.ui.popup.Base.prototype.renderShadow = function(parent) {
  parent.appendChild(this.shadowEl_);
};


/**
 * Show/hide popup.
 * @param {boolean} visible
 * @param {boolean=} opt_forced
 */
bru.ui.popup.Base.prototype.setVisible = function(visible, opt_forced) {
  if (visible == this.visible_ && !opt_forced) {
    return;
  }

  // If the dialog hasn't been rendered yet, render it now.
  if (!this.isInDocument()) {
    this.render();
  }

  var duration = this.animationDuration_;
  var start;
  var opacity;

  if (!opt_forced && this.animationQueue_ && this.animationQueue_.getStateInternal() == goog.fx.Animation.State.PLAYING) {
    // Animation in progress
    duration = Math.round(this.animationQueue_.progress * duration);
    start = this.getShadowCoords_();
    opacity = this.fade_.coords[0];
  } else {
    // Start show/hide
    start = visible ? this.getPinCoords() : this.end_;
    opacity = visible ? 0 : 1;
  }
  this.end_ = visible ? this.getEndCoords() : this.getPinCoords();

  // Animation queue setup
  if (this.animationQueue_) {
    this.animationQueue_.dispose();
  }
  var acc = visible ? goog.fx.easing.easeIn : goog.fx.easing.easeOut;
  this.fade_ = new goog.fx.dom.Fade(this.shadowEl_, opacity, visible ? 1 : 0, duration, acc);
  this.animationQueue_ = new goog.fx.AnimationParallelQueue();
  if (this.liveAnimation_) {
    this.animationQueue_.add(this.getElementAnimation(start, this.end_, duration, acc));
  }
  this.animationQueue_.add(this.getShadowAnimation(start, this.end_, duration, acc));
  this.animationQueue_.add(this.fade_);
  this.addAdditionalAnimation(visible, opacity, start, this.end_, duration, acc);

  this.getHandler().listenOnce(this.animationQueue_, goog.fx.Animation.EventType.FINISH, this.onFinish_, false, this);

  // onStart
  if (visible) {
    this.getHandler().
      listen(this.getElement(), goog.events.EventType.MOUSEOVER, this.onMouse_, false, this).
      listen(this.getElement(), goog.events.EventType.MOUSEOUT, this.onMouse_, false, this);
  } else {
    this.getHandler().
      unlisten(this.getElement(), goog.events.EventType.MOUSEOVER, this.onMouse_, false, this).
      unlisten(this.getElement(), goog.events.EventType.MOUSEOUT, this.onMouse_, false, this);
  }
  this.manageShadowEventHandlers(visible);

  this.dispatchEvent(visible ? bru.ui.popup.EventType.SHOW_START : bru.ui.popup.EventType.HIDE_START);
  goog.style.setElementShown(this.getElement(), this.liveAnimation_);
  this.showShadow();
  this.animationQueue_.play();

  this.visible_ = visible;
};


/**
 * @protected
 */
bru.ui.popup.Base.prototype.showShadow = function() {
  goog.style.setElementShown(this.shadowEl_, true);
};


/**
 * @param {boolean} attach
 * @protected
 */
bru.ui.popup.Base.prototype.manageShadowEventHandlers = function(attach) {
  if (attach) {
    this.getHandler().
      listen(this.shadowEl_, goog.events.EventType.MOUSEOUT, this.onMouse_, false, this).
      listen(this.shadowEl_, goog.events.EventType.MOUSEOVER, this.onMouse_, false, this);
  } else {
    this.getHandler().
      unlisten(this.shadowEl_, goog.events.EventType.MOUSEOUT, this.onMouse_, false, this).
      unlisten(this.shadowEl_, goog.events.EventType.MOUSEOVER, this.onMouse_, false, this);
  }
};


/**
 * Handles finish animation.
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
bru.ui.popup.Base.prototype.onMouse_ = function(e) {
  if (e.relatedTarget && (goog.dom.contains(this.getElement(), e.relatedTarget) || goog.dom.contains(this.shadowEl_, e.relatedTarget))) {
    // Ignore internal mouse moves.
    return;
  }
  this.dispatchEvent(new bru.ui.popup.Event(e.type == goog.events.EventType.MOUSEOVER ? bru.ui.popup.EventType.MOUSEOVER : bru.ui.popup.EventType.MOUSEOUT, e.relatedTarget));
};


/**
 * Handles finish animation.
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
bru.ui.popup.Base.prototype.onFinish_ = function(e) {
  if (this.visible_) {
    // Show
    if (!this.liveAnimation_) {
      var el = this.getElement();
      goog.style.setPosition(el, this.end_.left, this.end_.top);
      goog.style.setSize(el, this.end_.width, this.end_.height);
      goog.style.setElementShown(el, true);
    }
  } else {
    // Hide
    goog.style.setElementShown(this.shadowEl_, false);
    goog.style.setElementShown(this.getElement(), false);
    if (this.disposeOnHide_) {
      this.dispose();
    }
  }
  this.dispatchEvent(this.visible_ ? bru.ui.popup.EventType.SHOW_END : bru.ui.popup.EventType.HIDE_END);
};


/**
 * @param {Object.<number>} start
 * @param {Object.<number>} end
 * @param {number} duration
 * @param {Function} acc
 * @return {!goog.fx.dom.SlideResize} Animation object.
 * @protected
 */
bru.ui.popup.Base.prototype.getElementAnimation = function(start, end, duration, acc) {
  return new goog.fx.dom.SlideResize(this.getElement(),
      [start.left, start.top, start.width, start.height],
      [end.left, end.top, end.width, end.height],
      duration, acc);
};


/**
 * @param {Object.<number>} start
 * @param {Object.<number>} end
 * @param {number} duration
 * @param {Function} acc
 * @return {!goog.fx.dom.SlideResize} Animation object.
 * @protected
 */
bru.ui.popup.Base.prototype.getShadowAnimation = function(start, end, duration, acc) {
  return new goog.fx.dom.SlideResize(this.shadowEl_,
      [start.left - 6, start.top - 6, start.width + 18, start.height + (this.legacyShadow_ ? 0 : 18)],
      [end.left - 6, end.top - 6, end.width + 18, end.height + (this.legacyShadow_ ? 0 : 18)],
      duration, acc);
};


/**
 * @param {boolean} visible
 * @param {number} opacity
 * @param {Object.<number>} start
 * @param {Object.<number>} end
 * @param {number} duration
 * @param {Function} acc
 * @protected
 */
bru.ui.popup.Base.prototype.addAdditionalAnimation = function(visible, opacity, start, end, duration, acc) {};


/**
 * @return {!goog.math.Rect} Pin coords.
 * @protected
 */
bru.ui.popup.Base.prototype.getPinCoords = function() {
  return goog.style.getBounds(this.pinnedEl_);
};


/**
 * @return {!goog.math.Rect} Current shadow coords.
 * @private
 */
bru.ui.popup.Base.prototype.getShadowCoords_ = function() {
  var coords = goog.style.getBounds(this.shadowEl_);
  coords.left = Math.round(coords.left + 6);
  coords.top = Math.round(coords.top + 6);
  coords.width = Math.round(coords.width - 18);
  coords.height = Math.round(coords.height - 18);
  return coords;
};


/**
 * Returns coordinates of opened popup.
 * @return {!goog.math.Rect} Bounding rectangle for the element.
 * @protected
 */
bru.ui.popup.Base.prototype.getEndCoords = function() {
  var doc = this.getDomHelper().getDocument();
  var win = goog.dom.getWindow(doc) || window;
  var scroll = this.getDomHelper().getDocumentScroll();
  var viewSize = goog.dom.getViewportSize(win);
  var size = this.getElementSize();

  return new goog.math.Rect(
      Math.max(scroll.x + (viewSize.width - size.width) >> 1, 0),
      Math.max(scroll.y + (viewSize.height - size.height) >> 1, 0),
      size.width,
      size.height
  );
};


/**
 * Returns size of element even if it hidden.
 * @return {!goog.math.Size} Object with width/height properties.
 * @protected
 */
bru.ui.popup.Base.prototype.getElementSize = function() {
  if (typeof this.height_ != 'number' || typeof this.width_ != 'number') {
    goog.style.setSize(this.getElement(), this.width_, this.height_);
    return goog.style.getSize(this.getElement());
  } else {
    return new goog.math.Size(this.width_, this.height_);
  }
};


/** @inheritDoc */
bru.ui.popup.Base.prototype.disposeInternal = function() {
  bru.ui.popup.Base.superClass_.disposeInternal.call(this);
  if (this.animationQueue_) {
    this.animationQueue_.dispose();
  }
  goog.dom.removeNode(this.shadowEl_);
  this.shadowEl_ = null;
};


/**
 * Events dispatched by popups.
 * @enum {string}
 */
bru.ui.popup.EventType = {
  MOUSEOVER: 'mouseover',
  MOUSEOUT: 'mouseout',
  SHOW_START: 'showstart',
  SHOW_END: 'showend',
  HIDE_START: 'hidestart',
  HIDE_END: 'hideend'
};
