goog.provide('bru.form.Datepicker');

goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimeParse');
goog.require('goog.ui.InputDatePicker');



/**
 * @param {string} field Field Id for datepicker.
 * @param {boolean=} birthday Birthday mode.
 * @constructor
 */
bru.form.Datepicker = function(field, birthday) {
  var el = goog.dom.getElement(field);
  var pattern = goog.dom.dataset.get(el, 'pattern') || 'dd-MM-yyyy';
  var formatter = new goog.i18n.DateTimeFormat(pattern);
  var parser = new goog.i18n.DateTimeParse(pattern);
  var idp = new goog.ui.InputDatePicker(formatter, parser);
  var dp = idp.getDatePicker();
  dp.setShowToday(false);
  dp.setAllowNone(false);
  dp.setShowWeekNum(false);
  dp.setUseBirthdayYearMenu(!!birthday);
  idp.decorate(el);

  /**
   * @type {goog.ui.InputDatePicker}
   */
  this.idp = idp;
};
