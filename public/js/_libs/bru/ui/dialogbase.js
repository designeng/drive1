goog.provide('bru.ui.DialogBase');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.fx.Transition');
goog.require('goog.ui.ModalPopup');
goog.require('goog.ui.PopupBase');


/**
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link
 *     goog.ui.Component} for semantics.
 * @extends {goog.ui.ModalPopup}
 */
bru.ui.DialogBase = function(opt_domHelper) {
  goog.ui.ModalPopup.call(this, false, opt_domHelper);

};
goog.inherits(bru.ui.DialogBase, goog.ui.ModalPopup);


/**
 * @type {string}
 * @private
 */
bru.ui.DialogBase.prototype.class_ = goog.getCssName('dialog');


/**
 * Dialog's content (HTML).
 * @type {string}
 * @private
 */
bru.ui.DialogBase.prototype.content_ = '';


/**
 * Element for the content area.
 * @type {Element}
 * @private
 */
bru.ui.DialogBase.prototype.contentEl_ = null;


/**
 * Transition to play on showing the dialog.
 * @type {goog.fx.Transition|undefined}
 * @private
 */
bru.ui.DialogBase.prototype.showTransition_;


/**
 * Transition to play on hiding the dialog.
 * @type {goog.fx.Transition|undefined}
 * @private
 */
bru.ui.DialogBase.prototype.hideTransition_;


/**
 * Transition to play on showing the dialog background.
 * @type {goog.fx.Transition|undefined}
 * @private
 */
bru.ui.DialogBase.prototype.showBgTransition_;


/**
 * Transition to play on hiding the dialog background.
 * @type {goog.fx.Transition|undefined}
 * @private
 */
bru.ui.DialogBase.prototype.hideBgTransition_;


/** @inheritDoc */
bru.ui.DialogBase.prototype.getCssClass = function() {
  return this.class_;
};


/**
 * @param {string} className
 */
bru.ui.DialogBase.prototype.setCssClass = function(className) {
  this.class_ = className;
};


/**
 * Allows arbitrary HTML to be set in the content element.
 * @param {string} html Content HTML.
 */
bru.ui.DialogBase.prototype.setContent = function(html) {
  this.content_ = html;
  if (this.contentEl_) {
    this.contentEl_.innerHTML = html;
  }
};


/**
 * Gets the content HTML of the content element.
 * @return {string} Content HTML.
 */
bru.ui.DialogBase.prototype.getContent = function() {
  return this.content_;
};


/**
 * Returns the content element so that more complicated things can be done with
 * the content area.  Renders if the DOM is not yet created.  Overrides
 * {@link goog.ui.Component#getContentElement}.
 * @return {Element} The content element.
 */
bru.ui.DialogBase.prototype.getContentElement = function() {
  return this.contentEl_;
};


/**
 * Sets transition animation on showing and hiding the dialog.
 * @param {goog.fx.Transition=} opt_showTransition Transition to play on
 *     showing the dialog.
 * @param {goog.fx.Transition=} opt_hideTransition Transition to play on
 *     hiding the dialog.
 */
bru.ui.DialogBase.prototype.setTransition = function(
    opt_showTransition, opt_hideTransition) {
  this.showTransition_ = opt_showTransition;
  this.hideTransition_ = opt_hideTransition;
};


/**
 * Sets transition animation on showing and hiding the dialog background.
 * @param {goog.fx.Transition=} opt_showTransition Transition to play on
 *     showing the dialog background.
 * @param {goog.fx.Transition=} opt_hideTransition Transition to play on
 *     hiding the dialog background.
 */
bru.ui.DialogBase.prototype.setBgTransition = function(
    opt_showTransition, opt_hideTransition) {
  this.showBgTransition_ = opt_showTransition;
  this.hideBgTransition_ = opt_hideTransition;
};


/** @inheritDoc */
bru.ui.DialogBase.prototype.createDom = function() {
  // Create the modal popup element, and make sure it's hidden.
  goog.base(this, 'createDom');
  var element = this.getElement();
  goog.asserts.assert(element, 'getElement() returns null');

  // Убраем фокусную рамку в IE7.
  element.hideFocus = true;

  var dom = this.getDomHelper();
  goog.dom.append(element,
      this.closeEl_ = dom.createDom('div',
          goog.getCssName(this.class_, 'close')),
      this.contentEl_ = dom.createDom('div',
          goog.getCssName(this.class_, 'content')));
  this.closeEl_.title = 'Закрыть (Esc)';

  if (this.content_) {
    this.contentEl_.innerHTML = this.content_;
  }
};


/** @inheritDoc */
bru.ui.DialogBase.prototype.decorateInternal = function(element) {
  // Decorate the modal popup area element.
  goog.base(this, 'decorateInternal', element);

  // Убраем фокусную рамку в IE7.
  element.hideFocus = true;

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
};


/** @inheritDoc */
bru.ui.DialogBase.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.setVisiblePopupElement_(false);

  this.getHandler().listen(
      this.closeEl_, goog.events.EventType.CLICK,
      this.onCloseClick_);
};


/** @inheritDoc */
bru.ui.DialogBase.prototype.disposeInternal = function() {
  this.closeEl_ = null;
  this.contentEl_ = null;

  goog.dispose(this.showTransition_);
  goog.dispose(this.showBgTransition_);
  goog.dispose(this.hideTransition_);
  goog.dispose(this.hideBgTransition_);

  goog.base(this, 'disposeInternal');
};


/**
 * Handles a click on the close area.
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
bru.ui.DialogBase.prototype.onCloseClick_ = function(e) {
  this.setVisible(false);
};


/**
 * Handles keydown and keypress events, and dismisses the popup if cancel is
 * pressed.
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
bru.ui.DialogBase.prototype.onKey_ = function(e) {
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

  if (close) {
    e.stopPropagation();
    e.preventDefault();
  }

  if (close) {
    this.setVisible(false);
  }
};


/** @inheritDoc */
bru.ui.DialogBase.prototype.setVisible = function(visible) {
  goog.asserts.assert(
      this.isInDocument(), 'ModalPopup must be rendered first.');
  if (visible == this.visible_) {
    return;
  }

  if (visible) {
    if (this.hideTransition_) {
      this.hideTransition_.stop();
    }
    this.show_();
  } else {
    if (this.showTransition_) {
      this.showTransition_.stop();
    }
    this.hide_();
  }
};


/**
 * @param {boolean} visible
 * @protected
 */
bru.ui.DialogBase.prototype.setVisibleInit = goog.nullFunction;


/**
 * Shows the popup.
 * @private
 */
bru.ui.DialogBase.prototype.show_ = function() {
  if (!this.dispatchEvent(goog.ui.PopupBase.EventType.BEFORE_SHOW)) {
    return;
  }

  this.resizeBackground_();
  this.reposition();

  // Listen for keyboard and resize events while the modal popup is visible.
  this.getHandler().listen(
      this.getDomHelper().getWindow(), goog.events.EventType.RESIZE,
      this.resizeBackground_);

  this.showPopupElement_(true);

  this.setVisibleInit(true);

  this.setVisiblePopupElement_(true);
  this.visible_ = true;

  // If there is transition to play, we play it and fire SHOW event after
  // the transition is over.
  if (this.showTransition_) {
    goog.events.listenOnce(
        /** @type {goog.events.EventTarget} */ (this.showTransition_),
        goog.fx.Transition.EventType.END, this.onShow, false, this);
    this.showTransition_.play();
    if (this.showBgTransition_) {
      this.showBgTransition_.play();
    }
  } else {
    this.onShow();
  }
};


/**
 * Hides the popup.
 * @private
 */
bru.ui.DialogBase.prototype.hide_ = function() {
  if (!this.dispatchEvent(goog.ui.PopupBase.EventType.BEFORE_HIDE)) {
    return;
  }

  // Stop listening for keyboard and resize events while the modal
  // popup is hidden.
  this.getHandler().removeAll();

  this.setVisibleInit(false);

  this.visible_ = false;

  // If there is transition to play, we play it and only hide the element
  // (and fire HIDE event) after the transition is over.
  if (this.hideTransition_) {
    goog.events.listenOnce(
        /** @type {goog.events.EventTarget} */ (this.hideTransition_),
        goog.fx.Transition.EventType.END, this.onHide, false, this);
    this.hideTransition_.play();
    if (this.hideBgTransition_) {
      this.hideBgTransition_.play();
    }
  } else {
    this.onHide();
  }
};


/**
 * Called after the dialog is shown. Derived classes can override to hook this
 * event but should make sure to call the parent class method.
 * @protected
 */
bru.ui.DialogBase.prototype.onShow = function() {
  // В новом хроме все скролится вверх :/
  //this.focus();
  this.getHandler().
    listen(this.getElement(), goog.events.EventType.KEYDOWN, this.onKey_);
  this.dispatchEvent(goog.ui.PopupBase.EventType.SHOW);
};


/**
 * Called after the dialog is hidden. Derived classes can override to hook this
 * event but should make sure to call the parent class method.
 * @protected
 */
bru.ui.DialogBase.prototype.onHide = function() {
  //this.setVisiblePopupElement_(false);
  //this.showPopupElement_(false);
  this.dispatchEvent(goog.ui.PopupBase.EventType.HIDE);
  this.dispose();
};


/**
 * @param {boolean} visible Shows the popup element if true, hides if false.
 * @private
 */
bru.ui.DialogBase.prototype.setVisiblePopupElement_ = function(visible) {
  var visibility = visible ? 'visible' : 'hidden';
  if (this.bgIframeEl_) {
    this.bgIframeEl_.style.visibility = visibility;
  }
  if (this.bgEl_) {
    this.bgEl_.style.visibility = visibility;
  }
  this.getElement().style.visibility = visibility;
};
