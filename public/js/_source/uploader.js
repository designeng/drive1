goog.provide('drive.imageList');

goog.require('bru.ui.ImageListGroup');
goog.require('drive.config');
goog.require('goog.dom');


/**
 * @param {string} formId
 * @param {string} entityId
 * @param {string} containerId
 * @return {bru.ui.ImageListGroup}
 */
drive.imageList = function(formId, entityId, containerId) {
  var form = /** @type {Element} */ (goog.dom.getElement(formId));
  var container = /** @type {Element} */ (goog.dom.getElement(containerId));
  var options = /** @type {drive.ImageListInfo} */ (drive.imageListsInfo[entityId]);
  var imagelist = new bru.ui.ImageListGroup(form, entityId);
  imagelist.setIsCurrDragItemAlwaysDisplayed();
  imagelist.setShowCropWarning(true);
  imagelist.setAllowCrop(true);
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
 * @type {string}
 */
bru.ui.ImageListGroup.CROP_WARNING = 'Если какую-то из фотографий нужно скадрировать, ' +
    'сделайте это&nbsp;сейчас. После сохранения объявления такой возможности уже не&nbsp;будет.<br><br> ' +
    'Также вы можете поменять порядок вывода фотографий, перетаскивая их&nbsp;мышкой с&nbsp;нажатой ' +
    'левой кнопкой на&nbsp;этой&nbsp;странице.';

/**
 * Export
 */
goog.exportSymbol('drv.imageList', drive.imageList);
