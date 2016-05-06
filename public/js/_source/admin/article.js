goog.provide('driveadm.Article');

goog.require('driveadm.ArticleToolbar');
goog.require('driveadm.init');
goog.require('goog.dom');
goog.require('goog.events.EventHandler');
goog.require('driveadm.imageList');
goog.require('goog.ui.ac.Remote');
goog.require('goog.ui.ac.RenderOptions');
goog.require('goog.dom.selection');
goog.require('goog.events');
goog.require('goog.events.InputHandler');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.ui.ScrollFloater');


/**
 * @constructor
 */
driveadm.Article = function() {
  this.form_ = goog.dom.getElement('edit-form');

  this.text_ = this.form_['text'];

  driveadm.dispatcher.registerHandlers('article', {
    'urlbtn': this.onPreview_
    }, this);

  this.toolbar_ = new driveadm.ArticleToolbar();

  var pubsub = goog.pubsub.PubSub.getInstance();

  // Будем обновлять введенный url.
  var urlIh = new goog.events.InputHandler(this.form_['url']);
  goog.events.listen(urlIh, goog.events.InputHandler.EventType.INPUT, function(e) {
    goog.dom.getElement('article-url-link').href = e.target.value;
  });

  this.imglist_ = driveadm.imageList('edit-form',
      driveadm.Article.PHOTOS_PREFIX, driveadm.Article.PHOTOS_ID);

  this.imgWrapper_ = goog.dom.getElement(driveadm.Article.PHOTOS_ID);

  this.highlight_();
  var textIh = new goog.events.InputHandler(this.text_);
  goog.events.listen(textIh, goog.events.InputHandler.EventType.INPUT,
      this.highlight_, false, this);
  pubsub.subscribe('article-imagelist-highlight', this.highlight_, this);

  this.uploadedImages_ = this.getUploadedImages_();
  pubsub.subscribe('imagelist-sync', this.sync_, this);

  var ac = new goog.ui.ac.Remote('/tags.php',
      /** @type {Element} */ (goog.dom.getElement('article-tags')), true);

  pubsub.subscribe('imagelist-link', this.link_, this);

  this.col1_ = goog.dom.getElement('article-col-1');
  this.col2_ = goog.dom.getElement('article-col-2');
  this.vsm_ = new goog.dom.ViewportSizeMonitor();
  this.resize_();
  goog.events.listen(this.vsm_, goog.events.EventType.RESIZE, this.resize_, false, this);

  this.floater_ = new goog.ui.ScrollFloater(goog.dom.getElement('article-text-holder'));
  goog.events.listen(this.floater_, goog.ui.ScrollFloater.EventType.FLOAT,
      this.onFloat_, false, this);
  this.floater_.decorate(goog.dom.getElement('article-text-wrapper'));

  setTimeout(goog.bind(this.resize_, this), 100);
};


/**
 * @type {string}
 */
driveadm.Article.PHOTOS_ID = 'article-articlephotos';


/**
 * @type {string}
 */
driveadm.Article.PHOTOS_PREFIX = 'articlephotos';


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
driveadm.Article.prototype.onPreview_ = function(context) {
  window.open(goog.dom.getElement('article-url').value, '_blank');
};


/**
 * @param {goog.events.BrowserEvent=} opt_e
 * @private
 */
driveadm.Article.prototype.highlight_ = function(opt_e) {
  var text = this.text_.value;
  var re = /\[img\sid\="?(\d+)"?\]/igm;
  var m;
  var images = new goog.structs.Map();

  while (m = re.exec(text)) {
    images.set(m[1], re.lastIndex);
  }

  var els = goog.dom.getElementsByClass('imagelist-item', this.imgWrapper_);
  var el;
  for (var i = 0; el = els[i]; i++) {
    goog.dom.classlist.enable(el, 'imagelist-item-active', images.containsKey(i + 1));
  }
};


/**
 * @param {goog.events.BrowserEvent=} opt_e
 * @private
 */
driveadm.Article.prototype.resize_ = function(opt_e) {
  this.text_.style.height = (this.vsm_.getSize().height - 38) + 'px';
};


/**
 * @param {goog.events.BrowserEvent} e
 * @private
 */
driveadm.Article.prototype.onFloat_ = function(e) {
  goog.dom.getElement('article-text-holder').style.height =
      goog.dom.getElement('article-text-wrapper').offsetHeight + 'px';
};


/**
 * @return {Array.<string>}
 * @private
 */
driveadm.Article.prototype.getUploadedImages_ = function() {
  var uploadedImages = [];
  for (var i = 1, imgField; imgField =
        this.form_[driveadm.Article.PHOTOS_PREFIX + '-' + i]; i++) {
    uploadedImages[i - 1] = imgField.value;
  }
  return uploadedImages;
};


/**
 * @private
 */
driveadm.Article.prototype.sync_ = function() {
  var newUploadedImages = this.getUploadedImages_();

  var text = this.text_.value;
  var re = /\[img\sid\="?(\d+)"?\]/igm;
  var match;
  var newText = [];
  var start = 0;
  while (match = re.exec(text)) {
    var l = match[0].length;
    var id = this.uploadedImages_[match[1] - 1];
    var pos = goog.array.indexOf(newUploadedImages, id);
    var newNumber = match[0];
    newNumber = match[0].replace(/\d+/, pos >= 0 ? '' + (pos + 1) : '');
    newText.push(text.substring(start, re.lastIndex - l), newNumber);
    start = re.lastIndex;
  }
  newText.push(text.substring(start));

  var scrollTop = this.text_.scrollTop;
  var selectionPos = goog.dom.selection.getEndPoints(this.text_);
  this.text_.value = newText.join('');
  goog.dom.selection.setStart(this.text_, selectionPos[0]);
  goog.dom.selection.setEnd(this.text_, selectionPos[1]);
  this.text_.scrollTop = scrollTop;

  this.highlight_();
  this.uploadedImages_ = newUploadedImages;
};


/**
 * @param {string} index
 * @private
 */
driveadm.Article.prototype.link_ = function(index) {
  this.toolbar_.insert('[img id=' + index + ']', '[/img]', true);
  this.highlight_();
};


/**
 * Export
 */
goog.exportSymbol('drvadm.Article', driveadm.Article);