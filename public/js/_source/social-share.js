goog.provide('drive.SocialShare');

goog.require('bru.jsaction.EventContract');
goog.require('bru.window');
goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.style');



/**
 * Like
 * @constructor
 */
drive.SocialShare = function() {
  this.isVisible_ = false;

  drive.dispatcher.registerHandlers('socialshare', {
    'toggle': this.onToggle_,
    'share': this.onShare_
  }, this);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.SocialShare.prototype.onToggle_ = function(context) {
  var container = goog.dom.getElementByClass('js-social-share-list');
  this.isVisible_ = !this.isVisible_;
  goog.style.setElementShown(container, this.isVisible_);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.SocialShare.prototype.onShare_ = function(context) {
  var button = context.getElement();
  var target = goog.dom.dataset.get(button, 'target');
  var urls = {
    'vk': '//vk.com/share.php?url={url}&title={title}',
    'fb': 'https://www.facebook.com/sharer/sharer.php?u={url}',
    'ok': 'http://connect.ok.ru/dk?st.cmd=WidgetSharePreview&service=odnoklassniki&st.shareUrl={url}',
    'twitter': 'https://twitter.com/intent/tweet?url={url}&text={title}',
    'telegram': 'tg://msg?text={title}+{url}',
    'whatsapp': 'whatsapp://send?text={title}+{url}',
    'viber': 'viber://forward?text={title}+{url}'
  };
  var url = urls[target]
      .replace('{url}', encodeURIComponent(document.location.href))
      .replace('{title}', encodeURIComponent(document.title));

  /** @preserveTry */
  try {
    window['yaCounter33210963']['reachGoal']('share_' + target);
  } catch (ex) {
    // empty
  };
  var win = bru.window.open(url,
      {'target': 'd2share', 'width': 626, 'height': 436, 'status': 0, 'toolbar': 0});
  win.focus();
};


/**
 * Init
 */
drive.dispatcher.registerLoader('socialshare', function() {new drive.SocialShare();});
