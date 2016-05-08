goog.provide('drive.Testdrives');

goog.require('drive.init');
goog.require('goog.dom');
goog.require('goog.dom.dataset');



/**
 * @constructor
 */
drive.Testdrives = function() {
  drive.dispatcher.registerHandlers('testdrives', {
    'more': this.onMore_
  }, this);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.Testdrives.prototype.onMore_ = function(context) {
  var button = context.getElement();
  var wrapper = goog.dom.getElement('testdrives-all');

  var images = wrapper.getElementsByTagName('IMG');
  for (var i = 0, image; image = images[i]; i++) {
    var src = goog.dom.dataset.get(image, 'src');
    if (src) {
      image.src = src;
      goog.dom.dataset.remove(image, 'src');
    }
  }

  goog.style.setElementShown(button, false);
  goog.style.setElementShown(wrapper, true);
};


/**
 * Init
 */
drive.dispatcher.registerLoader('testdrives', function() {new drive.Testdrives();});
