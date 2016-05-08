goog.provide('bru.form.Validator');
goog.provide('bru.form.ValidatorInfo');

goog.require('bru.locale');
goog.require('bru.style');
goog.require('bru.ui.bubble');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.dom.forms');



/**
 * @typedef {Array.<string|Array.<string|number|RegExp|Function>>}
 */
bru.form.ValidatorInfo;


/**
 * @constructor
 */
bru.form.Validator = function() {
};
goog.addSingletonGetter(bru.form.Validator);


/**
 * @type {!Object.<number, Array.<bru.form.ValidatorInfo>>}
 * @private
 */
bru.form.Validator.entries_ = {};


/**
 * @type {RegExp}
 * @private
 */
bru.form.Validator.EMAIL_PATTERN_ = /^[a-zA-Z0-9\-_\.\+]+\@(?:(?:[a-zA-Z0-9-])+\.)+[a-zA-Z]+$/;


/**
 * @type {RegExp}
 * @private
 */
bru.form.Validator.URL_PATTERN_ = /^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i;


/**
 * @param {string|Element} form
 * @param {...bru.form.ValidatorInfo} var_args
 */
bru.form.Validator.addRules = function(form, var_args) {
  form = /** @type {HTMLFormElement} */ (goog.dom.getElement(form));
  if (!form) {
    return;
  }
  var uid = goog.getUid(form);
  var rules = goog.array.slice(arguments, 1);
  if (!bru.form.Validator.entries_.hasOwnProperty(uid)) {
    bru.form.Validator.entries_[uid] = [];
  }
  Array.prototype.push.apply(bru.form.Validator.entries_[uid], rules);
};


/**
 * @param {string|Element} form
 * @param {...string|number|RegExp|Function} var_args
 */
bru.form.Validator.addRule = function(form, var_args) {
  var rule = goog.array.slice(arguments, 1);
  bru.form.Validator.addRules(form, rule);
};


/**
 * @param {string|Element} form
 * return {Array.<!Object.<number, Array.<bru.form.ValidatorInfo>>>}
 */
bru.form.Validator.getRules = function(form) {
  form = /** @type {HTMLFormElement} */ (goog.dom.getElement(form));
  var uid = goog.getUid(form);
  var ret = [];
  if (bru.form.Validator.entries_.hasOwnProperty(uid)) {
    ret = bru.form.Validator.entries_[uid];
  }
  return ret;
};


/**
 * Публичный алиас goog.dom.forms.getValue для использования
 * в кастомных функциях валидации.
 * Если указана форма, то ищется значение по имени, удобно для radio.
 * @param {Element|string} el
 * @param {HTMLFormElement=} opt_form
 * @return {string|Array.<string>|null}
 */
bru.form.Validator.prototype.getValue = function(el, opt_form) {
  /** @preserveTry */
  try {
    return opt_form ?
        goog.dom.forms.getValueByName(opt_form, /** @type {string} */ (el)) :
        goog.dom.forms.getValue(/** @type {Element} */ (el));
  } catch (ex) {
    return null;
  }
};


/**
 * @param {HTMLFormElement} form
 * @return {boolean}
 */
bru.form.Validator.prototype.isValidForm = function(form) {
  var rules = bru.form.Validator.getRules(form);
  for (var i = 0, rule; rule = rules[i]; i++) {
    var field = /** @type {string} */ (rule[0]);
    var el = form[field] || goog.dom.getElement(field);
    if (!this.validateRule_(form, i)) {
      return false;
    }
  }
  return true;
};


/**
 * @param {HTMLFormElement} form
 * @param {number} index
 * @return {boolean}
 * @private
 */
bru.form.Validator.prototype.validateRule_ = function(form, index) {
  var rule = bru.form.Validator.getRules(form)[index];

  var field = /** @type {string} */ (rule[0]);
  var msg = /** @type {string} */ (rule[1]);
  var command = /** @type {string|number|RegExp|Function} */ (rule[2]);
  var el = form[field] || goog.dom.getElement(field);
  var val = '';
  if (el) {
    /** @preserveTry */
    try {
      val = goog.dom.forms.getValue(el) || goog.dom.forms.getValueByName(form, field);
    } catch (ex) {}
  } else {
    // Если элемента нет, то считаем что все хорошо. В любом случае
    // нет элемента к которому можно привязать сообщение об ошибке.
    return true;
  }

  var ret = true;

  if (command == 'max' ||
      command == 'min' ||
      command == 'min' ||
      command == 'minlength' ||
      command == 'maxlength' ||
      command == 'equal' ||
      command == 'pattern') {
    bru.form.Validator.getParam_(rule, 3, el, /** @type {string} */ (command));
  }

  if (command == 'minmaxlength') {
    bru.form.Validator.getParam_(rule, 3, el, 'minlength');
    bru.form.Validator.getParam_(rule, 4, el, 'maxlength');
  }

  if (command == 'minmax') {
    bru.form.Validator.getParam_(rule, 3, el, 'min');
    bru.form.Validator.getParam_(rule, 4, el, 'max');
  }

  if (goog.isFunction(command)) {
    ret = command.call(this, form, el, val);
  } else {
    var pr = command.split('-');
    if (pr.length > 1) {
      command = pr[0];
      pr = pr[1];
    }
    if (command == 'required') {
      ret = !!val;
    } else if (command == 'max') {
      ret = val && +val <= rule[3];
    } else if (command == 'min') {
      ret = val && +val >= rule[3];
    } else if (command == 'minmax') {
      ret = val && +val >= rule[3] && +val <= rule[4];
    } else if (command == 'maxlength') {
      ret = val && val.length <= rule[3];
    } else if (command == 'minlength') {
      ret = val && val.length >= rule[3];
    } else if (command == 'minmaxlength') {
      ret = val && val.length >= rule[3] && val.length <= rule[4];
    } else if (command == 'equal') {
      ret = val == goog.dom.forms.getValueByName(form, rule[3]);
    } else if (command == 'pattern') {
      ret = val && new RegExp(rule[3]).test(val);
    } else if (command == 'email') {
      ret = val && bru.form.Validator.EMAIL_PATTERN_.test(val);
    } else if (command == 'url') {
      ret = val && bru.form.Validator.URL_PATTERN_.test(val);
    }
    if (pr) {
      var lastRule = rule[rule.length - 1];
      if (pr == 'if') {
        ret = goog.dom.forms.getValueByName(form, lastRule) ? ret : true;
      } else if (pr == 'or') {
        ret = !goog.dom.forms.getValueByName(form, lastRule) ? ret : true;
      }
    }
  }

  if (!ret) {
    // Для radio-кнопок и чекбоксов берем первую.
    if (el.length && el[0].type) {
      el = el[0];
    }
    // Показываем сообщение об ошибке.
    /** @preserveTry */
    try {
      bru.style.scrollToElement(el);
      el.focus();
    } catch (ex) {}
    val = goog.isArray(val) ? val[0] : val;
    msg = rule[1].replace('{value}', val);

    var lFormatParams = goog.array.slice(rule, 2);
    lFormatParams[0] = val && val.length ? val.length : 0;
    msg = bru.locale.lFormat(msg, lFormatParams);

    if (msg) {
      bru.ui.bubble.bubble(el, msg);
    }
  }

  return !!ret;
};


/**
 * @param {bru.form.ValidatorInfo} rule
 * @param {number} index
 * @param {Element} el
 * @param {string} command
 * @private
 */
bru.form.Validator.getParam_ = function(rule, index, el, command) {
  rule[index] = el.getAttribute(command) || goog.dom.dataset.get(el, command);
};


// Public methods export
goog.exportProperty(bru.form.Validator.prototype, 'getValue', bru.form.Validator.prototype.getValue);
