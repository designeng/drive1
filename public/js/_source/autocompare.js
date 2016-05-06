goog.provide('drive.Autocompare');

goog.require('drive.init');
goog.require('bru.ui.bubble');
goog.require('goog.dom');
goog.require('goog.dom.dataset');



/**
 * @constructor
 */
drive.Autocompare = function() {
  this.hidden_ = true;

  drive.dispatcher.registerHandlers('autocompare', {'toggle': this.onToggle_}, this);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.Autocompare.prototype.onToggle_ = function(context) {
  if (!this.equalCache_) {
    this.equalCache_ = goog.dom.getElementsByClass('autocompare-equal',
        goog.dom.getElement('autocompare-table'));
  }

  bru.ui.bubble.dispose();

  var target = context.getElement();
  goog.style.setUnselectable(target, true);

  var oldText = target.innerHTML;
  target.innerHTML = goog.dom.dataset.get(target, 'alttext');
  goog.dom.dataset.set(target, 'alttext', oldText);

  for (var i = 0, el; el = this.equalCache_[i]; i++) {
    goog.dom.classlist.enable(el, 'hidden', !this.hidden_);
  }

  this.hidden_ = !this.hidden_;
};


/**
 * Init
 */
new drive.Autocompare();
