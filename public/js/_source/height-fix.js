goog.provide('drive.isMobile');
goog.provide('drive.indexHeightFix');
goog.provide('drive.brandHeightFix');

goog.require('goog.dom');
goog.require('goog.style');


/**
 * Mobile version detect.
 */
drive.isMobile = function() {
  // Make sure we detect mobile version even w/o settings saved in localStorage.
  // E.g. in case last check return null.
  return window.matchMedia
      && window.matchMedia('(max-device-width: 800px)').matches
      && window.localStorage
      && window.localStorage.getItem('driveViewport') !== 'desktop';
};


drive.indexHeightFix = function() {
  var wrapper = goog.dom.getElement('index-op');
  if (!wrapper || drive.isMobile()) {
    return;
  }

  var height = wrapper.offsetHeight;

  // Устанавливаем высоту колонки с новостями.
  var container = goog.dom.getElement('index-news-list');
  var els = goog.dom.getElementsByClass('nncard', container);
  var moreEl = goog.dom.getElementByClass('index-news-list-more');
  var moreHeight = moreEl ? moreEl.offsetHeight : 0;
  drive.indexSetHeight_(container, els, height - moreHeight);

  // Устанавливаем высоту колонки с официальными новостями.
  container = goog.dom.getElement('index-com-news');
  height -= goog.dom.getElementsByTagNameAndClass('h3', null, container)[0].offsetHeight;
  els = goog.dom.getElementsByTagNameAndClass('li', null, container);
  drive.indexSetHeight_(
      goog.dom.getElementsByTagNameAndClass('ul', null, container)[0],
      els, height);
};


drive.brandHeightFix = function() {
  var wrapper = goog.dom.getElement('brand-op');
  if (!wrapper || drive.isMobile()) {
    return;
  }

  var height = goog.dom.getElement('brand-td-list').offsetHeight;

  // Устанавливаем высоту колонки с новостями.
  var container = goog.dom.getElement('brand-news-list');
  var els = goog.dom.getElementsByClass('nncard', container);

  var moreEl = goog.dom.getElementByClass('show-more-trigger');
  var moreHeight = moreEl ? moreEl.offsetHeight : 0;
  drive.indexSetHeight_(container, els, height - moreHeight);
};


/**
 * @param {Element} container
 * @param {goog.array.ArrayLike} els
 * @param {number} height
 * @private
 */
drive.indexSetHeight_ = function(container, els, height) {
  var overflow = false;
  for (var i = 0, h = 0, el; el = els[i]; i++) {
    if (!overflow) {
      h += el.offsetHeight;
      if (h <= height) {
        continue;
      }
      overflow = true;
    }
    goog.style.setElementShown(el, false);
  }
};


/**
 * Export
 */
goog.exportSymbol('drv.idxFix', drive.indexHeightFix);
goog.exportSymbol('drv.brandFix', drive.brandHeightFix);
