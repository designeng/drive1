goog.provide('bru.events.actionClickHandler');

goog.require('bru.events.ActionEvent');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');



/**
 * Action click handler.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @private
 */
bru.events.ActionClickHandler_ = function() {
  goog.events.EventTarget.call(this);

  /**
   * The key returned from the goog.events.listen.
   * @type {?number}
   * @private
   */
  this.listenKey_ = goog.events.listen(goog.dom.getDocument(), goog.events.EventType.CLICK, this);
};
goog.inherits(bru.events.ActionClickHandler_, goog.events.EventTarget);


/**
 *  Disposes of the action click handler.
 */
bru.events.ActionClickHandler_.prototype.disposeInternal = function() {
  bru.events.ActionClickHandler_.superClass_.disposeInternal.call(this);
  goog.events.unlistenByKey(this.listenKey_);
};


/**
 * This handles the underlying events and dispatches a new event.
 * @param {goog.events.BrowserEvent} e  The underlying browser event.
 */
bru.events.ActionClickHandler_.prototype.handleEvent = function(e) {
  if (e.button != 0) {
    // В FF срабатывает по нажатию правой кнопки.
    return;
  }

  var action;
  var be = e.getBrowserEvent();
  var node = /** @type {Node} */ e.target;

  // Ищем ближайшего родителя с data-action и вызываем событие, если нашли.
  while (node && node.nodeType == goog.dom.NodeType.ELEMENT) {
    if (action = node.getAttribute('data-action')) {
      break;
    }
    node = node.parentNode;
  }
  /** @type {!Element} */ (node);

  if (action) {
    var newEvent = new bru.events.ActionEvent(be, action, node);
    try {
      this.dispatchEvent(newEvent);
    } finally {
      newEvent.dispose();
    }
  }
};


/**
 * Singleton instance of ActionClickHandler_.
 * @type {bru.events.ActionClickHandler_}
 */
bru.events.actionClickHandler = new bru.events.ActionClickHandler_();
