goog.provide('drive.forum.Comment');

goog.require('drive.init');
goog.require('bru.form.Validator');
goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.ui.Textarea');
goog.require('goog.ui.AnimatedZippy');
goog.require('goog.ui.Zippy');



/**
 * @constructor
 */
drive.forum.Comment = function() {
  drive.dispatcher.registerHandlers('forumcom', {
    'focus': this.onFocus_,
    'reply': this.onReply_,
    'submit': this.onSubmit_
  }, this);
};


/**
 * Active textareas.
 * @type {Object}
 * @private
 */
drive.forum.Comment.active_ = {};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.forum.Comment.prototype.onFocus_ = function(context) {
  var form = context.getElement();
  var uid = goog.getUid(form);
  if (!(uid in drive.forum.Comment.active_)) {
    var ta = form['text'];
    bru.form.Validator.addRule(form, 'text', '', 'required');

    var textarea = new goog.ui.Textarea(
        /** @type {string} */ (goog.dom.forms.getValue(ta)));
    textarea.setMinHeight(ta.offsetHeight);
    textarea.decorate(ta);
    drive.forum.Comment.active_[uid] = textarea;
  }
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.forum.Comment.prototype.onReply_ = function(context) {
  var originalForm = goog.dom.getElement('forum-comments-addform');
  if (!originalForm) {
    return;
  }

  var button = context.getElement();
  goog.style.setUnselectable(button, true);
  var id = goog.dom.dataset.get(button, 'id');

  if (this.tmpZippy_ || (this.formZippy_ && this.formZippy_.isBusy())) {
    return;
  }
  // Форма ответа на этот комментарий уже открыта.
  if (id == this.replyId_) {
    this.closeForm_();
    return;
  }

  var parent = goog.dom.getAncestorByClass(button, 'forum-comments-item');
  var nextSibling = goog.dom.getNextElementSibling(parent);

  var form = originalForm.cloneNode(true);
  var ta = form['text'];
  goog.dom.classlist.add(form, 'forum-comments-addform-level2');
  form['commentid'].value = id;
  ta.style.height = '60px';
  ta.removeAttribute('placeholder');
  ta.value = '';
  goog.dom.insertSiblingAfter(form, parent);


  this.tmpZippy_ = new goog.ui.AnimatedZippy(null, form, false);
  this.tmpZippy_.animationDuration = 300;

  goog.events.listen(this.tmpZippy_, goog.ui.Zippy.Events.TOGGLE, function(e) {
    if (e.target.isExpanded()) {
      form.parentNode.style.overflow = 'visible';
      ta.focus();
      this.replyId_ = id;
      this.formZippy_ = this.tmpZippy_;
      this.tmpZippy_ = null;
    } else if (this.formZippy_) {
      var el = this.formZippy_.getContentElement();
      goog.dispose(this.formZippy_);
      goog.dom.removeNode(el.parentNode);
      this.formZippy_ = null;
    }
  }, false, this);

  this.closeForm_();
  this.tmpZippy_.setExpanded(true);
};


/**
 * @private
 */
drive.forum.Comment.prototype.closeForm_ = function() {
  if (!this.formZippy_) {
    return;
  }
  this.replyId_ = null;
  this.formZippy_.getContentElement().parentNode.style.overflow = 'hidden';
  this.formZippy_.setExpanded(false);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.forum.Comment.prototype.onSubmit_ = function(context) {
  bru.jsaction.util.preventDefault(context.getEvent());
  var form = context.getElement();
  var button = form.getElementsByTagName('button')[0];

  var q = new goog.Uri.QueryData(goog.dom.forms.getFormDataString(
      /** @type {HTMLFormElement} */ (form)));
  drive.xhr.send(
      drive.XhrRequests.FORUM_COMMENT, q,
      this.submitCallback_, this, false, {
        anchor: button
      }, form);
};


/**
 * @param {*} data
 * @param {Element} form
 * @private
 */
drive.forum.Comment.prototype.submitCallback_ = function(data, form) {
  var el = goog.dom.createElement('div');
  el.innerHTML = data['html'];
  var item = /** @type {Element} */ (el.firstChild);
  if (data['reply'] == 1) {
    goog.dom.classlist.add(item, 'forum-comments-item-level2');
    goog.dom.insertSiblingAfter(item, form.parentNode);
    this.closeForm_();
  } else {
    goog.dom.insertSiblingBefore(item, form);
    goog.dom.insertSiblingBefore(goog.dom.createDom('div', {'class': 'hr', html: 'hr'}), form);
  }

  goog.dom.forms.setValue(form['text'], '');

  /*
  var zippy = new goog.ui.AnimatedZippy(null, item, false);
  zippy.animationDuration = 300;

  goog.events.listen(formZippy, goog.ui.Zippy.Events.TOGGLE, function(e) {
    zippy.dispose();
    item.parentNode.style.overflow = 'visible';
  });

  zippy.setExpanded(true);
  */
};


/**
 * Init
 */
new drive.forum.Comment();
