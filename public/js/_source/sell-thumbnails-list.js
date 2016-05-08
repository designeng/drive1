goog.provide('drive.sell.ThumbnailsList');

goog.require('drive.init');
goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.net.ImageLoader');
goog.require('goog.fx.css3.Transition');
goog.require('goog.reflect');



/**
 * @constructor
 */
drive.sell.ThumbnailsList = function() {
  drive.dispatcher.registerHandlers('ithlist', {
    'show': this.onShow_
  }, this);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.sell.ThumbnailsList.prototype.onShow_ = function(context) {
  if (!this.lastEl_) {
    var parent = /** @type {Element} */ (context.getElement().parentNode);
    this.lastEl_ = goog.dom.getFirstElementChild(parent);
    goog.style.setUnselectable(parent, true);
  }
  if (this.lastEl_ == context.getElement()) {
    return;
  }
  goog.dom.classlist.remove(this.lastEl_, 'sell-thumbnails-item-active');
  this.lastEl_ = context.getElement();
  goog.dom.classlist.add(this.lastEl_, 'sell-thumbnails-item-active');
  this.preload_(/** @type {string} */ (goog.dom.dataset.get(this.lastEl_, 'url')));
};


/**
 * @param {string} url
 * @private
 */
drive.sell.ThumbnailsList.prototype.preload_ = function(url) {
  if (this.loader_) {
    this.loader_.dispose();
  }

  this.loader_ = new goog.net.ImageLoader();
  this.loader_.addImage('zoom', url);

  goog.events.listenOnce(this.loader_, goog.events.EventType.LOAD, this.onLoad_, false, this);
  goog.events.listenOnce(this.loader_, goog.net.EventType.COMPLETE, function() {
    this.loader_.dispose();
  }, false, this);

  this.loader_.start();
};


/**
 * @param {goog.events.Event} e The event.
 * @private
 */
drive.sell.ThumbnailsList.prototype.onLoad_ = function(e) {
  var image = e.target;
  var url = image.src;
  if (!image.id || !url) {
    return;
  }

  if (this.transition_) {
    this.transition_.dispose();
  }

  var overlay = goog.dom.getElement('sell-image-overlay');
  overlay.style.opacity = 0;
  overlay.innerHTML = '<img src="' + url + '">';

  goog.reflect.sinkValue(overlay.offsetHeight);

  this.transition_ = new goog.fx.css3.Transition(overlay, .3,
      {opacity: 0}, {opacity: 1}, 'opacity .3s ease-out');

  goog.events.listenOnce(this.transition_, goog.fx.Transition.EventType.END, this.onEnd_, false, this);

  this.transition_.play();
};


/**
 * @param {goog.events.Event} e The event.
 * @private
 */
drive.sell.ThumbnailsList.prototype.onEnd_ = function(e) {
  var overlay = goog.dom.getElement('sell-image-overlay');
  var img = overlay.firstChild;

  goog.dom.getElement('ith-image').src = img.src;
};


/**
 * Init
 */
drive.dispatcher.registerLoader('ithlist', function() {
  new drive.sell.ThumbnailsList();
});
