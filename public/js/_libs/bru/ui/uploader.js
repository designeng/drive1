goog.provide('bru.ui.Uploader');

goog.require('goog.Disposable');


/**
 * @constructor
 * @param {string} url Url аплоадера.
 * @extends {goog.Disposable}
 */
bru.ui.Uploader = function(url) {
  goog.Disposable.call(this);

  /**
   * Url аплоадера.
   * @type {string}
   * @private
   */
  this.url_ = url;
};
goog.inherits(bru.ui.Uploader, goog.Disposable);




/** @inheritDoc */
bru.ui.Uploader.prototype.disposeInternal = function() {
  bru.ui.Uploader.superClass_.disposeInternal.call(this);

};
