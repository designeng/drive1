goog.provide('drive.ErrorFeedback');

goog.require('drive.init');
goog.require('bru.ui.bubble');
goog.require('goog.dom');
goog.require('goog.dom.dataset');



/**
 * @constructor
 */
drive.ErrorFeedback = function() {
  drive.dispatcher.registerHandlers('errorfb', {
    'show': this.onShow_,
    'send': this.onSend_
  }, this);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.ErrorFeedback.prototype.onShow_ = function(context) {
  var target = context.getElement();
  var html = '<form data-keysubmit="1" data-action="submit:errorfb.send">' +
      'Опишите ошибку:<br><textarea name="text"></textarea>' +
      '<div class="error-feedback-bubble-buttons">' +
      '<span class="spin"></span><button name="sbtn" class="sbutton" type="submit">' +
      'Сообщить об ошибке</button></div></form>';
  var bubble = bru.ui.bubble.prompt(target, html,
      goog.positioning.Corner.TOP_RIGHT, 'tooltip error-feedback-bubble');
  bubble.getElement().getElementsByTagName('textarea')[0].focus();
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.ErrorFeedback.prototype.onSend_ = function(context) {
  bru.jsaction.util.preventDefault(context.getEvent());

  var form = context.getElement();
  var text = form['text'].value;
  if (!text) {
    return;
  }

  var q = new goog.Uri.QueryData();
  q.add('mode', 'build_error');
  q.add('url', document.location.href);
  q.add('text', text);

  drive.xhr.send(drive.XhrRequests.ERROR_FEEDBACK, q, function() {
    bru.ui.bubble.promptDispose();
  }, this, false, {
    anchor: form['sbtn'],
    spinner: drive.spinner(goog.dom.getElementByClass('spin', form))
  });
};


/**
 * Init
 */
new drive.ErrorFeedback();
