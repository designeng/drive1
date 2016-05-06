goog.provide('bru.events.actionSubmitHandler');

goog.require('bru.events.ActionEvent');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');



/**
 * Action click handler.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @private
 */
bru.events.ActionSubmitHandler_ = function() {
  goog.events.EventTarget.call(this);

  /**
   * The key returned from the goog.events.listen.
   * @type {?number}
   * @private
   */
  this.listenKey_ = goog.events.listen(goog.dom.getDocument(), 'submit', this);
};
goog.inherits(bru.events.ActionSubmitHandler_, goog.events.EventTarget);


/**
 *  Disposes of the action click handler.
 */
bru.events.ActionSubmitHandler_.prototype.disposeInternal = function() {
  bru.events.ActionSubmitHandler_.superClass_.disposeInternal.call(this);
  goog.events.unlistenByKey(this.listenKey_);
};


/**
 * This handles the underlying events and dispatches a new event.
 * @param {goog.events.BrowserEvent} e  The underlying browser event.
 */
bru.events.ActionSubmitHandler_.prototype.handleEvent = function(e) {
  var be = e.getBrowserEvent();
  var el = /** @type {Element} */ e.target;
  var action = el.getAttribute('data-action');
  if (action) {
    var newEvent = new bru.events.ActionEvent(be, action, el);
    try {
      this.dispatchEvent(newEvent);
    } finally {
      newEvent.dispose();
    }
  }
};


/**
 * Эмуляция всплывания submit в IE.
 * При focusin/focusout на форму вешаем/снимаем с нее submit handler.
 * Игнорируем формы без data-action.
 * @param {goog.events.BrowserEvent} e  The underlying browser event.
 * @private
 */
bru.events.ActionSubmitHandler_.prototype.bublingSubmit_ = function(e) {
  var node = /** @type {Node} */ (e.target);
  while (node && node.nodeName != 'FORM') {
    node = node.parentNode;
  }
  if (node) {
    var focusin = e.type == 'focusin' || e.type == 'focus';
    if (focusin && !this.submitListenKey_) {
      /**
       * The key returned from the goog.events.listen.
       * @type {?number}
       * @private
       */
      this.submitListenKey_ = goog.events.listen(node, 'submit', this.bublingSubmitHandler_, false, this);
    } else if (!focusin && this.submitListenKey_) {
      goog.events.unlistenByKey(this.submitListenKey_);
      delete this.submitListenKey_;
    }
  }
};


/**
 * Отрабатываем submit, который даспатчит эмулятор submit bubbling для IE.
 * @param {goog.events.BrowserEvent} e  The browser event.
 * @private
 */
bru.events.ActionSubmitHandler_.prototype.bublingSubmitHandler_ = function(e) {
  var el = /** @type {Element} */ (e.target);
  var action = el.getAttribute('data-action');
  var newEvent = new bru.events.ActionEvent(e.getBrowserEvent(), action, el);
  try {
    this.dispatchEvent(newEvent);
  } finally {
    newEvent.dispose();
  }
};


/**
 * Singleton instance of ActionSubmitHandler_.
 * @type {bru.events.ActionSubmitHandler_}
 */
bru.events.actionSubmitHandler = new bru.events.ActionSubmitHandler_();


/**
 * Статический метод для програмной отправки формы,
 * т.к. form.submit() не будет работать в IE.
 * TODO: Это все порождение больного разума, нужно проверять эту сырую реализацию.
 * @param {!Element} form
 */
bru.events.actionSubmitHandler.submitForm = function(form) {
  var e = new goog.events.Event('submit');
  e.target = form;
  var action = form.getAttribute('data-action');
  if (!action) {
    return;
  }
  var newEvent = new bru.events.ActionEvent(e, action, form);
  try {
    bru.events.actionSubmitHandler.dispatchEvent(newEvent);
  } finally {
    newEvent.dispose();
  }
};

