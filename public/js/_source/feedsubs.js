goog.provide('drive.FeedSubs');

goog.require('drive.init');
goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.style');
goog.require('goog.net.cookies');



/**
 * @constructor
 */
drive.FeedSubs = function() {
  this.wrapper_ = goog.dom.getElementByClass('feedsub');
  if (!this.wrapper_) {
    return;
  }
  if (goog.net.cookies.get('.feedsubs')) {
    goog.dom.removeNode(this.wrapper_);
    return;
  }
  drive.dispatcher.registerHandlers('feedsubs', {
    'subs': this.onSubs_,
    'close': this.onClose_
  }, this);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.FeedSubs.prototype.onSubs_ = function(context) {
  var button = context.getElement();
  window.open(button.href);
  this.onClose_();
};


/**
 * @param {goog.jsaction.Context=} opt_context
 * @private
 */
drive.FeedSubs.prototype.onClose_ = function(opt_context) {
  goog.net.cookies.set('.feedsubs', '1', 30 * 24 * 60 * 60, '/',
      document.location.hostname);
  goog.dom.removeNode(this.wrapper_);
};


/**
 * Export
 */
goog.exportSymbol('drv.FeedSubs', drive.FeedSubs);
