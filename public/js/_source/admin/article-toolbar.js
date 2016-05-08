goog.provide('driveadm.ArticleToolbar');

goog.require('driveadm.init');
goog.require('goog.string');



/**
 * @constructor
 */
driveadm.ArticleToolbar = function() {
  this.form_ = goog.dom.getElement('edit-form');

  this.text_ = this.form_['text'];

  driveadm.dispatcher.registerHandlers('articletb', {
    'video': this.onVideo_,
    'image': this.onImage_,
    'drive': this.onDrive_,
    'symbols': this.onSymbols_,
    'link': this.onLink_,
    'blockquote': this.onBlockquote_,
    'h3': this.onH3_
    }, this);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
driveadm.ArticleToolbar.prototype.onVideo_ = function(context) {
  var url = prompt('Введите URL видеоролика или его id:');
  if (url) {
    this.insert('[video id=' + url + ']', '[/video]', true);
  }
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
driveadm.ArticleToolbar.prototype.onImage_ = function(context) {
  var id = prompt('Введите номер картинки:');
  if (!id) {
    return;
  }

  id = parseInt(id, 10);
  this.insert('[img id=' + (isNaN(id) ? '' : id) + ']', '[/img]', true);

  var pubsub = goog.pubsub.PubSub.getInstance();
  pubsub.publish('article-imagelist-highlight');
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
driveadm.ArticleToolbar.prototype.onLink_ = function(context) {
  var url = prompt('Введите URL:', 'http://');
  if (url) {
    this.insert('<a href="' + url + '">', '</a>');
  }
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
driveadm.ArticleToolbar.prototype.onBlockquote_ = function(context) {
  this.insert('<blockquote>', '</blockquote>', true);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
driveadm.ArticleToolbar.prototype.onH3_ = function(context) {
  this.insert('<h3>', '</h3>', true);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
driveadm.ArticleToolbar.prototype.onDrive_ = function(context) {
  this.insert('[DRIVE]', '');
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
driveadm.ArticleToolbar.prototype.onSymbols_ = function(context) {
  if (this.popup_) {
    return;
  }

  var button = context.getElement();
  var popupEl = goog.dom.getElement('admin-symbols');
  goog.style.setUnselectable(popupEl, true, true);

  var popup = new goog.ui.Popup(popupEl);
  this.popup_ = popup;
  popup.setHideOnEscape(true);
  popup.setAutoHide(true);
  popup.setPinnedCorner(goog.positioning.Corner.TOP_RIGHT);
  popup.setPosition(new goog.positioning.AnchoredPosition(button, goog.positioning.Corner.BOTTOM_RIGHT));
  popup.setMargin(2, 0, 0, 0);

  var key = goog.events.listen(popup.getElement(), goog.events.EventType.CLICK, goog.bind(function(e) {
    var el = e.target;
    el = goog.dom.getAncestorByTagNameAndClass(el, 'LI');
    if (el) {
      this.insert(el.innerHTML, '');
      popup.setVisible(false);
    }
  }, this));

  goog.events.listenOnce(popup, goog.ui.PopupBase.EventType.HIDE, goog.bind(function(e) {
    goog.events.unlistenByKey(key);
    popup.dispose();
    this.popup_ = null;
  }, this));

  popup.setVisible(true);
};


/**
 * @param {string} start
 * @param {string} end
 * @param {boolean=} opt_paragraph
 */
driveadm.ArticleToolbar.prototype.insert = function(start, end, opt_paragraph) {
  var selectionPos = goog.dom.selection.getEndPoints(this.text_);
  var selectionText = goog.dom.selection.getText(this.text_);
  var startDelta = 0;
  var delta = 0;
  var scrollTop = this.text_.scrollTop;

  if (opt_paragraph) {
    var text = this.text_.value;
    var beforeText = text.substring(0, selectionPos[0]);
    var afterText = text.substring(selectionPos[1]);

    // trimRight
    var t = beforeText.replace(/[\s\xa0\n\r]+$/, '');
    startDelta = beforeText.length - t.length;
    beforeText = t;

    // trimLeft
    afterText = afterText.replace(/^[\s\xa0\n\r]+/, '');

    // trim
    t = selectionText.replace(/^[\s\xa0\n\r]+|[\s\xa0\n\r]+$/g, '');
    delta = selectionText.length - t.length;
    selectionText = t;

    start = '\n\n' + start;
    end += '\n\n';

    this.text_.value = beforeText + start + selectionText + end + afterText;
  } else {
  goog.dom.selection.setText(this.text_, selectionPos[0] == selectionPos[1] ?
        selectionText + start + end :
        start + selectionText + end);
  }
  goog.dom.selection.setStart(this.text_, selectionPos[0] + start.length - startDelta);
  goog.dom.selection.setEnd(this.text_, selectionPos[1] + start.length - startDelta - delta);
  this.text_.scrollTop = scrollTop;

  this.text_.focus();
};
