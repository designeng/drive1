goog.provide('drive.forum.Thread');

goog.require('drive.init');
goog.require('bru.form.Validator');
goog.require('goog.ui.Textarea');
goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.style');
goog.require('goog.ui.AnimatedZippy');
goog.require('goog.ui.Zippy');



/**
 * @constructor
 */
drive.forum.Thread = function() {
  drive.dispatcher.registerHandlers('forumth', {
    'more': this.onMoreThreads_,
    'show': this.onShow_,
    'focus': this.onFocus_
  }, this);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.forum.Thread.prototype.onMoreThreads_ = function(context) {
  var el = context.getElement();
  var q = new goog.Uri.QueryData();
  q.add('since', goog.dom.dataset.get(el, 'since'));
  drive.xhr.send(drive.XhrRequests.FORUM, q, this.insertThreads_, this, false, {
    url: document.location.href,
    silent: true
  }, el);
};


/**
 * @param {*} data
 * @param {!Element} element
 * @private
 */
drive.forum.Thread.prototype.insertThreads_ = function(data, element) {
  var list = goog.dom.getElement('forum-threads-list');
  for (var i = 0, item, since; item = data[i]; i++) {
    var el = goog.dom.createElement('LI');
    el.innerHTML = '<a href="' + item['url'] + '">' + item['text'] +
        '</a>&nbsp;<span class="reply-num">' + item['num'] + '</span>';
    list.appendChild(el);
    since = item['time'];
  }
  if (since) {
    goog.dom.dataset.set(element, 'since', since);
  }
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.forum.Thread.prototype.onShow_ = function(context) {
  var buttonWrapper = /** @type {Element} */ (context.getElement().parentNode);
  var formWrapper = goog.dom.getNextElementSibling(buttonWrapper);

  var buttonZippy = new goog.ui.AnimatedZippy(null, buttonWrapper, true);
  var formZippy = new goog.ui.AnimatedZippy(null, formWrapper, false);
  goog.style.setElementShown(formWrapper, true);
  buttonZippy.animationDuration = 300;
  formZippy.animationDuration = 400;

  goog.events.listen(formZippy, goog.ui.Zippy.Events.TOGGLE, function(e) {
    goog.dom.getElement('th-text').focus();
    buttonZippy.dispose();
    formZippy.dispose();
    formWrapper.parentNode.style.overflow = 'visible';
  });

  buttonZippy.setExpanded(false);
  formZippy.setExpanded(true);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.forum.Thread.prototype.onFocus_ = function(context) {
  if (this.ta_) {
    return;
  }

  var form = context.getElement();
  var ta = form['text'];
  bru.form.Validator.addRule(form, 'header', 'Введите заголовок темы', 'required');
  bru.form.Validator.addRule(form, 'text', 'Введите текст темы', 'required');
  if (form['tag']) {
    bru.form.Validator.addRule(form, 'tag', 'Выберите подраздел', 'required');
  }

  this.ta_ = new goog.ui.Textarea(
      /** @type {string} */ (goog.dom.forms.getValue(ta)));
  this.ta_.setMinHeight(ta.offsetHeight);
  this.ta_.decorate(ta);
};


/**
 * Init
 */
new drive.forum.Thread();
