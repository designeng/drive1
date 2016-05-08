goog.provide('drive.TopnavMisc');

goog.require('drive.config');
goog.require('goog.dom');



/**
 * @constructor
 */
drive.TopnavMisc = function() {
  drive.dispatcher.registerHandlers('topnav', {
      'misc': this.onToggle_,
      'close': this.onClose_
      }, this);
  drive.pubsub.subscribe(drive.Topics.BRANDSNAV_SHOW, this.onClose_, this);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.TopnavMisc.prototype.onToggle_ = function(context) {
  var button = context.getElement();
  goog.style.setUnselectable(button, true);
  var popupEl = goog.dom.getElement('topnav-misc');
  goog.style.setUnselectable(popupEl, true, true);

  var popup = new goog.ui.Popup(popupEl);
  this.popup_ = popup;
  popup.setHideOnEscape(true);
  popup.setAutoHide(true);
  popup.setPinnedCorner(goog.positioning.Corner.TOP_RIGHT);
  popup.setPosition(new goog.positioning.AnchoredPosition(button, goog.positioning.Corner.BOTTOM_RIGHT));

  goog.events.listenOnce(popup, goog.ui.PopupBase.EventType.HIDE, goog.bind(function(e) {
    popup.dispose();
    this.popup_ = null;
  }, this));

  popup.setVisible(true);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.TopnavMisc.prototype.onClose_ = function(context) {
  if (this.popup_) {
    this.popup_.setVisible(false);
  }
};


/**
 * Init
 */
drive.dispatcher.registerLoader('topnav', function() {new drive.TopnavMisc();});
