goog.require('drive.indexHeightFix');
goog.require('drive.isMobile');

goog.provide('drive.toggleViewport');

drive.toggleViewport = function() {
  drive.toggleViewport_(drive.isMobile());
  window.addEventListener('load', drive.setHandlers_);
};


/**
 * Replace content attribute of meta[name=viewport] to switch between desktop and mobile versions
 * @param {boolean} isMobile
 * @private
 */
drive.toggleViewport_ = function(isMobile) {
  var content = isMobile ?
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' :
      'width=1024';

  var metaViewport = document.querySelector('meta[name=viewport]');

  if (metaViewport) {
    metaViewport.removeAttribute('content');
    metaViewport.setAttribute('content', content);
  }
};


/**
 * Set up viewport switchers
 * @private
 */
drive.setHandlers_ = function() {
  var switchers = document.getElementsByClassName('viewport-switcher');

  [].forEach.call(switchers, function(switcher) {
    switcher.addEventListener('click', function(e) {
      var newViewport = e.target.getAttribute('data-viewport');

      if (window.localStorage) {
        try {
          window.localStorage.setItem('driveViewport', newViewport);
        } catch (e) {
          // Local storage quota exceeded, etc.
        }
      }

      drive.toggleViewport_(newViewport === 'mobile');

      // Force height recount after changing layout
      if (newViewport === 'desktop') {
        drive.indexHeightFix();
      }
    });
  });
};


/**
 * Export
 */
goog.exportSymbol('drv.toggleViewport', drive.toggleViewport);
