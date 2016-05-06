goog.provide('drive.Sberbank.Calc');

goog.require('bru.ui.Dialog');
goog.require('goog.dom');
goog.require('goog.dom.dataset');



/**
 * @param {string} brand
 * @param {string} model
 * @param {string=} opt_modification
 * @param {string=} opt_price
 * @constructor
 */
drive.Sberbank.Calc = function(brand, model, opt_modification, opt_price) {
  // Считаем показы.
  //drive.Sberbank.Calc.count_('//ad.adriver.ru/cgi-bin/rle.cgi?sid=1&bt=21&ad=326090&pid=776287&bid=1621666&bn=1621666&rnd=');

  //this.url_ = '//188.127.230.84/?v=drive&mode=open&brand=' + brand +
  //    '&model=' + model +
  //    (opt_modification ? '&modification=' + opt_modification : '') +
  //    (opt_price ? '&price=' + opt_price : '');

  //this.url_ = '//188.127.230.84/js/calc/new.drive.ru.js';

  drive.dispatcher.registerHandlers('sberbank', {'calc': this.onCalc_}, this);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.Sberbank.Calc.prototype.onCalc_ = function(context) {
  // Считаем "клики".
  drive.Sberbank.Calc.count_('//ad.adriver.ru/cgi-bin/rle.cgi?sid=1&bt=21&ad=367449&pid=989154&bid=2127526&bn=2127526&rnd=');

  var dialog = new bru.ui.Dialog();

  dialog.setContent('<iframe src="/sb.htm" width="400" height="625" frameBorder="0" scrolling="no"></iframe>');

  dialog.render();
  dialog.setVisible(true);
};


/**
 * @param {string} url
 * @private
 */
drive.Sberbank.Calc.count_ = function(url) {
  new Image().src = url +
      Math.floor(Math.random() * 2147483648).toString(36);
};


/**
 * Export
 */
goog.exportSymbol('drv.SbCalc', drive.Sberbank.Calc);
