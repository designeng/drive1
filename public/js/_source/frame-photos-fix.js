goog.provide('drive.framePhotosFix');

goog.require('goog.dom');
goog.require('goog.dom.dataset');



drive.framePhotosFix = function() {
  var r = function() {
    return Math.random() - 0.5;
  };

  var els = goog.dom.getElementsByClass('frame-photo');
  var indexes = [1, 2, 3];
  indexes.sort(r);

  var initShift = goog.dom.classlist.contains(els[0].parentNode, 'company-photos') ? 2 : 8;
  initShift = initShift * (r() > 0 ? 1 : -1);
  for (var i = 0, el; el = els[i]; i++) {
    goog.dom.classlist.add(el, 'frame-index-' + (i + 1));
    goog.dom.classlist.add(el, 'frame-photo-' + indexes[i]);
    el.style.top = (i & 1 ? initShift : i == 2 ? 0 : -initShift) + Math.round(Math.random() * 8 - 4) + 'px';
    el.style.zIndex = i == 1 ? 3 : i == 2 ? 2 : 1;
    el.style.visibility = 'visible';
  }

  drive.pubsub.subscribe(drive.Topics.LIGHTBOX_ZOOM, function(cur) {
    var curZIndex = Number(cur.style.zIndex);
    var newZIndex = curZIndex;
    for (i = 0; el = els[i]; i++) {
      var zIndex = el.style.zIndex;
      if (cur != el && curZIndex < zIndex) {
        el.style.zIndex = zIndex - 1;
        newZIndex++;
      }
    }
    cur.style.zIndex = newZIndex;
  });
};


/**
 * Export
 */
goog.exportSymbol('drv.framePhotos', drive.framePhotosFix);
