goog.provide('drive.Packs');

goog.require('bru.ui.bubble');
goog.require('goog.dom');
goog.require('goog.dom.dataset');



/**
 * @param {...string} var_args Пары id-текст для тултипов комплектаций.
 * @constructor
 */
drive.Packs = function(var_args) {

  this.packs_ = new goog.structs.Map();
  for (var i = 0, argLength = arguments.length; i < argLength; i += 2) {
		this.packs_.set(arguments[i], arguments[i + 1]);
  }

  drive.dispatcher.registerHandlers('pack', {'tooltip': this.onShow_}, this);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.Packs.prototype.onShow_ = function(context) {
  var el = context.getElement();
  var id = goog.dom.dataset.get(el, 'id');
  var html = '<div class="pack-tooltip">' + /** @type {string} */ (this.packs_.get(id)) + '</div>';

  bru.ui.bubble.bubble(el, html, bru.ui.Bubble.Type.ALERT, undefined, 'tooltip');
};


/**
 * Export
 */
goog.exportSymbol('drv.Packs', drive.Packs);
