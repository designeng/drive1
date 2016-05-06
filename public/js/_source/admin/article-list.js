goog.provide('driveadm.ArticleList');

goog.require('driveadm.init');
goog.require('goog.dom');
goog.require('goog.ui.ac.Remote');
goog.require('goog.ui.ac.RenderOptions');


/**
 * @constructor
 */
driveadm.ArticleList = function() {
  var ac = new goog.ui.ac.Remote('/tags.php',
      /** @type {Element} */ (goog.dom.getElement('asearch-tags')), true);
};


/**
 * Export
 */
goog.exportSymbol('drvadm.ArticleList', driveadm.ArticleList);