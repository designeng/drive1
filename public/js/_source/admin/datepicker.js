goog.provide('driveadm.form.Datepicker');

goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.date');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimeParse');
goog.require('goog.i18n.DateTimeSymbols');
goog.require('goog.i18n.DateTimeSymbols_ru_RU');
goog.require('goog.ui.InputDatePicker');
goog.require('goog.ui.LabelInput');



/**
 * @param {string} field Field Id for datepicker.
 * @param {boolean=} birthday Birthday mode.
 * @constructor
 */
driveadm.form.Datepicker = function(field, birthday) {
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
};


/**
 * Export
 */
goog.exportSymbol('driveadm.Datepicker', driveadm.form.Datepicker);
