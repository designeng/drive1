goog.provide('drive.PriceCalc');

goog.require('bru.string');
goog.require('drive.init');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.ui.ScrollFloater');



/**
 * @constructor
 * @param {number} basePrice
 */
drive.PriceCalc = function(basePrice) {
  this.element_ = goog.dom.getElement('build-price-final');
  this.basePrice_ = basePrice;
  this.form_ = goog.dom.getElement('build-info');
  this.calc();
  goog.events.listen(this.form_, goog.events.EventType.CLICK, this.onClick_, false, this);
};


/**
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
drive.PriceCalc.prototype.onClick_ = function(e) {
  var target = e.target;
  if (target.type == 'checkbox' && !target.disabled) {
    var packId = target.value.split(':')[1];
    if (packId) {
      var els = this.form_.elements;
      for (var i = 0, el; el = els[i]; i++) {
        if (!el.disabled) {
          var price = el.value.split(':');
          if (price[1] == packId) {
            el.checked = target.checked;
          }
        }
      }
    }
    this.calc();
  }
};


/**
 * Считаем и обновляем цену.
 */
drive.PriceCalc.prototype.calc = function() {
  var selectedPacks = [];
  var els = this.form_.elements;
  var addPrice = 0;
  for (var i = 0, el; el = els[i]; i++) {
    if (!el.disabled && el.checked) {
      var price = el.value.split(':');
      var packId = price[1] || null;
      if (!packId) {
        addPrice += Number(price[0]);
      } else if (!goog.array.contains(selectedPacks, packId)) {
        selectedPacks.push(packId);
        addPrice += Number(price[0]);
      }
    }
  }

  goog.dom.getElement('build-price-val-delta').innerHTML =
      bru.string.formatMoney(addPrice);
  goog.dom.getElement('build-price-val').innerHTML =
      bru.string.formatMoney(this.basePrice_ + addPrice);
  goog.dom.classlist.enable(goog.dom.getElement('build-price-base'),
      'build-price-item-final', !addPrice);
  goog.style.setElementShown(goog.dom.getElement('build-price-wpacks'), addPrice);

  if (!this.floater_ && addPrice) {
    this.floater_ = new goog.ui.ScrollFloater();
    this.floater_.decorate(this.element_);
  }
  if (this.floater_) {
    this.floater_.setScrollingEnabled(addPrice);
  }
};


/**
 * Export
 */
goog.exportSymbol('drv.PriceCalc', drive.PriceCalc);
