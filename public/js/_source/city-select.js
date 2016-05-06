goog.provide('drive.CitySelect');

goog.require('goog.events');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.positioning.ClientPosition');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.AnchoredViewportPosition');
goog.require('goog.ui.Popup');
goog.require('goog.net.cookies');



/**
 * @constructor
 */
drive.CitySelect = function() {
  var cookieCity = goog.net.cookies.get(drive.CitySelect.COOKIE_NAME);
  if (cookieCity) {
    drive.CitySelect.setCookie_(cookieCity);
    var wrapper = goog.dom.getElement('city');
    var city = goog.dom.getFirstElementChild(wrapper);
    city.innerHTML = decodeURIComponent(cookieCity.split(',')[0]);
  }
  drive.dispatcher.registerHandlers('citysel', {
      'show': this.onShow_,
      'close': this.onClose_}, this);
};


/**
 * @type {string}
 */
drive.CitySelect.COOKIE_NAME = 'city';


/**
 * @type {number}
 */
drive.CitySelect.COOKIE_MAXAGE = 365 * 24 * 60 * 60;


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.CitySelect.prototype.onShow_ = function(context) {
  if (this.popup_) {
    return;
  }

  var button = context.getElement();
  var popupEl = goog.dom.getElement('city-sel');
  goog.style.setUnselectable(popupEl, true, true);
  var anchor = goog.dom.getElementByClass('i', button);

  var popup = new goog.ui.Popup(popupEl);
  this.popup_ = popup;
  popup.setHideOnEscape(true);
  popup.setAutoHide(true);
  popup.setPinnedCorner(goog.positioning.Corner.TOP_RIGHT);
  popup.setPosition(new goog.positioning.AnchoredPosition(anchor, goog.positioning.Corner.TOP_RIGHT));
  popup.setMargin(-7, -8, 0, 0);

  var key = goog.events.listen(popup.getElement(), goog.events.EventType.CLICK, function(e) {
    var el = e.target;
    if (el.nodeName == 'LI') {
      var cityName = el.innerHTML;
      var cityId = goog.dom.dataset.get(el, 'value');
      drive.CitySelect.setCookie_(encodeURIComponent(cityName) + ',' + cityId);
      var city = goog.dom.getFirstElementChild(button);
      city.innerHTML = cityName;
      popup.setVisible(false);
      window.location.reload(true);
    }
  });

  goog.events.listenOnce(popup, goog.ui.PopupBase.EventType.HIDE, goog.bind(function(e) {
    goog.events.unlistenByKey(key);
    popup.dispose();
    this.popup_ = null;
  }, this));

  popup.setVisible(true);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.CitySelect.prototype.onClose_ = function(context) {
  if (this.popup_) {
    this.popup_.setVisible(false);
  }
};


/**
 * @param {string} value
 * @private
 */
drive.CitySelect.setCookie_ = function(value) {
  goog.net.cookies.set(drive.CitySelect.COOKIE_NAME,
  value, drive.CitySelect.COOKIE_MAXAGE, '/'/*, 'drive.ru'*/);
};


/**
 * Export
 */
goog.exportSymbol('drv.City', drive.CitySelect);
