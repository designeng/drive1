goog.provide('bru.events.OutsideHandler');
goog.provide('bru.events.OutsideHandler.EventType');

goog.require('goog.dom');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.userAgent');



/**
 * @param {Element} element
 * @param {boolean=} opt_hideOnEscape
 * @param {Array.<Element>=} opt_elements
 * @constructor
 * @extends {goog.events.EventTarget}
 */
bru.events.OutsideHandler = function(element, opt_hideOnEscape, opt_elements) {
  bru.events.OutsideHandler.base(this, 'constructor');

  /**
   * @type {Element}
   * @private
   */
  this.element_ = element;

  if (opt_elements) {
    /**
     * @type {Array.<Element>}
     * @private
     */
    this.elements_ = opt_elements;
  }

  /**
   * @type {boolean}
   * @private
   */
  this.hideOnEscape_ = !!opt_hideOnEscape;

  /**
   * @type {goog.events.EventHandler.<!bru.events.OutsideHandler>}
   * @private
   */
  this.handler_ = new goog.events.EventHandler(this);

  var doc = goog.dom.getOwnerDocument(this.element_);

  if (this.hideOnEscape_) {
    this.handler_.listen(doc, goog.events.EventType.KEYDOWN,
        this.onDocumentKeyDown_, true);
  }

  this.handler_.listen(doc,
      [goog.events.EventType.MOUSEDOWN, goog.events.EventType.TOUCHSTART],
      this, true);

  if (goog.userAgent.IE) {
    // We want to know about deactivates/mousedowns on the document with focus
    // The top-level document won't get a deactivate event if the focus is
    // in an iframe and the deactivate fires within that iframe.
    // The active element in the top-level document will remain the iframe
    // itself.
    var activeElement;
    /** @preserveTry */
    try {
      activeElement = doc.activeElement;
    } catch (e) {
      // There is an IE browser bug which can cause just the reading of
      // document.activeElement to throw an Unspecified Error.  This
      // may have to do with loading a popup within a hidden iframe.
    }
    while (activeElement && activeElement.nodeName == 'IFRAME') {
      /** @preserveTry */
      try {
        var tempDoc = goog.dom.getFrameContentDocument(activeElement);
      } catch (e) {
        // The frame is on a different domain that its parent document
        // This way, we grab the lowest-level document object we can get
        // a handle on given cross-domain security.
        break;
      }
      doc = tempDoc;
      activeElement = doc.activeElement;
    }

    // Handle mousedowns in the focused document in case the user clicks
    // on the activeElement (in which case the popup should hide).
    this.handler_.listen(doc,
        [goog.events.EventType.MOUSEDOWN, goog.events.EventType.TOUCHSTART],
        this, true);

    // If the active element inside the focused document changes, then
    // we probably need to hide the popup.
    this.handler_.listen(doc, goog.events.EventType.DEACTIVATE,
        this.onDocumentBlur_);

  } else {
    this.handler_.listen(doc, goog.events.EventType.BLUR,
        this.onDocumentBlur_);
  }
};
goog.inherits(bru.events.OutsideHandler, goog.events.EventTarget);


/**
 * @enum {string}
 */
bru.events.OutsideHandler.EventType = {
  OUTSIDE: 'outside'
};


/**
 * @param {goog.events.BrowserEvent} e The underlying browser event.
 */
bru.events.OutsideHandler.prototype.handleEvent = function(e) {
  var target = /** @type {Node} */ (e.target);
  var tragetInsideElements;
  if (this.elements_) {
    for (var i = 0, el; el = this.elements_[i]; i++) {
      if (goog.dom.contains(el, target)) {
        tragetInsideElements = true;
        break;
      }
    }
  }
  if (!goog.dom.contains(this.element_, target) && !tragetInsideElements) {
    var outsideEvent = this.createOutsideEvent_(e);
    this.dispatchEvent(outsideEvent);
  }
};


/**
 * Handles key-downs on the document to handle the escape key.
 *
 * @param {goog.events.BrowserEvent} e The event object.
 * @private
 */
bru.events.OutsideHandler.prototype.onDocumentKeyDown_ = function(e) {
  if (e.keyCode == goog.events.KeyCodes.ESC) {
    var outsideEvent = this.createOutsideEvent_(e);
    if (this.dispatchEvent(outsideEvent)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
};


/**
 * @param {goog.events.BrowserEvent} e The event object.
 * @private
 */
bru.events.OutsideHandler.prototype.onDocumentBlur_ = function(e) {
  var doc = goog.dom.getOwnerDocument(this.element_);

  if (typeof document.activeElement != 'undefined') {
    var activeElement = doc.activeElement;
    var activeInsideElements;
    if (this.elements_) {
      for (var i = 0, el; el = this.elements_[i]; i++) {
        if (goog.dom.contains(el, activeElement)) {
          activeInsideElements = true;
          break;
        }
      }
    }
    if (!activeElement || goog.dom.contains(this.element_,
        activeElement) || activeInsideElements ||
        activeElement.tagName == 'BODY') {
      return;
    }

  // Ignore blur events not for the document itself in non-IE browsers.
  } else if (e.target != doc) {
    return;
  }

  var outsideEvent = this.createOutsideEvent_(e);
  this.dispatchEvent(outsideEvent);
};


/**
 * @param {goog.events.BrowserEvent} be A browser event.
 * @return {goog.events.BrowserEvent} An outside event.
 * @private
 */
bru.events.OutsideHandler.prototype.createOutsideEvent_ = function(be) {
  var e = new goog.events.BrowserEvent(be.getBrowserEvent());
  e.type = bru.events.OutsideHandler.EventType.OUTSIDE;
  return e;
};


/** @override */
bru.events.OutsideHandler.prototype.disposeInternal = function() {
  bru.events.OutsideHandler.base(this, 'disposeInternal');
  this.handler_.dispose();
  delete this.elements_;
};
