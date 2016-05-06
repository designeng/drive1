goog.provide('drive.BrandsNav');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.ui.ScrollFloater');
goog.require('goog.userAgent');



/**
 * @constructor
 */
drive.BrandsNav = function() {
  var rootEl = goog.dom.getElement('bnav');
  if (!rootEl) {
    return;
  }

  // Генерируем CSS для иконок.
  var els = goog.dom.getElementsByClass('brand', rootEl);
  var css = [];
  for (var i = 0, el; el = els[i]; i++) {
    var brand = el.innerHTML.replace(/\s+/, '').toLowerCase();
    var bgpos = '0 -' + (i * 29) + 'px';
    el.parentNode.style.backgroundPosition = bgpos;
    css[i] = '.ib-' + brand + '{background-position:' + bgpos + '}';
  }
  goog.style.installStyles(css.join(''));

  /**
   * @type {Element}
   * @private
   */
  this.rootEl_ = rootEl;

  /**
   * @type {Element}
   * @private
   */
  this.rootUl_ = goog.dom.getElementByClass('bnav-list', rootEl);

  goog.events.listen(this.rootUl_, goog.userAgent.MOBILE ? goog.events.EventType.CLICK :
      [goog.events.EventType.MOUSEOVER, goog.events.EventType.FOCUSIN], this.onTouch_, true, this);
  if (!goog.userAgent.MOBILE) {
    goog.events.listen(this.rootUl_, goog.events.EventType.MOUSEOUT, this.onMouseout_, true, this);
  }
};


/**
 * @type {number}
 * @private
 */
drive.BrandsNav.prototype.MOUSEOVER_TIMEOUT_ = 275;


/**
 * @type {number}
 * @private
 */
drive.BrandsNav.prototype.MOUSEOUT_TIMEOUT_ = 400;


/**
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
drive.BrandsNav.prototype.onTouch_ = function(e) {
  var el = e.target;
  var li = /** @type {Element} */ (this.getParentLi_(el));

  if (!goog.userAgent.MOBILE && !this.isVisible_) {
    clearTimeout(this.tmOver_);
    // IE focus fix.
    if (e.type == goog.events.EventType.FOCUSIN) {
      this.show_(li);
    } else {
      this.tmOver_ = setTimeout(goog.bind(this.show_, this, li), this.MOUSEOVER_TIMEOUT_);
    }
  } else {
    if (this.activeEl_ != li) {
      // Первый раз кликаем на пункт меню - предотвращаем
      // переход и показываем меню второго уровня
      e.preventDefault();
    }
    this.show_(li);
  }
};


/**
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
drive.BrandsNav.prototype.onMouseout_ = function(e) {
  if (e.relatedTarget && (goog.dom.contains(this.rootUl_, e.relatedTarget))) {
    // Ignore internal mouse moves.
    return;
  }

  clearTimeout(this.tmOver_);
  this.tm_ = setTimeout(goog.bind(this.hide_, this), this.MOUSEOUT_TIMEOUT_);
};


/**
 * @param {Element} element
 * @private
 */
drive.BrandsNav.prototype.show_ = function(element) {
  clearTimeout(this.tm_);
  clearTimeout(this.visTm_);

  drive.pubsub.publish(drive.Topics.BRANDSNAV_SHOW);

  if (this.activeEl_ != element) {
    if (this.activeEl_) {
      goog.dom.classlist.remove(this.activeEl_, 'bnav-list-hover');
    }
    goog.dom.classlist.add(element, 'bnav-list-hover');
    this.activeEl_ = element;
  }

  var doc = goog.dom.getDocument();

  /**
    * An event handler to manage the events easily
    * @type {goog.events.EventHandler}
    * @private
    */
  this.handler_ = new goog.events.EventHandler(this);

  // Ripped form goog.ui.PopupBase
  this.handler_.listen(doc, goog.events.EventType.MOUSEDOWN,
      this.onDocumentMouseDown_, true);
  if (goog.userAgent.IE) {
    var activeElement;
    /** @preserveTry */
    try {
      activeElement = doc.activeElement;
    } catch (e) {
    }
    while (activeElement && activeElement.nodeName == 'IFRAME') {
      /** @preserveTry */
      try {
        var tempDoc = goog.dom.getFrameContentDocument(activeElement);
      } catch (e) {
        break;
      }
      doc = tempDoc;
      activeElement = doc.activeElement;
    }
    this.handler_.listen(doc, goog.events.EventType.CLICK,
        this.onDocumentMouseDown_, true);
  } else {
    this.handler_.listen(doc, goog.events.EventType.BLUR,
        this.onDocumentBlur_);
  }
  // end

  goog.dom.classlist.add(this.rootEl_, 'bnav-hover');
  goog.dom.classlist.add(this.rootEl_, 'bnav-visible');
  this.isVisible_ = true;
};


/**
 * @private
 */
drive.BrandsNav.prototype.hide_ = function() {
  if (!this.isVisible_) {
    return false;
  }

  if (this.handler_) {
    this.handler_.removeAll();
    this.handler_.dispose();
  }

  if (this.activeEl_) {
    goog.dom.classlist.remove(this.activeEl_, 'bnav-list-hover');
    this.activeEl_ = null;
  }

  goog.dom.classlist.remove(this.rootEl_, 'bnav-hover');
  this.visTm_ = setTimeout(goog.bind(function() {
    goog.dom.classlist.remove(this.rootEl_, 'bnav-visible');
  }, this), 200);

  this.isVisible_ = false;
};


/**
 * Return hovered element.
 * @param {Node} node
 * @return {Element}
 * @private
 */
drive.BrandsNav.prototype.getParentLi_ = function(node) {
  while (node && node.nodeType == goog.dom.NodeType.ELEMENT && node != this.rootUl_) {
    if (node.tagName == 'LI') {
      return /** @type {Element} */ (node);
    }
    node = node.parentNode;
  }
  return null;
};


/**
 * Mouse down handler for the document on capture phase. Used to hide the
 * popup for auto-hide mode.
 *
 * @param {goog.events.BrowserEvent} e The event object.
 * @private
 */
drive.BrandsNav.prototype.onDocumentMouseDown_ = function(e) {
  var target = /** @type {Node} */ (e.target);
  if (!goog.dom.contains(this.rootUl_, target)) {
    // Mouse click was outside popup, so hide.
    this.hide_();
  }
};


/**
 * Deactivate handler(IE) and blur handler (other browsers) for document.
 * Used to hide the popup for auto-hide mode.
 *
 * @param {goog.events.BrowserEvent} e The event object.
 * @private
 */
drive.BrandsNav.prototype.onDocumentBlur_ = function(e) {
  var doc = goog.dom.getOwnerDocument(this.rootEl_);

  // Ignore blur events if the active element is still inside the popup.
  if (goog.userAgent.IE || goog.userAgent.OPERA) {
    var activeElement = doc.activeElement;
    if (activeElement && goog.dom.contains(this.rootUl_,
        activeElement)) {
      return;
    }

  // Ignore blur events not for the document itself in non-IE browsers.
  } else if (e.target != doc) {
    return;
  }

  this.hide_();
};


/**
 * Export
 */
goog.exportSymbol('drv.Bnav', drive.BrandsNav);
