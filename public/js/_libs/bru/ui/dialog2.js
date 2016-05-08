goog.provide('bru.ui.Dialog2');

goog.require('bru.i18n.Dialog2');
goog.require('bru.style.css3.transform');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.fx.Animation');
goog.require('goog.fx.Transition');
goog.require('goog.fx.css3.Transition');
goog.require('goog.fx.easing');
goog.require('goog.reflect');
goog.require('goog.style');
goog.require('goog.style.transition');
goog.require('goog.ui.ModalPopup');
goog.require('goog.ui.PopupBase');
goog.require('goog.userAgent');



/**
 * @constructor
 * @param {Element=} opt_anchor Элемент от которого будет "раскрываться" диалог.
 * @param {boolean=} opt_useIframeMask Work around windowed controls z-index
 *     issue by using an iframe instead of a div for bg element.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper
 * @extends {goog.ui.ModalPopup}
 */
bru.ui.Dialog2 = function(opt_anchor, opt_useIframeMask, opt_domHelper) {
  goog.ui.ModalPopup.call(this, opt_useIframeMask, opt_domHelper);

  /**
   * @type {Element}
   * @private
   */
  this.anchor_ = opt_anchor || null;
};
goog.inherits(bru.ui.Dialog2, goog.ui.ModalPopup);


/**
 * Anchor element.
 * @type {Element}
 * @private
 */
bru.ui.Dialog2.prototype.anchor_ = null;

/**
 * Dialog's content (HTML).
 * @type {string}
 * @private
 */
bru.ui.Dialog2.prototype.content_ = '';


/**
 * Element for the content area.
 * @type {Element}
 * @private
 */
bru.ui.Dialog2.prototype.contentEl_ = null;


/**
 * @type {string}
 * @private
 */
bru.ui.Dialog2.prototype.class_ = goog.getCssName('dialog');


/**
 * Duration of open/close animation, in seconds.
 * @type {number}
 */
bru.ui.Dialog2.TRANSITION_DURATION = 0.3;


/**
 * Прозрачность подложки при открытом окне.
 * @type {number}
 * @private
 */
bru.ui.Dialog2.prototype.backgroundMaxOpacity_ = 0.8;


/**
 * Менять ли прозрачность при анимации.
 * @type {boolean}
 * @private
 */
bru.ui.Dialog2.prototype.allowChangeOpacity_ = true;


/** @inheritDoc */
bru.ui.Dialog2.prototype.getCssClass = function() {
  return this.class_;
};


/**
 * @param {string} className
 */
bru.ui.Dialog2.prototype.setCssClass = function(className) {
  this.class_ = className;
};


/**
 * @param {boolean} b
 */
bru.ui.Dialog2.prototype.setAllowChangeOpacity = function(b) {
  this.allowChangeOpacity_ = b;
};


/**
 * @return {boolean}
 */
bru.ui.Dialog2.prototype.getAllowChangeOpacity = function() {
  return this.allowChangeOpacity_;
};


/**
 * @param {Element} anchor
 */
bru.ui.Dialog2.prototype.setAnchor = function(anchor) {
  this.anchor_ = anchor;
};


/**
 * @return {Element}
 */
bru.ui.Dialog2.prototype.getAnchor = function() {
  return this.anchor_;
};


/**
 * Allows arbitrary HTML to be set in the content element.
 * @param {string} html Content HTML.
 */
bru.ui.Dialog2.prototype.setContent = function(html) {
  this.content_ = html;
  if (this.contentEl_) {
    this.contentEl_.innerHTML = html;
  }
};


/**
 * Gets the content HTML of the content element.
 * @return {string} Content HTML.
 */
bru.ui.Dialog2.prototype.getContent = function() {
  return this.content_;
};


/**
 * @return {Element} The content element.
 */
bru.ui.Dialog2.prototype.getContentElement = function() {
  return this.contentEl_;
};


/** @inheritDoc */
bru.ui.Dialog2.prototype.createDom = function() {
  goog.base(this, 'createDom');

  goog.asserts.assert(this.element_, 'Undefined this.element_.');

  goog.dom.append(this.element_,
      this.closeEl_ = this.getDomHelper().createDom('div',
          goog.getCssName(this.class_, 'close')),
      this.contentEl_ = this.getDomHelper().createDom('div',
          goog.getCssName(this.class_, 'content')));
  this.closeEl_.title = bru.i18n.Dialog2.CLOSE_BUTTON;

  // Убраем фокусную рамку в IE7.
  //if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('8')) {
  //  this.getElement().hideFocus = true;
  //}

  if (this.content_) {
    this.contentEl_.innerHTML = this.content_;
  }
};


/** @inheritDoc */
bru.ui.Dialog2.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);

  // Убраем фокусную рамку в IE7.
  //if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('8')) {
  //  element.hideFocus = true;
  //}

  var dom = this.getDomHelper();

  var closeClass = goog.getCssName(this.class_, 'close');
  this.closeEl_ = goog.dom.getElementByClass(closeClass, element);
  if (!this.closeEl_) {
    this.closeEl_ = dom.createDom('div', closeClass);
    element.appendChild(this.closeEl_);
  }

  // Decorate or create the content element.
  var contentClass = goog.getCssName(this.class_, 'content');
  this.contentEl_ = goog.dom.getElementByClass(contentClass, element);
  if (this.contentEl_) {
    this.content_ = this.contentEl_.innerHTML;
  } else {
    this.contentEl_ = dom.createDom('div', contentClass);
    if (this.content_) {
      this.contentEl_.innerHTML = this.content_;
    }
    element.appendChild(this.contentEl_);
  }

  // IE7,8 PIE class.
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher(9)) {
    goog.dom.classlist.add(this.element_, 'dialog-pie');
  }

};


/** @inheritDoc */
bru.ui.Dialog2.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.setVisiblePopupElement_(false);
  this.getHandler().listen(
      this.closeEl_, goog.events.EventType.CLICK,
      this.onCloseClick_);
};


/** @inheritDoc */
bru.ui.Dialog2.prototype.disposeInternal = function() {
  this.closeEl_ = null;
  this.contentEl_ = null;
  this.anchor_ = null;

  goog.base(this, 'disposeInternal');
};


/**
 * Handles a click on the close area.
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
bru.ui.Dialog2.prototype.onCloseClick_ = function(e) {
  // preventDefault() чтобы при закрывании окна
  // не срабатывали ссылки на том месте, где ты кликнул.
  e.preventDefault();
  this.setVisible(false);
};


/**
 * Handles keydown and keypress events, and dismisses the popup if cancel is
 * pressed.
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
bru.ui.Dialog2.prototype.onKey_ = function(e) {
  var close = false;
  var hasHandler = false;
  var target = e.target;

  if (e.type == goog.events.EventType.KEYDOWN) {
    // Escape and Tab can only properly be handled in keydown handlers.
    if (e.keyCode == goog.events.KeyCodes.ESC) {
      // Users may expect to hit escape on a SELECT element.
      var isSpecialFormElement =
          target.tagName == 'SELECT' && !target.disabled;

      if (!isSpecialFormElement) {
        close = true;
      }
    } else if (e.keyCode == goog.events.KeyCodes.TAB && e.shiftKey &&
        target == this.getElement()) {
      // Prevent the user from shift-tabbing backwards out of the dialog box.
      // TODO(user): Instead, we should move the focus to the last tabbable
      // element inside the dialog.
      hasHandler = true;
    }
  }

  if (close || hasHandler) {
    e.stopPropagation();
    e.preventDefault();
  }

  if (close) {
    this.setVisible(false);
  }
};


/**
 * @param {boolean} visible
 * @protected
 */
bru.ui.Dialog2.prototype.setVisibleInit = function(visible) {
  goog.asserts.assert(this.anchor_, 'Undefined anchor.');

  var doc = this.getDomHelper().getDocument();
  var x = 0;
  var y = 0;
  if (goog.style.getComputedPosition(this.getElement()) == 'fixed') {
    var scroll = this.getDomHelper().getDocumentScroll();
    x = -scroll.x;
    y = -scroll.y;
  }

  var anchorPos = goog.style.getPageOffset(this.anchor_);
  // Если anchor уже не находится в документе и у нас есть
  // его закэшированные координаты, то используем их.
  if (this.anchorPos_ && !goog.dom.contains(document, this.anchor_)) {
    anchorPos = this.anchorPos_;
  }
  this.anchorPos_ = anchorPos;

  var anchorSize = goog.style.getSize(this.anchor_);

  var pos = goog.style.getPageOffset(this.getElement());
  var size = goog.style.getSize(this.getElement());

  var transition;
  var bgTransition;

  // Форсируем включение 3D режима в вебките.
  var webkit3dEnable =
      'WebKitCSSMatrix' in window && 'm42' in new WebKitCSSMatrix('') ?
      'translate3d(0,0,0) ' : '';

  if (goog.style.transition.isSupported()) {
    var timing = 'ease-out';
    var initialStyle = {};
    var finalStyle = {};
    if (this.allowChangeOpacity_) {
      initialStyle.opacity = visible ? 0 : 1;
      finalStyle.opacity = visible ? 1 : 0;
    }
    var scale = anchorSize.width / size.width;
    var translateX = anchorPos.x - pos.x;
    var translateY = anchorPos.y - pos.y;
    var transform = webkit3dEnable + 'translate(' + translateX + 'px,' + translateY + 'px) scale(' + scale + ')';
    initialStyle[bru.style.css3.transform.getProperty()] =
        visible ? transform : '';
    finalStyle[bru.style.css3.transform.getProperty()] =
        visible ? '' : transform;
    transition = new goog.fx.css3.Transition(this.getElement(),
        bru.ui.Dialog2.TRANSITION_DURATION,
        initialStyle,
        finalStyle,
        'all ' + bru.ui.Dialog2.TRANSITION_DURATION + 's ' + timing);
    bgTransition = new goog.fx.css3.Transition(this.bgEl_,
        bru.ui.Dialog2.TRANSITION_DURATION,
        {opacity: visible ? 0.001 : this.backgroundMaxOpacity_},
        {opacity: visible ? this.backgroundMaxOpacity_ : 0},
        'opacity ' + bru.ui.Dialog2.TRANSITION_DURATION + 's ' + timing);
  } else {
    var start = [x + anchorPos.x, y + anchorPos.y,
        anchorSize.width, anchorSize.height, 0];
    var end = [x + pos.x, y + pos.y, size.width, size.height, 1];
    transition = new goog.fx.Animation(
        visible ? start : end,
        visible ? end : start,
        bru.ui.Dialog2.TRANSITION_DURATION * 1000,
        goog.fx.easing.easeOut);
    if (this.allowChangeOpacity_) {
      this.getHandler()
          .listen(transition, goog.fx.Transition.EventType.BEGIN, this.onAnimationBegin);
    }
    this.getHandler()
        .listen(transition, goog.fx.Animation.EventType.ANIMATE, this.onAnimate);
    // Если закрываем диалог, то не нужно показывать контент в конце анимации.
    if (visible && this.allowChangeOpacity_) {
      this.getHandler()
          .listen(transition, goog.fx.Transition.EventType.END, this.onAnimationEnd);
    }
  }

  if (visible) {
    this.popupShowTransition_ = /** @type {goog.fx.Transition} */ (transition);
    this.bgShowTransition_ = /** @type {goog.fx.Transition} */ (bgTransition);
  } else {
    this.popupHideTransition_ = /** @type {goog.fx.Transition} */ (transition);
    this.bgHideTransition_ = /** @type {goog.fx.Transition} */ (bgTransition);
  }
};


/**
 * Shows the popup.
 * @private
 */
bru.ui.Dialog2.prototype.show_ = function() {
  if (!this.dispatchEvent(goog.ui.PopupBase.EventType.BEFORE_SHOW)) {
    return;
  }

  this.setDocumentPinned_(true);
  this.resizeBackground_();
  this.reposition();

  // Listen for keyboard and resize events while the modal popup is visible.
  this.getHandler().listen(
      this.getDomHelper().getWindow(), goog.events.EventType.RESIZE,
      this.resizeBackground_);

  this.showPopupElement_(true);
  this.setVisibleInit(true);
  this.visible_ = true;

  if (this.popupShowTransition_) {
    goog.events.listenOnce(
        /** @type {goog.events.EventTarget} */ (this.popupShowTransition_),
        goog.fx.Transition.EventType.END, this.onShow, false, this);
    if (this.bgShowTransition_) {
      this.bgShowTransition_.play();
    }
    this.popupShowTransition_.play();
  } else {
    this.onShow();
  }

  // Рефлоу помогает показывать анимацию полупрозрачного фона.
  if (this.bgEl_) {
    goog.reflect.sinkValue(this.bgEl_.offsetHeight);
  }

  // Показываем все элементы только после начала анимации.
  this.setVisiblePopupElement_(true);
};


/**
 * Hides the popup.
 * @private
 */
bru.ui.Dialog2.prototype.hide_ = function() {
  if (!this.dispatchEvent(goog.ui.PopupBase.EventType.BEFORE_HIDE)) {
    return;
  }

  // Stop listening for keyboard and resize events while the modal
  // popup is hidden.
  this.getHandler().removeAll();

  this.setVisibleInit(false);

  // Set visibility to hidden even if there is a transition. This
  // reduces complexity in subclasses who may want to override
  // setVisible (such as goog.ui.Dialog).
  this.visible_ = false;

  goog.dom.classlist.remove(this.getElement(), goog.getCssName(this.class_, 'visible'));

  if (this.popupHideTransition_) {
    goog.events.listenOnce(
        /** @type {goog.events.EventTarget} */ (this.popupHideTransition_),
        goog.fx.Transition.EventType.END, this.onHide, false, this);
    if (this.bgHideTransition_) {
      this.bgHideTransition_.play();
    }
    // The transition whose END event you are listening to must be played last
    // to prevent errors when disposing on hide event, which occur on browsers
    // that do not support CSS3 transitions.
    this.popupHideTransition_.play();
  } else {
    this.onHide();
  }
};

/**
 * Заглушка для переопределения.
 * @param {goog.math.Size} size
 * @param {goog.math.Size=} opt_viewportSize
 * @return {goog.math.Size}
 * @private
 */
bru.ui.Dialog2.prototype.getSize_ = function(size, opt_viewportSize) {
  return size;
};


/**
 * @param {boolean} b
 * @private
 */
bru.ui.Dialog2.prototype.setDocumentPinned_ = function(b) {
  this.scrollbarWidth_ = this.scrollbarWidth_ || goog.style.getScrollbarWidth();
  document.body.style.marginRight = b ? this.scrollbarWidth_ + 'px' : '0';
  document.documentElement.style.overflowY = b ? 'hidden' : '';
};


/**
 * @param {boolean} visible Shows the popup element if true, hides if false.
 * @private
 */
bru.ui.Dialog2.prototype.setVisiblePopupElement_ = function(visible) {
  var visibility = visible ? 'visible' : 'hidden';
  if (this.bgIframeEl_) {
    this.bgIframeEl_.style.visibility = visibility;
  }
  if (this.bgEl_) {
    this.bgEl_.style.visibility = visibility;
  }
  this.getElement().style.visibility = visibility;
};


/**
 * Called after the dialog is shown. Derived classes can override to hook this
 * event but should make sure to call the parent class method.
 * @protected
 */
bru.ui.Dialog2.prototype.onShow = function() {
  // В Хроме фокус на элемент с трансформом приводит к скролу стриницы в начало.
  bru.style.css3.transform.removeAll(this.getElement());
  this.focus();

  goog.dom.classlist.add(this.getElement(), goog.getCssName(this.class_, 'visible'));

  // Автофокус.
  var tags = ['TEXTAREA', 'INPUT'];
  for (var j = 0, tag; tag = tags[j]; j++) {
    var els = this.contentEl_.getElementsByTagName(tag);
    for (var i = 0, el; el = els[i]; i++) {
      if (el.hasAttribute('data-autofocus')) {
        el.focus();
        break;
      }
    }
  }

  this.vsm_ = this.vsm_ || goog.dom.ViewportSizeMonitor.getInstanceForWindow();
  this.getHandler()
      .listen(this.vsm_, goog.events.EventType.RESIZE, this.onResize_)
      .listen(document, goog.events.EventType.KEYDOWN, this.onKey_);
  this.dispatchEvent(goog.ui.PopupBase.EventType.SHOW);
};


/**
 * Called after the dialog is hidden. Derived classes can override to hook this
 * event but should make sure to call the parent class method.
 * @protected
 */
bru.ui.Dialog2.prototype.onHide = function() {
  this.setDocumentPinned_(false);
  this.dispatchEvent(goog.ui.PopupBase.EventType.HIDE);
  this.dispose();
};


/** @override */
bru.ui.Dialog2.prototype.reposition = function() {
  this.scrollbarWidth_ = this.scrollbarWidth_ || goog.style.getScrollbarWidth();

  var doc = this.getDomHelper().getDocument();
  var win = goog.dom.getWindow(doc) || window;
  if (goog.style.getComputedPosition(this.getElement()) == 'fixed') {
    var x = 0;
    var y = 0;
  } else {
    var scroll = this.getDomHelper().getDocumentScroll();
    var x = scroll.x;
    var y = scroll.y;
  }

  var popupSize = goog.style.getSize(this.getElement());
  var viewSize = goog.dom.getViewportSize(win);

  // Make sure left and top are non-negatives.
  var left = Math.max(x + viewSize.width / 2 - this.scrollbarWidth_ / 2 - popupSize.width / 2, 0);
  var top = Math.max(y + viewSize.height / 2 - popupSize.height / 2, 0);
  goog.style.setPosition(this.getElement(), left, top);

  // We place the tab catcher at the same position as the dialog to
  // prevent IE from scrolling when users try to tab out of the dialog.
  goog.style.setPosition(this.tabCatcherElement_, left, top);
};


/**
 * @param {goog.events.Event} e The event.
 * @protected
 */
bru.ui.Dialog2.prototype.onAnimationBegin = function(e) {
  goog.style.setElementShown(this.contentEl_, false);
  goog.style.setElementShown(this.closeEl_, false);
  this.onAnimate(e);
};


/**
 * @param {goog.events.Event} e The event.
 * @protected
 */
bru.ui.Dialog2.prototype.onAnimationEnd = function(e) {
  goog.style.setElementShown(this.contentEl_, true);
  goog.style.setElementShown(this.closeEl_, true);
  this.onAnimate(e);
};


/**
 * @param {goog.events.Event} e The event.
 * @protected
 */
bru.ui.Dialog2.prototype.onAnimate = function(e) {
  if (this.bgEl_) {
    goog.style.setOpacity(this.bgEl_, e.coords[4] *
        this.backgroundMaxOpacity_);
  }

  this.getElement().style.left = Math.round(e.x) + 'px';
  this.getElement().style.top = Math.round(e.y) + 'px';
  this.getElement().style.width = Math.round(e.z) + 'px';
  this.getElement().style.height = Math.round(e.coords[3]) + 'px';
  if (this.allowChangeOpacity_) {
    goog.style.setOpacity(this.getElement(), e.coords[4]);
  }
};


/**
 * @param {goog.events.BrowserEvent=} e Browser's event object.
 * @private
 */
bru.ui.Dialog2.prototype.onResize_ = function(e) {
  var viewportSize = this.vsm_.getSize();
  var popup = this.getElement();
  var size = this.getSize_(goog.style.getSize(popup), viewportSize);

  goog.style.setPosition(popup,
      Math.max(0, (viewportSize.width - size.width) / 2),
      Math.max(0, (viewportSize.height - size.height) / 2));
  goog.style.setSize(popup, size);
};


/** @override */
bru.ui.Dialog2.prototype.resizeBackground_ = function() {
};
