// Copyright 2011 The Closure Library Authors. All Rights Reserved
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Provides the bru.jsaction.EventContract object, which is
 * responsible for jsaction-related event handling.
 *
 * Jsaction provides an event handling abstraction which decouples
 * the DOM and JavaScript code. The traditional way to associate event
 * handlers with DOM elements is to programmatically obtain a reference to
 * the element in question and register an event handler on it.
 * Jsaction allows for a more declarative way to set up event handling code.
 * It relies on the custom attribute 'jsaction' which contain a mapping from
 * event type to named actions) and on events bubbling up to a single event
 * handler registered on a container element.
 *
 * Example usage:
 *
 * var contract = new bru.jsaction.EventContract;
 * contract.addContainer(someContainerElement);
 * contract.addEvent(bru.jsaction.EventType.CLICK);
 *
 * This will set up the event handling for click actions for the whole
 * subtree of the container element. Note the body-element can be used as
 * container without restriction, resulting in a single event handler
 * per event type for the whole page.
 *
 * To complete the setup, EventContract needs to be hooked up to a
 * dispatcher, whose task it is to look up and invoke the appropriate
 * handler function for an action.
 *
 * var dispatcher = new bru.jsaction.Dispatcher;
 * contract.setDispatcher(dispatcher);
 *
 * Before the dispatcher has been set, EventContract will simply queue
 * events for later replay. This allows to set up jsaction handling with
 * very little code and defer loading of the dispatcher and action handlers.
 *
 * A few words about modified click events:
 *
 * A modified click is one for which browsers exhibit special behavior.
 * An example would be ctrl-click (or cmd-click on Macs) to open a link
 * in a new window or tab.
 * In order to support this, jsaction uses custom event types to distiguish
 * between plain and modified clicks.
 * - Native 'click'-events are separated into custom event types
 *   'click_plain' and 'click_mod'.
 * - These can also be specified in jsaction-attributes (although it will
 *   typically not be necessary).
 * - An action specified for type 'click' will be invoked for both
 *   plain and modified clicks.
 * - The default event type (in case none is specified in the
 *   jsaction-attribute) is 'click_plain'.
 *
 * Examples:
 *
 * <a href="http://gna.com" jsaction="klik.me">...</a>
 * - No event type is specified for the action, therefore it defaults
 *   to 'click_plain' and this is equivalent to:
 *   <a href="http://gna.com" jsaction="click_plain: klik.me">...</a>
 * - For plain click, the handler for action 'klik.me' will be invoked.
 * - For a modified click, no action will be found and the event
 *   is left to be handled by the browser (http://gna.com will be
 *   loaded in a separate tab or window).
 *
 * <a href="http://gna.com" jsaction="click: klik.me">..</a>
 * - Action 'klik.me' is invoked both for plain and modified clicks.
 * - The href-attribute is ignored in both cases.
 *
 * <a href="http://gna.com" jsaction="click_mod: klik.me">...</a>
 * - A plain click will be left to the browser to handle, which will
 *   navigate to http://gna.com.
 * - A modified click will cause action 'klik.me' to be invoked.
 *
 */


goog.provide('bru.jsaction.EventContract');
goog.provide('bru.jsaction.EventType');
goog.provide('bru.jsaction.ReplayInfo');

goog.require('bru.i18n.JsAction');
goog.require('bru.jsaction.util');
goog.require('goog.dom.dataset');
goog.require('goog.dom.forms');
goog.require('goog.events.KeyCodes');
goog.require('goog.object');
goog.require('goog.userAgent');



/**
 * Records information for replaying events.
 * @typedef {{
 *     action: string,
 *     element: !Element,
 *     event: !Event,
 *     time: number
 * }}
 */
bru.jsaction.ReplayInfo;


/**
 * Event types enum.
 * @enum {string}
 */
bru.jsaction.EventType = {
  CLICK: 'click',
  CLICK_MODIFIED: 'click_mod',
  CLICK_PLAIN: 'click_plain',
  TAP: 'tap',
  SUBMIT: 'submit',
  FOCUSIN: 'focusin',
  FOCUSOUT: 'focusout'
};



/**
 * Instantiates EventContract, the object responsible for jsaction-related
 * event handling and queuing.
 * @constructor
 */
bru.jsaction.EventContract = function() {
  /**
   * The container elements.
   * @type {!Array.<!Element>}
   * @private
   */
  this.containers_ = [];

  /**
   * The event types handled by this instance.
   * @type {!Object.<string, boolean>}
   * @private
   */
  this.eventTypes_ = {};

  /**
   * Array of queued events for later replay.
   * @type {!Array.<!bru.jsaction.ReplayInfo>}
   * @private
   */
  this.queue_ = [];

  /**
   * The dispatcher object. As long as this isn't set, all events for which
   * an action has been found will be queued.
   * @type {bru.jsaction.Dispatcher}
   * @private
   */
  this.dispatcher_ = null;

  /**
   * @type {bru.form.Validator}
   * @private
   */
  this.validator_ = null;
};


/**
 * @return {bru.jsaction.EventContract}
 */
bru.jsaction.EventContract.getInstanceForDocument = function() {
  if (!bru.jsaction.EventContract.instance_) {
    bru.jsaction.EventContract.instance_ = new bru.jsaction.EventContract();
    bru.jsaction.EventContract.instance_.addContainer(document.documentElement);
    bru.jsaction.EventContract.instance_.addEvent(bru.jsaction.EventType.CLICK);
    bru.jsaction.EventContract.instance_.addEvent(bru.jsaction.EventType.SUBMIT);
  }
  return bru.jsaction.EventContract.instance_;
};


/**
 * A constant for the name of the 'jsaction'-attribute.
 * @type {string}
 * @private
 * @const
 */
bru.jsaction.EventContract.ATTRIBUTE_NAME_JSACTION_ = 'data-action';


/**
 * Constant for the name of the property attached to DOM nodes which constains
 * a map from event type to action name.
 * @type {string}
 * @private
 * @const
 */
bru.jsaction.EventContract.PROPERTY_KEY_ACTION_MAP_ = '__jsam';


/**
 * Constant for the name of the property attached to container elements. The
 * property contains the event handler function for the container in question.
 * @type {string}
 * @private
 * @const
 */
bru.jsaction.EventContract.PROPERTY_KEY_EVENT_HANDLER_ = '__jsaeh';


/**
 * Constant for the name of the property attached to event objects when they're
 * replayed. The property contains an object of type bru.jsaction.ReplayInfo.
 * @type {string}
 * @const
 */
bru.jsaction.EventContract.PROPERTY_KEY_REPLAY_INFO = '__jsari';


/**
 * The default event type used if no type is specified in the jsaction
 * attribute for an action.
 * @type {string}
 * @const
 * @private
 */
bru.jsaction.EventContract.DEFAULT_EVENT_TYPE_ =
    bru.jsaction.EventType.CLICK_PLAIN;


/**
 * @type {boolean}
 * @private
 */
bru.jsaction.EventContract.NEED_SUBMIT_BUBBLE_EMULATION_ =
    goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9');


/**
 * Adds a container element. Container elements is where EventContract
 * registeres actual DOM event handlers. Adding a container element
 * will enable jsaction-handling for its whole subtree.
 * @param {!Element} containerElem The element.
 */
bru.jsaction.EventContract.prototype.addContainer = function(containerElem) {
  if (containerElem[bru.jsaction.EventContract.PROPERTY_KEY_EVENT_HANDLER_]) {
    if (goog.DEBUG) {
      throw Error('The provided element has already been added as ' +
                  'container to an EventContract instance.');
    }
    return;
  }

  this.containers_.push(containerElem);

  // Create the event handler for the container element and store
  // it as a property thereof. The same event handler is used for
  // all event types.
  var handler = bru.jsaction.EventContract.createEventHandler_(
      this, containerElem);
  containerElem[bru.jsaction.EventContract.PROPERTY_KEY_EVENT_HANDLER_] =
      handler;

  for (var eventType in this.eventTypes_) {
    bru.jsaction.util.addEventListener(containerElem, eventType, handler);
  }
};


/**
 * Adds an event type to listen for.
 * @param {string} eventType The event type.
 */
bru.jsaction.EventContract.prototype.addEvent = function(eventType) {
  // TAP используется только для инициализации touchstart хендлера,
  // чтобы определать эмулируемые клики.
  if (eventType == bru.jsaction.EventType.TAP && !this.touchHandlerInited_ &&
      'ontouchstart' in document.documentElement) {
    this.touchHandlerInited_ = true;
    document.documentElement.addEventListener('touchstart',
        goog.bind(function(e) {this.touchstartTime_ = goog.now();}, this), false);
    return;
  }

  if (eventType == bru.jsaction.EventType.FOCUSIN && !goog.userAgent.IE) {
    eventType = 'focus';
  } else if (eventType == bru.jsaction.EventType.FOCUSOUT && !goog.userAgent.IE) {
    eventType = 'blur';
  }

  if (this.eventTypes_[eventType]) {
    return;
  }

  this.eventTypes_[eventType] = true;

  for (var i = 0, container; container = this.containers_[i]; ++i) {
    var handler = container[
        bru.jsaction.EventContract.PROPERTY_KEY_EVENT_HANDLER_];
    bru.jsaction.util.addEventListener(container, eventType, handler);
  }

  // Если мы добавили submit, то слушаем focusin/focusout.
  if (eventType == bru.jsaction.EventType.SUBMIT) {
    this.addEvent(bru.jsaction.EventType.FOCUSIN);
    this.addEvent(bru.jsaction.EventType.FOCUSOUT);
  }
};


/**
 * @return {!Array.<!bru.jsaction.ReplayInfo>} The array containing
 *     the replay info for queued events.
 */
bru.jsaction.EventContract.prototype.getQueue = function() {
  return this.queue_;
};


/**
 * Sets the dispatcher.
 * @param {bru.jsaction.Dispatcher} dispatcher The dispatcher.
 */
bru.jsaction.EventContract.prototype.setDispatcher = function(dispatcher) {
  this.dispatcher_ = dispatcher;
};


/**
 * @return {bru.jsaction.Dispatcher} The dispatcher.
 */
bru.jsaction.EventContract.prototype.getDispatcher = function() {
  return this.dispatcher_;
};


/**
 * Sets the form validator.
 * @param {bru.form.Validator} validator
 */
bru.jsaction.EventContract.prototype.setValidator = function(validator) {
  this.validator_ = validator;
};


/**
 * @param {!Element} elem The element.
 * @param {string=} opt_eventType The event type.
 */
bru.jsaction.EventContract.removeAction = function(elem, opt_eventType) {
  var eventType = opt_eventType || bru.jsaction.EventContract.DEFAULT_EVENT_TYPE_;
  var actions = bru.jsaction.EventContract.parseJsActionAttribute_(elem);
  var dataAttr = '';
  for (var i in actions) {
    if (i != eventType) {
      dataAttr += i + ':' + actions[i] + ';';
    }
  }

  if (dataAttr) {
    elem.setAttribute(bru.jsaction.EventContract.ATTRIBUTE_NAME_JSACTION_, dataAttr);
  } else {
    elem.removeAttribute(bru.jsaction.EventContract.ATTRIBUTE_NAME_JSACTION_);
  }

  if (elem[bru.jsaction.EventContract.PROPERTY_KEY_ACTION_MAP_]) {
    delete elem[bru.jsaction.EventContract.PROPERTY_KEY_ACTION_MAP_];
  }
};


/**
 * Gets the action for the given element and event type.
 * @param {!Element} elem The element.
 * @param {string} eventType The event type.
 * @return {?string} The action (or null if there is none).
 * @private
 */
bru.jsaction.EventContract.getAction_ = function(elem, eventType) {
  var actionMap = elem[bru.jsaction.EventContract.PROPERTY_KEY_ACTION_MAP_];
  if (!actionMap) {
    actionMap = elem[bru.jsaction.EventContract.PROPERTY_KEY_ACTION_MAP_] =
        bru.jsaction.EventContract.parseJsActionAttribute_(elem);
  }
  return actionMap[eventType] || null;
};


/**
 * Parses the jsaction-attribute on the given element and returns
 * a map from event type to action.
 * @param {!Element} elem The element.
 * @return {!Object.<string, string>} A map from
 *     event type to an action.
 * @private
 */
bru.jsaction.EventContract.parseJsActionAttribute_ = function(elem) {
  var actionMap = {};
  var attrValue = elem.nodeType ? elem.getAttribute(
      bru.jsaction.EventContract.ATTRIBUTE_NAME_JSACTION_) : null;
  if (attrValue) {
    var actionSpecs = attrValue.replace(/\s/g, '').split(';');
    for (var i = 0; i < actionSpecs.length; ++i) {
      var parts = actionSpecs[i].split(':');
      var type = parts[0];
      var action = parts[1];
      if (!action) {
        action = parts[0];
        type = bru.jsaction.EventContract.DEFAULT_EVENT_TYPE_;
      }
      actionMap[type] = action;
    }

    var clickAction = actionMap[bru.jsaction.EventType.CLICK];
    if (clickAction) {
      if (!actionMap[bru.jsaction.EventType.CLICK_MODIFIED]) {
        actionMap[bru.jsaction.EventType.CLICK_MODIFIED] =
            clickAction;
      }
      if (!actionMap[bru.jsaction.EventType.CLICK_PLAIN]) {
        actionMap[bru.jsaction.EventType.CLICK_PLAIN] =
            clickAction;
      }
    }
  }
  return actionMap;
};


/**
 * Creates the event handler function to be used for a container element.
 * @param {!bru.jsaction.EventContract} contract The EventContract instance.
 * @param {!Element} container The container element.
 * @return {function(!Event)} The event handler function.
 * @private
 */
bru.jsaction.EventContract.createEventHandler_ = function(
    contract, container) {
  return function(e) {
    contract.handleEvent_(e, container);
  };
};


/**
 * Handles a browser event.
 * Walks up the DOM tree starting at the target element of the event until
 * it finds an eligible action for the event or reaches the container element.
 * If an action is found, the event is handed to the dispatcher
 * to invoke an associated action handler (TODO, coming real soon).
 * @param {!Event} e The native event object.
 * @param {!Element} containerElem The container element.
 * @private
 */
bru.jsaction.EventContract.prototype.handleEvent_ = function(
    e, containerElem) {
  var targetElem = e.srcElement || e.target;
  var eventType = e.type;

  // Если была нажата не левая кнопка мыши, то выходим.
  if (e.button && e.button !== 0) {
    return;
  }

  // If the event is replayed, we use the time from the original event.
  var replayInfo = e[bru.jsaction.EventContract.PROPERTY_KEY_REPLAY_INFO];
  var time = replayInfo && replayInfo.time || goog.now();

  // TODO(user): Apply mapping for event types where the jsaction type
  // doesn't match the type of DOM event (e.g. focus vs. focusin).
  if (eventType == 'focus') {
    eventType = bru.jsaction.EventType.FOCUSIN;
  } else if (eventType == 'blur') {
    eventType = bru.jsaction.EventType.FOCUSOUT;
  }
  var focusin = eventType == bru.jsaction.EventType.FOCUSIN;
  var focusout = eventType == bru.jsaction.EventType.FOCUSOUT;

  // Distinguish modified and plain click events.
  if (eventType == bru.jsaction.EventType.CLICK) {
    eventType = bru.jsaction.util.isModifiedClickEvent(e) ?
        bru.jsaction.EventType.CLICK_MODIFIED :
        bru.jsaction.EventType.CLICK_PLAIN;
  }

  var action, elem, node;
  if (focusin || focusout) {

    // Find an form with an eligible action.
    for (node = targetElem;
         !action && node && node != containerElem;
         node = node.parentNode) {
      elem = /** @type {!Element} */(node);
      if (elem.nodeName == 'FORM') {
        action = bru.jsaction.EventContract.getAction_(elem, bru.jsaction.EventType.SUBMIT);
        if (action) {
          break;
        }
      }
    }

    if (action && elem) {
      if (focusin) {
        // Отправка формы по ctrl(meta)+enter если есть data-keysubmit атрибут.
        if (goog.dom.dataset.has(elem, 'keysubmit')) {
          bru.jsaction.util.addEventListener(elem, 'keyup', this.keyHandler_);
        }

        // Предотвращение отправки формы если есть data-leavewarning атрибут
        // и содержимое формы изменилось.
        // Будет работать только для одной формы на странице,
        // но больше пока и не надо.
        if (goog.dom.dataset.has(elem, 'leavewarning') &&
            !goog.isFunction(window.onbeforeunload)) {
          if (!this.formData_) {
            this.form_ = elem;
            this.formData_ = goog.dom.forms.getFormDataString(
                /** @type {!HTMLFormElement} */ (elem));
          }
          window.onbeforeunload =
              goog.bind(this.onBeforeUnloadHandler_, this);
        }

        // Эмуляция submit bubbling для IE8-.
        if (bru.jsaction.EventContract.NEED_SUBMIT_BUBBLE_EMULATION_) {
          bru.jsaction.util.addEventListener(elem, bru.jsaction.EventType.SUBMIT,
              containerElem[bru.jsaction.EventContract.PROPERTY_KEY_EVENT_HANDLER_]);
        }
      } else {
        bru.jsaction.util.removeEventListener(elem, 'keyup', this.keyHandler_);
        bru.jsaction.util.removeEventListener(elem, bru.jsaction.EventType.SUBMIT,
              containerElem[bru.jsaction.EventContract.PROPERTY_KEY_EVENT_HANDLER_]);
      }
    }
  }

  // Find an ancestor with an eligible action.
  action = null, elem = null;
  for (node = targetElem;
       !action && node && node != containerElem;
       node = node.parentNode) {
    elem = /** @type {!Element} */(node);
    action = bru.jsaction.EventContract.getAction_(elem, eventType);
    if (action) {
      break;
    }
  }

  if (action && elem) {
    // Если touchstart был меньше чем 800ms назад, то считаем, что кли эмулированный.
    if ((eventType == bru.jsaction.EventType.CLICK_MODIFIED ||
        eventType == bru.jsaction.EventType.CLICK_PLAIN) &&
        this.touchstartTime_ &&
        goog.now() - this.touchstartTime_ < 800) {
      e['pointerType'] = 'touch';
    }

    // Валидация формы.
    if (eventType == bru.jsaction.EventType.SUBMIT && this.validator_) {
      if (!this.validator_.isValidForm(/** @type {!HTMLFormElement} */ (elem))) {
        bru.jsaction.util.preventDefault(e);
        return;
      }
    }

    var actionHandled = false;
    if (this.dispatcher_) {
      actionHandled = this.dispatcher_.dispatch(action, elem, e, time);
    }

    if (!actionHandled) {
      // NOTE(user): If an action was handled by the dispatcher, it
      // is also up to the dispatcher/handler to stop propagation
      // and prevent the default.
      bru.jsaction.util.stopPropagation(e);
      // Если у формы action == default, то ее мы все равно отправляем,
      // т.к. предполагается, что дополнительных обработчиков для нее не будет.
      if (eventType != bru.jsaction.EventType.SUBMIT && action != 'default') {
        bru.jsaction.util.preventDefault(e);

        this.queue_.push({
          action: action,
          element: elem,
          event: /** @type {!Event} */(goog.object.clone(e)),
          time: time
        });
      } else {
        window.onbeforeunload = null;
      }
    }
  }
};


/**
 * @param {!Event} e The native event object.
 * @private
 */
bru.jsaction.EventContract.prototype.keyHandler_ = function(e) {
  if ((e.ctrlKey || e.metaKey) && e.keyCode == goog.events.KeyCodes.ENTER) {
    var node = e.srcElement || e.target;
    while (node && node.nodeName != 'FORM') {
      node = node.parentNode;
    }
    if (node) {
      bru.jsaction.util.preventDefault(e);
      bru.jsaction.util.submitForm(/** @type {!Element} */ (node));
    }
  }
};


/**
 * @param {Event} e The native event object.
 * @return {?string}
 * @private
 */
bru.jsaction.EventContract.prototype.onBeforeUnloadHandler_ = function(e) {
  var curFormData = goog.dom.forms.getFormDataString(this.form_);
  if (curFormData != this.formData_) {
    var text = bru.i18n.JsAction.UNLOAD_WARNING;
    e = e || window.event;
    if (e) {
      e.returnValue = text;
    }
    return text;
  }
  return null;
};
