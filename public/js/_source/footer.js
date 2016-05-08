goog.provide('drive.Footer');

goog.require('drive.init');
goog.require('drive.config');
goog.require('goog.dom');



/**
 * @constructor
 */
drive.Footer = function() {
  drive.dispatcher.registerHandlers('footer', {
      'totop': this.onToTop_
      });
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.Footer.prototype.onToTop_ = function(context) {
  window.scrollTo(0, 0);
};


/**
 * Init
 */
drive.dispatcher.registerLoader('footer', function() {new drive.Footer();});
