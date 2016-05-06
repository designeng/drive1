goog.provide('drive.Lightbox');

goog.require('drive.init');
goog.require('bru.ui.Lightbox');
goog.require('drive.spinner');
goog.require('goog.net.ImageLoader');
goog.require('goog.dom');



/**
 * @constructor
 */
drive.Lightbox = function() {
  drive.dispatcher.registerHandlers('lightbox', {'zoom': this.onZoom_}, this);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.Lightbox.prototype.onZoom_ = function(context) {
  var anchor = context.getElement();
  var zoomUrl = anchor.href;
  if (!zoomUrl) {
    zoomUrl = goog.dom.getAncestorByTagNameAndClass(anchor, 'a').href;
  }
  if (zoomUrl) {
    this.anchor_ = anchor;
    this.preload_(zoomUrl);
  }
};


/**
 * @param {string} url
 * @private
 */
drive.Lightbox.prototype.preload_ = function(url) {
  this.spinner_ = drive.spinner(this.anchor_);

  this.loader_ = new goog.net.ImageLoader();
  this.loader_.addImage('zoom', url);

  goog.events.listenOnce(this.loader_, goog.events.EventType.LOAD, this.onLoad_, false, this);
  goog.events.listenOnce(this.loader_, goog.net.EventType.COMPLETE, function() {
    this.spinner_.dispose();
    this.loader_.dispose();
  }, false, this);

  this.spinner_.start();
  this.loader_.start();
};


/**
 * @param {goog.events.Event} e The event.
 * @private
 */
drive.Lightbox.prototype.onLoad_ = function(e) {
  var image = e.target;
  var id = image.id;
  var url = image.src;
  if (!id || !url) {
    return;
  }

  this.lightbox_ = new bru.ui.Lightbox(this.anchor_);
  this.lightbox_.setImage(image.src, image.width, image.height);
  this.lightbox_.render();
  this.lightbox_.setVisible(true);

  drive.pubsub.publish(drive.Topics.LIGHTBOX_ZOOM, this.anchor_);
};


/**
 * Init
 */
new drive.Lightbox();
