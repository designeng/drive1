goog.provide('driveadm.imageList');

goog.require('bru.ui.ImageListGroup');
goog.require('driveadm.config');
goog.require('goog.dom');


/**
 * @param {string} formId
 * @param {string} entityId
 * @param {string} containerId
 * @return {bru.ui.ImageListGroup}
 */
driveadm.imageList = function(formId, entityId, containerId) {
  var form = /** @type {Element} */ (goog.dom.getElement(formId));
  var container = /** @type {Element} */ (goog.dom.getElement(containerId));
  var options = /** @type {driveadm.ImageListInfo} */ (driveadm.imageListsInfo[entityId]);
  var imagelist = new bru.ui.ImageListGroup(form, entityId);
  imagelist.setIsCurrDragItemAlwaysDisplayed();
  imagelist.setShowCropWarning(true);
  imagelist.setAllowCrop(true);
  imagelist.setAllowLink(true);
  imagelist.setAllowReplace(true);
  imagelist.setShowCropWarning(false);
  if (options.maxImages) {
    imagelist.setMaxImages(options.maxImages);
  }
  if (options.minSize && options.fixedAspectRatio) {
    imagelist.setAspectRatio(options.minSize[0], options.minSize[1]);
  }
  if (options.minSize) {
    imagelist.setCropMinSize(options.minSize[0], options.minSize[1]);
  }


  imagelist.addDragList(container, goog.fx.DragListDirection.RIGHT_2D);

  var uploader = imagelist.getUploader();
  //uploader.setShowNumbers(true);
  imagelist.init();

  return imagelist;
};


/**
 * Export
 */
goog.exportSymbol('drvadm.imageList', driveadm.imageList);
