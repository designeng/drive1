goog.provide('drive.sell.loadInfo');

goog.require('drive.init');
goog.require('goog.dom');
goog.require('goog.dom.dataset');



/**
 *
 */
drive.sell.loadInfo = function() {
  drive.dispatcher.registerHandlers('sell', {
    'showtel': drive.sell.loadInfo.onShowTel_
  });
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.sell.loadInfo.onShowTel_ = function(context) {
	var el = context.getElement();

  var q = new goog.Uri.QueryData();
  q.add('mode', 'tel');
  q.add('id', goog.dom.dataset.get(el, 'id'));
  drive.xhr.send(drive.XhrRequests.SELL_INFO, q, function(data, el) {
    el.parentNode.innerHTML = data['html'];
  }, undefined, true, undefined, el);
};


/**
 * Init
 */
drive.sell.loadInfo();
