goog.provide('drive.Poll');

goog.require('drive.init');
goog.require('goog.dom');
goog.require('goog.dom.dataset');



/**
 * @constructor
 */
drive.Poll = function() {
  drive.dispatcher.registerHandlers('poll', {
    'vote': this.onVote_
  }, this);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.Poll.prototype.onVote_ = function(context) {
  var button = context.getElement();
  var element = goog.dom.getAncestorByClass(button, 'poll');

  var q = new goog.Uri.QueryData();
  q.add('mode', 'sowhat');
  q.add('id', goog.dom.dataset.get(element, 'id'));
  q.add('option', button.value);

  drive.xhr.send(
      drive.XhrRequests.POLL, q,
      this.voteCallback_, this, true, {
        anchor: button
      }, button, element);
};


/**
 * @param {*} data
 * @param {Element} button
 * @param {Element} element
 * @private
 */
drive.Poll.prototype.voteCallback_ = function(data, button, element) {
  console.info("data:::::", data);
  var html = data['html'];
  if (!html) {
    return;
  }

  var newElement = goog.dom.htmlToDocumentFragment(html);
  goog.dom.insertSiblingBefore(newElement, element);
  goog.dom.removeNode(element);
};


/**
 * Init
 */
drive.dispatcher.registerLoader('poll', function() {new drive.Poll();});
