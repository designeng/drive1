goog.provide('drive.Definition');

goog.require('drive.init');
goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('bru.ui.bubble');



/**
 * @constructor
 */
drive.Definition = function() {
  drive.dispatcher.registerHandlers('def', {'tooltip': this.onShow_}, this);
};


/**
 * @type {string}
 * @private
 */
drive.Definition.PROPERTY_DEF_INITED_ = '__jsd';


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.Definition.prototype.onShow_ = function(context) {
  var el = context.getElement();
  var elData = goog.dom.dataset.getAll(el);
  var e = context.getEvent();
  var targetEl = e.target;

  if (!el[drive.Definition.PROPERTY_DEF_INITED_]) {
    el[drive.Definition.PROPERTY_DEF_INITED_] = true;
    var spansHtml = el.innerHTML.split(/\s/);
    el.innerHTML = '<span>' + spansHtml.join('</span> <span>') + '</span>';
    targetEl = document.elementFromPoint(e.clientX, e.clientY);
  }

  var url = elData['url'] ? ' <a target="_blank" href="' + elData['url'] + '"> Хотите знать больше?</a>' : '';
  var html = '<div class="def-tooltip">' +
      (elData['caption'] ? '<h6>' + elData['caption'] + '</h6>' : '') +
      '<p>' + elData['text'] + url + '</p>' +
      '</div>';

  bru.ui.bubble.bubble(/** @type {Element} */ (targetEl), html,
      bru.ui.Bubble.Type.ALERT, undefined, 'tooltip');
};


/**
 * Init
 */
new drive.Definition();
