goog.provide('drive.preloadImages');

goog.require('drive.isMobile');

drive.preloadImages = function() {
    if (drive.isMobile()) {
        var imageWrappers = document.getElementsByClassName('image-wrapper');
        drive.preloadImages_(imageWrappers);
    }
};

/**
 * Prevent all images from loading instantly and load them in a lazy way
 * @param {goog.array.ArrayLike} imageWrappers
 * @private
 */
drive.preloadImages_ = function(imageWrappers) {
    var imageList = Array.prototype.slice.call(imageWrappers);

    imageList.forEach(function(el) {
        var img = el.querySelector('img');

        function markAsLoaded() {
            el.setAttribute('data-loaded', 'true');
        }

        if (img.complete) {
            markAsLoaded();
        } else {
            img.addEventListener('load', markAsLoaded);
        }
    });
};


/**
 * Export
 */
goog.exportSymbol('drv.preloadImages', drive.preloadImages);
