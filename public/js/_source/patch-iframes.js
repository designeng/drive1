goog.provide('drive.mobileIframePatch');

goog.require('goog.dom');
goog.require('drive.isMobile');

drive.mobileIframePatch = function() {
  if (drive.isMobile()) {
    var iframes = goog.dom.getElementsByTagNameAndClass('iframe');
    drive.mobileIframePatch_(iframes);
  }
};


/**
 * Patch iframe wrappers (that are not directly editable) to fit mobile view
 * @param {goog.array.ArrayLike} iframes
 * @private
 */
drive.mobileIframePatch_ = function(iframes) {
  var iframeList = Array.prototype.slice.call(iframes);

  iframeList.forEach(function(el) {
    var iframeWrapper = goog.dom.getAncestorByClass(el, 'afigure-pic');

    if (iframeWrapper) {
      goog.dom.classlist.add(iframeWrapper, 'video-wrapper-mobile');
    }
  });
};


/**
 * Export
 */
goog.exportSymbol('drv.mobileIframePatch', drive.mobileIframePatch);
