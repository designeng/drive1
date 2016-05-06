goog.provide('bru.events.DocumentPubSub');
goog.provide('bru.events.DocumentPubSub.Type');

goog.require('goog.Disposable');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.events.FocusHandler');
goog.require('goog.pubsub.PubSub');


/**
 * Use bru.events.DocumentPubSub.getInstance() to get handler.
 * @extends {goog.Disposable}
 * @constructor
 */
bru.events.DocumentPubSub = function() {
  goog.Disposable.call(this);

  /**
   * @type {!goog.events.EventHandler}
   * @protected
   */
  this.handler = new goog.events.EventHandler(this);

  /**
   * @type {goog.pubsub.PubSub}
   * @private
   */
  this.pubsub_ = new goog.pubsub.PubSub();

  /**
   * Бинарная карта типов событий, на которые уже есть подписка.
   * @type {number}
   * @private
   */
  this.subs_ = 0;
};
goog.inherits(bru.events.DocumentPubSub, goog.Disposable);


/**
 * Disposes of the object.
 */
bru.events.DocumentPubSub.prototype.disposeInternal = function() {
  bru.events.DocumentPubSub.superClass_.disposeInternal.call(this);

  this.handler.dispose();
  this.pubsub_.dispose();
};


/**
 * Тип события, на которое подписываются.
 * @enum {number}
 */
bru.events.DocumentPubSub.Type = {
  CLICK: 1,
  SUBMIT: 2,
  FOCUSIN: 4,
  FOCUSOUT: 8
};


/**
 * @param {number|Array.<number>} type Тип события.
 * @param {string} action Data-action тег на который подписываемся.
 * @param {Function} fn Function to be invoked when a message is published to
 *     the given topic.
 * @param {Object=} context Object in whose context the function is to be
 *     called (the global scope if none).
 * @return {?number} Subscription key.
 */
bru.events.DocumentPubSub.prototype.subscribe = function(type, action, fn, context) {
 if (goog.isArray(type)) {
    for (var i = type.length; i--;) {
      this.subscribe(type[i], action, fn, context);
    }
    return null;
  } else {
    if (~this.subs_ & type) {
      this.attachListener_(/** @type {number} */ (type));
    }
    return this.pubsub_.subscribe(type + ':' + action, fn, context);
  }
};


/**
 * @param {number} type Тип события.
 * @param {string|Array.<string>} action Data-action тег на который подписываемся.
 * @param {Function} fn Function to be invoked when a message is published to
 *     the given topic.
 * @param {Object=} context Object in whose context the function is to be
 *     called (the global scope if none).
 * @return {boolean} Whether a matching subscription was removed.
 */
bru.events.DocumentPubSub.prototype.unsubscribe = function(type, action, fn, context) {
  return this.pubsub_.unsubscribe(type + ':' + action, fn, context);
};


/**
 * @param {?number} key Subscription key.
 * @return {boolean} Whether a matching subscription was removed.
 */
bru.events.DocumentPubSub.prototype.unsubscribeByKey = function(key) {
  if (key) {
    return this.pubsub_.unsubscribeByKey(/** @type {number} */ (key));
  }
};


/**
 * @param {number} type Тип события.
 * @private
 */
bru.events.DocumentPubSub.prototype.attachListener_ = function(type) {
  this.subs_ |= type;

  var doc = goog.dom.getDocument();

  switch (type) {
    case bru.events.DocumentPubSub.Type.SUBMIT:
      this.handler.listen(doc, goog.events.EventType.SUBMIT, this.onSubmit_);
      break;
    case bru.events.DocumentPubSub.Type.FOCUSIN:
    case bru.events.DocumentPubSub.Type.FOCUSOUT:
      this.focusHandler_ = this.focusHandler_ || new goog.events.FocusHandler(doc);
    case bru.events.DocumentPubSub.Type.FOCUSIN:
      this.handler.listen(this.focusHandler_, goog.events.FocusHandler.EventType.FOCUSIN, this.onFocus_);
    case bru.events.DocumentPubSub.Type.FOCUSOUT:
      this.handler.listen(this.focusHandler_, goog.events.FocusHandler.EventType.FOCUSOUT, this.onFocus_);
      break;
    default:
      this.handler.listen(doc, goog.events.EventType.CLICK, this.onClick_);
  }
};


/**
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
bru.events.DocumentPubSub.prototype.onClick_ = function(e) {
  var action = null;
  var node = e.target;
  while (node && node.nodeType == goog.dom.NodeType.ELEMENT) {
    if (action = node.getAttribute('data-action')) {
      break;
    }
    node = node.parentNode;
  }
  if (action) {
    this.pubsub_.publish(bru.events.DocumentPubSub.Type.CLICK + ':' + action, action, /** @type {Element} */ (node), e);
  }
};


/**
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
bru.events.DocumentPubSub.prototype.onSubmit_ = function(e) {
  var el = /** @type {Element} */ (e.target);
  var action = el.getAttribute('data-action');
  if (action) {
    this.pubsub_.publish(bru.events.DocumentPubSub.Type.SUBMIT + ':' + action, action, el, e);
  }
};


/**
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
bru.events.DocumentPubSub.prototype.onFocus_ = function(e) {
  var action = null;
  var node = e.target;
  while (node && node.nodeType == goog.dom.NodeType.ELEMENT) {
    if (action = node.getAttribute('data-action')) {
      break;
    }
    node = node.parentNode;
  }
  if (action) {
    var type = goog.events.FocusHandler.EventType.FOCUSIN ? bru.events.DocumentPubSub.Type.FOCUSIN : bru.events.DocumentPubSub.Type.FOCUSOUT;
    this.pubsub_.publish(type + ':' + action, action, /** @type {Element} */ (node), e);
  }
};
