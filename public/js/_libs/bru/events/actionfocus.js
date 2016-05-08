goog.provide('bru.events.actionFocusHandler');

goog.require('bru.events.ActionEvent');
goog.require('bru.events.actionSubmitHandler');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.classes');
goog.require('goog.dom.forms');
goog.require('goog.events.FocusHandler');



/**
 * Action focus handler and placeholder emulation.
 * @constructor
 * @extends {goog.events.FocusHandler}
 * @private
 */
bru.events.ActionFocusHandler_ = function() {
  goog.events.FocusHandler.call(this, goog.dom.getDocument());
};
goog.inherits(bru.events.ActionFocusHandler_, goog.events.FocusHandler);


(function() {
  var el = goog.dom.createElement('INPUT');

  /**
   * Поддерживается ли нативная реализация placeholder'ов?
   * @type {boolean}
   */
  bru.events.NATIVE_PLACEHOLDER = 'placeholder' in el;

  // See http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
  el = goog.dom.createElement('DIV');
  var eventName = 'onsubmit';
  el.setAttribute(eventName, 'return;');

  /**
   * Поддерживается submit bubbling? Не поддерживается только в IE8-.
   * @type {boolean}
   */
  bru.events.NATIVE_SUBMIT_BUBBLING = goog.isFunction(el[eventName]);

  el = null;
})();


/**
 * This handles the underlying events and dispatches a new event.
 * @param {goog.events.BrowserEvent} e  The underlying browser event.
 */
bru.events.ActionFocusHandler_.prototype.handleEvent = function(e) {
  var action;
  var ph;
  var phEl;
  var be = e.getBrowserEvent();
  var node = /** @type {Node} */ (e.target);
  var focusin = be.type == 'focusin' || be.type == 'focus';

  // Реализация placeholder'а в случае focusin. Переменная ph будет индикатором того,
  // что нужна эмуляция placeholder'а.
  if (node.nodeType == goog.dom.NodeType.ELEMENT && !bru.events.NATIVE_PLACEHOLDER) {
    phEl = /** @type {!Element} */ (node);
    ph = phEl.getAttribute('placeholder');
    // Если элемент попал в фокус, value == placeholder и у поля класс 'placeholder', то эмулируем поведнее placeholder'а.
    // TODO: Есть вероятность, что проверка goog.dom.classes.has(node, 'placeholder') может глючить в каких-то случаях.
    if (focusin && phEl.value == ph && goog.dom.classes.has(phEl, 'placeholder')) {
      phEl.value = '';
      goog.dom.classes.remove(phEl, 'placeholder');
    }
  }

  // Ищем ближайшего родителя с data-action и вызываем событие, если нашли.
  while (node && node.nodeType == goog.dom.NodeType.ELEMENT) {
    if (action = node.getAttribute('data-action')) {
      break;
    }
    node = node.parentNode;
  }
  /** @type {!Element} */ (node);

  if (action) {
    // Эмуляция submit bubbling для IE.
    if (!bru.events.NATIVE_SUBMIT_BUBBLING) {
      bru.events.actionSubmitHandler.bublingSubmit_(e);
    }

    var newEvent = new bru.events.ActionEvent(be, action, node);
    newEvent.originalType = focusin ?
        goog.events.FocusHandler.EventType.FOCUSIN :
        goog.events.FocusHandler.EventType.FOCUSOUT;
    try {
      this.dispatchEvent(newEvent);
    } finally {
      newEvent.dispose();
    }
  }

  // Реализация placeholder'а в случае focusout. Специально после
  // обработки всей action-логики, чтобы можно было норамльно работать
  // с полями формы в обработчиках событий.

  if (ph && !focusin && !phEl.value) {
    phEl.value = ph;
    goog.dom.classes.add(phEl, 'placeholder');
  }
};


/**
 * Singleton instance of ActionFocusHandler_.
 * @type {bru.events.ActionFocusHandler_}
 */
bru.events.actionFocusHandler = new bru.events.ActionFocusHandler_();


/**
 * Статический метод для инициализации placeholder'a.
 * @param {Element} el Элемент (INPUT, TEXTAREA) для инициализации placeholder'a.
 * @return {Element}
 */
bru.events.actionFocusHandler.placeholder = function(el) {
  if (bru.events.NATIVE_PLACEHOLDER) {
    return el;
  }
  var ph = el.getAttribute('placeholder');
  if (!ph) {
    return el;
  }

  // Добавляем класс для эмуляции и вписываем текст
  // placeholder'а, если в поле ввода ничего нет.
  if (!el.value) {
    el.value = ph;
  }
  goog.dom.classes.enable(el, 'placeholder', el.value == ph);
  return el;
};


/**
 * Gets the current value of any element with a type.
 * @override
 */
goog.dom.forms.getValue = function(el) {
  var type = el.type;
  if (!goog.isDef(type)) {
    return null;
  }
  switch (type.toLowerCase()) {
    case 'checkbox':
    case 'radio':
      return goog.dom.forms.getInputChecked_(el);
    case 'select-one':
      return goog.dom.forms.getSelectSingle_(el);
    case 'select-multiple':
      return goog.dom.forms.getSelectMultiple_(el);
    default:
      // TODO: Проверка на класс вероятно может глючить где-то, но так
      // эмуляция placeholder'а соответствует нативной.
      var ph = bru.events.NATIVE_PLACEHOLDER ? null : el.getAttribute('placeholder');
      return goog.isDef(el.value) ?
          ph && el.value == ph && goog.dom.classes.has(el, 'placeholder') ?
          '' : el.value : null;
  }
};


/**
 * Sets the current value of any element with a type.
 * @override
 */
goog.dom.forms.setValue = function(el, opt_value) {
  var type = el.type;
  if (goog.isDef(type)) {
    switch (type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        goog.dom.forms.setInputChecked_(el,
            /** @type {string} */ (opt_value));
        break;
      case 'select-one':
        goog.dom.forms.setSelectSingle_(el,
            /** @type {string} */ (opt_value));
        break;
      case 'select-multiple':
        goog.dom.forms.setSelectMultiple_(el,
            /** @type {Array} */ (opt_value));
        break;
      default:
        el.value = goog.isDefAndNotNull(opt_value) ? opt_value : '';
        bru.events.actionFocusHandler.placeholder(el);
    }
  }
};
