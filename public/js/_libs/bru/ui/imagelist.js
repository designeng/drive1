goog.provide('bru.ui.ImageListGroup');

goog.require('bru.jsaction.EventContract');
goog.require('bru.ui.Crop');
goog.require('bru.ui.Dialog');
goog.require('bru.ui.bubble');
goog.require('bru.ui.uploader.ImageUploader');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.dom.dataset');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.fx.DragListGroup');
goog.require('goog.fx.DragListGroupEvent');
goog.require('goog.fx.Dragger');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.pubsub.PubSub');
goog.require('goog.style');
goog.require('goog.ui.PopupBase');



/**
 * @param {Element} form
 * @param {string} entityId
 * @constructor
 * @extends {goog.fx.DragListGroup}
 */
bru.ui.ImageListGroup = function(form, entityId) {
  goog.fx.DragListGroup.call(this);

  /**
   * @private {Array|undefined}
   */
  this.dragItemHoverClasses_ = [goog.getCssName('imagelist-hover')];

  /**
   * The user-supplied CSS classes to add to the current drag item (during a
   * drag action).
   * @private {Array|undefined}
   */
  this.currDragItemClasses_ = [goog.getCssName('imagelist-imagelist-current')];

  /**
   * The user-supplied CSS classes to add to the clone of the current drag item
   * that's actually being dragged around (during a drag action).
   * @private {Array<string>|undefined}
   */
  this.draggerElClasses_ = [goog.getCssName('imagelist-imagelist-dragger')];

  /**
   * The amount of distance, in pixels, after which a mousedown or touchstart is
   * considered a drag.
   * @private {number}
   */
  this.hysteresisDistance_ = 5;

  /**
   * @type {Element}
   * @private
   */
  this.hidden_;

  /**
   * @type {bru.ui.Crop}
   * @private
   */
  this.crop_;

  /**
   * @type {Element}
   * @private
   */
  this.cropItem_;

  /**
   * @type {?bru.ui.ImageListGroup.ItemInfo}
   * @private
   */
  this.cropInfo_;

  /**
   * @type {bru.ui.Dialog}
   * @private
   */
  this.cropDialog_;

  /**
   * @type {boolean}
   * @private
   */
  this.cropWarningRendered_;

  /**
   * @type {Element}
   * @private
   */
  this.removeConfirmItem_;

  /**
   * @type {Element}
   * @private
   */
  this.bubbleUploaderItem_;

  /**
   * @type {bru.ui.uploader.ImageUploader}
   * @private
   */
  this.bubbleUploader_;

  /**
   * @type {Element}
   * @private
   */
  this.form_ = form;

  /**
   * Префикс hidden полей, например "photos" для полей "photos-1, photos-2, ..."
   * @type {string}
   * @private
   */
  this.entityId_ = entityId;

  /**
   * Namespace для jsaction.
   * @type {string}
   * @private
   */
  this.ilgNamespace_ = 'ilg' + entityId;

  /**
   * Количество изображений в списке
   * @type {number}
   * @private
   */
  this.imagesNumber_ = 0;

  var contract = bru.jsaction.EventContract.getInstanceForDocument();
  var dispatcher = contract.getDispatcher();
  dispatcher.registerHandlers(this.ilgNamespace_, {
    'remove': this.remove_,
    'link': this.externalLink_,
    'replace': this.replace_,
    'crop': this.showCrop_,
    'cropsubmit': this.updateCrop_
  }, this);
};
goog.inherits(bru.ui.ImageListGroup, goog.fx.DragListGroup);


/**
 * @typedef {{
 *     index: number,
 *     pic: string,
 *     thumbnail: string,
 *     thumbnailSize: Array.<number>,
 *     crop: ?string,
 *     cropSize: Array.<number>,
 *     cropInfo: Array.<number>,
 *     cropScale: ?number
 * }}
 */
bru.ui.ImageListGroup.ItemInfo;


/**
 * @type {string}
 */
bru.ui.ImageListGroup.CROP_WARNING = 'Если какую-то из фотографий нужно скадрировать, ' +
    'сделайте это&nbsp;сейчас. После сохранения объявления такой возможности уже не&nbsp;будет.<br><br> ' +
    'Также вы можете поменять порядок вывода фотографий, перетаскивая их&nbsp;мышкой с&nbsp;нажатой ' +
    'левой кнопкой на&nbsp;этой&nbsp;странице.';



/**
 * @type {boolean}
 * @private
 */
bru.ui.ImageListGroup.prototype.allowCrop_;


/**
 * @type {boolean}
 * @private
 */
bru.ui.ImageListGroup.prototype.allowLink_;


/**
 * @type {boolean}
 * @private
 */
bru.ui.ImageListGroup.prototype.allowReplace_;


/**
 * @type {goog.math.Size}
 * @private
 */
bru.ui.ImageListGroup.prototype.aspectRatio_;


/**
 * @type {goog.math.Size}
 * @private
 */
bru.ui.ImageListGroup.prototype.cropMinSize_;


/**
 * @type {number}
 * @private
 */
bru.ui.ImageListGroup.prototype.maxImages_ = 1;


/**
 * @type {boolean}
 * @private
 */
bru.ui.ImageListGroup.prototype.showCropWarning_;


/**
 * @type {bru.ui.uploader.ImageUploader}
 * @private
 */
bru.ui.ImageListGroup.prototype.uploader_;


/**
 * @type {Element}
 * @private
 */
bru.ui.ImageListGroup.prototype.lastHoverItem_;


/**
 * @return {boolean}
 */
bru.ui.ImageListGroup.prototype.getAllowCrop = function() {
  return this.allowCrop_;
};


/**
 * @param {boolean} b
 */
bru.ui.ImageListGroup.prototype.setAllowCrop = function(b) {
  this.allowCrop_ = b;
};


/**
 * @return {boolean}
 */
bru.ui.ImageListGroup.prototype.getAllowLink = function() {
  return this.allowLink_;
};


/**
 * @param {boolean} b
 */
bru.ui.ImageListGroup.prototype.setAllowLink = function(b) {
  this.allowLink_ = b;
};


/**
 * @return {boolean}
 */
bru.ui.ImageListGroup.prototype.getAllowReplace = function() {
  return this.allowReplace_;
};


/**
 * @param {boolean} b
 */
bru.ui.ImageListGroup.prototype.setAllowReplace = function(b) {
  this.allowReplace_ = b;
};


/**
 * @return {goog.math.Size}
 */
bru.ui.ImageListGroup.prototype.getAspectRatio = function() {
  return this.aspectRatio_;
};


/**
 * @param {number} x
 * @param {number} y
 */
bru.ui.ImageListGroup.prototype.setAspectRatio = function(x, y) {
  this.aspectRatio_ = new goog.math.Size(x, y);
};


/**
 * @return {goog.math.Size}
 */
bru.ui.ImageListGroup.prototype.getCropMinSize = function() {
  return this.cropMinSize_;
};


/**
 * @param {number} x
 * @param {number} y
 */
bru.ui.ImageListGroup.prototype.setCropMinSize = function(x, y) {
  this.cropMinSize_ = new goog.math.Size(x, y);
};


/**
 * @return {number}
 */
bru.ui.ImageListGroup.prototype.getMaxImages = function() {
  return this.maxImages_;
};


/**
 * @param {number} num
 */
bru.ui.ImageListGroup.prototype.setMaxImages = function(num) {
  this.maxImages_ = num;
};


/**
 * @return {boolean}
 */
bru.ui.ImageListGroup.prototype.getShowCropWarning = function() {
  return this.showCropWarning_;
};


/**
 * @param {boolean} b
 */
bru.ui.ImageListGroup.prototype.setShowCropWarning = function(b) {
  this.showCropWarning_ = b;
};


/**
 * @return {bru.ui.uploader.ImageUploader}
 */
bru.ui.ImageListGroup.prototype.getUploader = function() {
  return this.uploader_;
};


/** @inheritDoc */
bru.ui.ImageListGroup.prototype.init = function() {
  bru.ui.ImageListGroup.superClass_.init.call(this);

  if (this.uploader_) {
    this.uploader_.init();
  }
};


/** @inheritDoc */
bru.ui.ImageListGroup.prototype.addDragList = function(
    dragListElement, growthDirection, opt_unused, opt_dragHoverClass) {

  goog.dom.classlist.add(dragListElement, 'imagelist');
  goog.style.setUnselectable(dragListElement, true);

  // Подготавливаем контейнер для скрытых полей.
  var hiddenContainer = goog.dom.createElement('div');
  hiddenContainer.style.position = 'absolute';
  goog.dom.insertSiblingAfter(hiddenContainer, dragListElement);
  this.hidden_ = hiddenContainer;

  var field;
  var i = 0;
  while (field = this.form_[this.entityId_ + '-' + (i + 1)]) {
    // Получаем всю информацию об изображении.
    var item = this.getItemInfo_(field);

    // Перекидываем скрытые поля в контейнер.
    goog.dom.appendChild(hiddenContainer, goog.dom.removeNode(field));
    var cropField = field.form[field.name + '-crop'];
    if (cropField) {
      goog.dom.appendChild(hiddenContainer, goog.dom.removeNode(cropField));
    }

    // Рисуем тамбнейл с контролами.
    this.renderThumbnail_(item, dragListElement);

    i++;
  }
  // Количество изображений.
  this.imagesNumber_ = i;

  // Инициализация аплоадера.
  var uploaderContainer = goog.dom.createElement('div');
  goog.dom.insertSiblingAfter(uploaderContainer, dragListElement);
  this.uploader_ = new bru.ui.uploader.ImageUploader(this.entityId_, uploaderContainer);
  this.eventHandler_
      .listen(this.uploader_, bru.ui.uploader.ImageUploader.EventType.READY, this.handleFilesUploaded_);

  this.updateUploaderMaxFiles_();

  bru.ui.ImageListGroup.superClass_.addDragList.apply(this, arguments);
};


/**
 * @param {*} file
 * @param {number=} opt_index
 * @return {bru.ui.ImageListGroup.ItemInfo}
 * @private
 */
bru.ui.ImageListGroup.prototype.prepareFileInfo_ = function(file, opt_index) {
  var thumb = file['thumbnail'];
  var image = file['image'];
  var info = {
      index: opt_index || ++this.imagesNumber_,
      pic: /** @type {string} */ (image[0]),
      thumbnail: /** @type {string} */ (thumb[0]),
      thumbnailSize: [/** @type {number} */ (thumb[1]), /** @type {number} */ (thumb[2])]
  };

  var crop = file['cropPreview'];
  if (this.allowCrop_ && crop) {

    if (this.showCropWarning_) {
      this.renderCropWarning_();
    }
    info.crop = /** @type {?string} */ (crop[0]);
    info.cropSize = [/** @type {number} */ (crop[1]), /** @type {number} */ (crop[2])];
    info.cropScale = /** @type {number} */ (file['cropPreviewScale']);
    //TODO: Тут нужно будет инициализировать crop.
    //info.cropInfo = [10, 10, 100, 100];

    var bruCrop = new bru.ui.Crop(/** @type {string} */ (crop[0]),
        /** @type {number} */ (crop[1]), /** @type {number} */ (crop[2]));
    if (this.getAspectRatio()) {
      bruCrop.setAspectRatio(this.getAspectRatio());
    }
    bruCrop.setMaxSize();
    var cropInfo = bruCrop.get();
    info.cropInfo = [cropInfo.left, cropInfo.top, cropInfo.width, cropInfo.height];
    bruCrop.dispose();
  }

  return info;
};


/**
 * @param {*} file
 * @private
 */
bru.ui.ImageListGroup.prototype.addItem_ = function(file) {
  var info = this.prepareFileInfo_(file);

  // Добавляем hidden поле.
  this.createHiddenField_(info);

  // Рисуем тамбнейл.
  var dragItem = this.renderThumbnail_(info);

  // Развешиваем события. Код из инициализации draglistgroup.js
  var dragItemHandle = this.getHandleForDragItem_(dragItem);

  var uid = goog.getUid(dragItemHandle);
  this.dragItemForHandle_[uid] = dragItem;

  if (this.dragItemHoverClasses_) {
    this.eventHandler_.listen(
        dragItem, goog.events.EventType.MOUSEOVER,
        this.handleDragItemMouseover_);
    this.eventHandler_.listen(
        dragItem, goog.events.EventType.MOUSEOUT,
        this.handleDragItemMouseout_);
  }
  if (this.dragItemHandleHoverClasses_) {
    this.eventHandler_.listen(
        dragItemHandle, goog.events.EventType.MOUSEOVER,
        this.handleDragItemHandleMouseover_);
    this.eventHandler_.listen(
        dragItemHandle, goog.events.EventType.MOUSEOUT,
        this.handleDragItemHandleMouseout_);
  }

  this.dragItems_.push(dragItem);

  this.eventHandler_.listen(dragItemHandle,
      [goog.events.EventType.MOUSEDOWN, goog.events.EventType.TOUCHSTART],
      this.handlePotentialDragStart_);
};


/**
 * @param {*} file
 * @private
 */
bru.ui.ImageListGroup.prototype.replaceItem_ = function(file) {
  var index = Number(goog.dom.dataset.get(this.bubbleUploaderItem_, 'index'));
  var info = this.prepareFileInfo_(file, index);

  this.bubbleUploaderItem_.innerHTML = this.getThumbnailHtml_(info);
  this.resizeThumbnailCrop_(this.bubbleUploaderItem_, info);

  this.createHiddenField_(info);

  this.bubbleUploaderItem_ = null;
  goog.events.removeAll(this.bubbleUploader_);
  bru.ui.bubble.dispose();
  goog.dispose(this.bubbleUploader_);
};


/**
 * @param {Element} dragItem
 * @private
 */
bru.ui.ImageListGroup.prototype.removeItem_ = function(dragItem) {
  // Удаляем все события.
  var dragItemHandle = this.getHandleForDragItem_(dragItem);

  if (this.dragItemHoverClasses_) {
    this.eventHandler_.unlisten(
        dragItem, goog.events.EventType.MOUSEOVER,
        this.handleDragItemMouseover_);
    this.eventHandler_.unlisten(
        dragItem, goog.events.EventType.MOUSEOUT,
        this.handleDragItemMouseout_);
  }
  if (this.dragItemHandleHoverClasses_) {
    this.eventHandler_.unlisten(
        dragItemHandle, goog.events.EventType.MOUSEOVER,
        this.handleDragItemHandleMouseover_);
    this.eventHandler_.unlisten(
        dragItemHandle, goog.events.EventType.MOUSEOUT,
        this.handleDragItemHandleMouseout_);
  }

  goog.array.remove(this.dragItems_, dragItem);

  this.eventHandler_.unlisten(dragItemHandle,
      [goog.events.EventType.MOUSEDOWN, goog.events.EventType.TOUCHSTART],
      this.handlePotentialDragStart_);

  // Удаляем тамбнейл
  goog.dom.removeNode(dragItem);

  this.imagesNumber_--;
};


/**
 * @param {bru.ui.uploader.ImageUploaderEvent} e
 * @private
 */
bru.ui.ImageListGroup.prototype.handleFilesUploaded_ = function(e) {
  for (var i = 0, file; file = e.files[i]; i++) {
    if (!file['error']) {
      this.addItem_(file);
    }
  }
  this.updateUploaderMaxFiles_();
};


/**
 * @param {bru.ui.uploader.ImageUploaderEvent} e
 * @private
 */
bru.ui.ImageListGroup.prototype.handleBubbleFilesUploaded_ = function(e) {
  for (var i = 0, file; file = e.files[i]; i++) {
    if (!file['error']) {
      this.replaceItem_(file);
    }
  }
};


/**
 * @param {!goog.events.BrowserEvent} e MOUSEDOWN or TOUCHSTART event.
 * @private
 */
bru.ui.ImageListGroup.prototype.removeConfirm_ = function(e) {
  var target = /** @type {Node} */ (e.target);
  var removeConfirm = this.removeConfirmItem_.nextSibling;

  // Если мы кликнули на плашку "Вы уверены?", то удаляем елемент.
  if (goog.dom.contains(removeConfirm, target)) {
    var item = /** @type {Element} */ (goog.dom.getAncestorByClass(target, 'imagelist-item'));
    this.removeItem_(item);
    this.sync_();
    this.updateUploaderMaxFiles_();
  }

  this.showRemoveConfirm_(this.removeConfirmItem_, false);
  this.removeConfirmItem_ = null;
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
bru.ui.ImageListGroup.prototype.replace_ = function(context) {
  var target = context.getElement();
  var item = goog.dom.getAncestorByClass(target, 'imagelist-item');

  bru.ui.bubble.dispose();
  var bubble = bru.ui.bubble.bubble(target, '<div class="imagelist-bubble-plupload"></div>',
      undefined, undefined, 'tooltip', undefined, undefined, undefined, true);
  var bubbleUploaderWrapper = goog.dom.getElementByClass('imagelist-bubble-plupload', bubble.getElement());

  this.bubbleUploaderItem_ = item;

  goog.dispose(this.bubbleUploader_);
  this.bubbleUploader_ = new bru.ui.uploader.ImageUploader(this.entityId_, bubbleUploaderWrapper);
  this.bubbleUploader_.setMaxFiles(1);
  this.bubbleUploader_.init();

  goog.events.listen(this.bubbleUploader_,
    bru.ui.uploader.ImageUploader.EventType.READY, this.handleBubbleFilesUploaded_, false, this);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
bru.ui.ImageListGroup.prototype.remove_ = function(context) {
  var target = context.getElement();
  var remove = /** @type {Element} */ (goog.dom.getAncestorByClass(target, 'imagelist-remove'));
  this.removeConfirmItem_ = remove;
  this.showRemoveConfirm_(remove, true);

  goog.events.listenOnce(goog.dom.getDocument(),
        [goog.events.EventType.MOUSEDOWN, goog.events.EventType.TOUCHSTART],
        this.removeConfirm_, true, this);
};


/**
 * @param {Element} el
 * @param {boolean} b
 * @private
 */
bru.ui.ImageListGroup.prototype.showRemoveConfirm_ = function(el, b) {
  goog.style.setElementShown(el, !b);
  goog.style.setElementShown(/** @type {Element} */ (el.nextSibling), b);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
bru.ui.ImageListGroup.prototype.externalLink_ = function(context) {
  var target = context.getElement();
  var item = /** @type {Element} */ (goog.dom.getAncestorByClass(target, 'imagelist-item'));

  var pubsub = goog.pubsub.PubSub.getInstance();
  pubsub.publish('imagelist-link', goog.dom.dataset.get(item, 'index'));
};


/**
 * Синхронизируем данные между списком, аплоадером и формой.
 * @private
 */
bru.ui.ImageListGroup.prototype.updateUploaderMaxFiles_ = function() {
  // Устанавливаем максимальное количество файлов для аплоадера,
  // чтобы нельзя было загрузить больше изображений, чем нужно.
  var uploaderFiles = Math.max(0, this.getMaxImages() - this.imagesNumber_);
  this.uploader_.setDisabled(uploaderFiles === 0);
  this.uploader_.setMaxFiles(uploaderFiles);
  this.uploader_.refresh();
};


/**
 * @param {bru.ui.ImageListGroup.ItemInfo} info
 * @param {Element=} opt_container
 * @return {Element}
 * @private
 */
bru.ui.ImageListGroup.prototype.renderThumbnail_ = function(info, opt_container) {
  opt_container = opt_container || this.dragLists_[0];
  var el = goog.dom.createElement('div');
  goog.dom.classlist.add(el, 'imagelist-item');
  goog.dom.dataset.set(el, 'index', String(info.index));
  el.innerHTML = this.getThumbnailHtml_(info);
  this.resizeThumbnailCrop_(el, info);
  goog.dom.appendChild(opt_container, el);
  return el;
};


/**
 * @param {bru.ui.ImageListGroup.ItemInfo} info
 * @return {string}
 * @private
 */
bru.ui.ImageListGroup.prototype.getThumbnailHtml_ = function(info) {
  return '<div class="imagelist-pic" style="width:' + info.thumbnailSize[0] + 'px;height:' + info.thumbnailSize[1] +
      'px"><img src="' + info.thumbnail + '"><div class="imagelist-pic-overlay"></div><img src="' + info.thumbnail +
      '" class="imagelist-pic-mask"></div>' +
      '<span class="imagelist-number">' + info.index + '</span>' +
      '<div class="imagelist-controls">' +
      (this.allowCrop_ && info.crop ? '<div class="imagelist-control imagelist-crop"><span class="i"></span>' +
      '<span class="imagelist-control-caption" data-action="' + this.ilgNamespace_ + '.crop" onclick="">Кадрировать</span></div>' : '') +
      (this.allowLink_ ? '<div class="imagelist-control imagelist-link"><span class="i"></span>' +
      '<span class="imagelist-control-caption" data-action="' + this.ilgNamespace_ + '.link" onclick="">Вставить</span></div>' : '') +
      (this.allowReplace_ ? '<div class="imagelist-control imagelist-replace"><span class="i"></span>' +
      '<span class="imagelist-control-caption" data-action="' + this.ilgNamespace_ + '.replace" onclick="">Заменить</span></div>' : '') +
      '<div class="imagelist-control imagelist-remove"><span class="i"></span>' +
      '<span class="imagelist-control-caption" data-action="' + this.ilgNamespace_ + '.remove" onclick="">Удалить</span></div>' +
      '<div style="display:none" class="imagelist-control imagelist-remove-confirm">Вы уверены?</div>' +
      '</div>';
};


/**
 * @param {Element} item
 * @param {bru.ui.ImageListGroup.ItemInfo} info
 * @private
 */
bru.ui.ImageListGroup.prototype.resizeThumbnailCrop_ = function(item, info) {
  var mask = goog.dom.getElementByClass('imagelist-pic-mask', item);
  if (info.cropInfo && info.cropInfo.length) {
    // Вычисляем коэффициент по большей стороне.
    var scale = info.cropSize[0] > info.cropSize[1] ?
      info.thumbnailSize[0] / info.cropSize[0] :
      info.thumbnailSize[1] / info.cropSize[1];
    var clip = [
        Math.round(info.cropInfo[1] * scale),
        Math.round((info.cropInfo[0] + info.cropInfo[2]) * scale),
        Math.round((info.cropInfo[1] + info.cropInfo[3]) * scale),
        Math.round(info.cropInfo[0] * scale)];
    mask.style.clip = 'rect(' + clip[0] + 'px, ' +
        clip[1] + 'px, ' +
        clip[2] + 'px, ' + clip[3] + 'px)';
  } //else {
    //mask.style.clip = 'auto';
  //}
};


/**
 * @private
 */
bru.ui.ImageListGroup.prototype.renderCropWarning_ = function() {
  if (this.cropWarningRendered_) {
    return;
  }
  var container = this.dragLists_[0];
  var el = goog.dom.createElement('div');
  goog.dom.classlist.add(el, 'field-validation-error');
  el.innerHTML = bru.ui.ImageListGroup.CROP_WARNING;
  goog.dom.insertSiblingBefore(el, container);
  this.cropWarningRendered_ = true;
};


/**
 * @private
 */
bru.ui.ImageListGroup.prototype.sync_ = function() {
  // Запоминаем мета-данные.
  var fields = this.hidden_.getElementsByTagName('input');
  var itemsInfo = [];
  for (var i = 0, field; field = fields[i]; i++) {
    // Игнорируем crop-поля.
    // TODO: Возможно лучше будет проверять regexp'ом.
    if (field.name.indexOf('-crop') < 0) {
      itemsInfo.push(this.getItemInfo_(field));
    }
  }

  // Удаляем все поля.
  this.hidden_.innerHTML = '';

  // Меняем индексы в тамбнейле и пересоздаем скрытые поля в нужном порядке.
  var hoverList = this.dragLists_[0];
  var hoverListItems = goog.dom.getChildren(hoverList);
  var item;
  for (i = 0; item = hoverListItems[i]; i++) {
    var oldIndex = Number(goog.dom.dataset.get(item, 'index'));
    var info = itemsInfo[oldIndex - 1];
    if (info) {
      info.index = i + 1;
      // Создаем скрытое поле.
      this.createHiddenField_(info);
    } else {
      alert('Произошла непредвиденная ошибка. Сообщите об этом разработчикам.');
    }

    // Изменяем индекс в тамбнейле.
    goog.dom.dataset.set(item, 'index', String(i + 1));
    var numEl = goog.dom.getElementByClass('imagelist-number', item);
    numEl.innerHTML = i + 1;
  }

  // Очищаем временный массив.
  itemsInfo.length = 0;

  var pubsub = goog.pubsub.PubSub.getInstance();
  pubsub.publish('imagelist-sync', true);
};


/**
 * @param {!Element} field
 * @return {bru.ui.ImageListGroup.ItemInfo}
 * @private
 */
bru.ui.ImageListGroup.prototype.getItemInfo_ = function(field) {
  var fieldData = goog.dom.dataset.getAll(field);
  var ret = {
    index: Number(/(\d+)$/.exec(field.name)[1]), // 'photo-15' -> 15
    pic: /** @type {string} */ (field.value),
    thumbnail: /** @type {string} */ (fieldData['thumbnail']),
    thumbnailSize: bru.ui.ImageListGroup.splitNumbers_(
        /** @type {string} */ (fieldData['thumbnailSize']))
  };
  var cropField = field.form[field.name + '-crop'];
  if (cropField) {
    fieldData = goog.dom.dataset.getAll(cropField);
    ret.crop = fieldData['preview'];
    ret.cropSize = bru.ui.ImageListGroup.splitNumbers_(
        /** @type {string} */ (fieldData['previewSize']));
    ret.cropInfo = bru.ui.ImageListGroup.splitNumbers_(
        /** @type {string} */ (cropField.value));
    ret.cropScale = Number(fieldData['previewScale']);
  }
  return ret;
};


/**
 * @param {string} str
 * @return {Array.<number>}
 * @private
 */
bru.ui.ImageListGroup.splitNumbers_ = function(str) {
  if (!str) {
    return [];
  }
  var ar = str.split(',');
  var newAr = [];
  for (var i = 0; i < ar.length; i++) {
    newAr[i] = /** @type {number} */ (+ar[i]);
  }
  return newAr;
};


/**
 * @param {bru.ui.ImageListGroup.ItemInfo} info
 * @private
 */
bru.ui.ImageListGroup.prototype.createHiddenField_ = function(info) {
  var fieldName = this.entityId_ + '-' + info.index;

  var oldEl = this.form_[fieldName];
  if (oldEl) {
    goog.dom.removeNode(oldEl);
  }
  oldEl = this.form_[fieldName + '-crop'];
  if (oldEl) {
    goog.dom.removeNode(oldEl);
  }

  var field = goog.dom.createDom('input', {
      name: fieldName,
      type: 'hidden',
      value: info.pic});
  goog.dom.appendChild(this.hidden_, field);
  goog.dom.dataset.set(field, 'thumbnail', info.thumbnail);
  goog.dom.dataset.set(field, 'thumbnailSize', info.thumbnailSize.join(','));
  if (info.crop) {
    field = goog.dom.createDom('input', {
        name: fieldName + '-crop',
        type: 'hidden',
        value: info.cropInfo ? info.cropInfo.join(',') : ''});
    goog.dom.appendChild(this.hidden_, field);
    goog.dom.dataset.set(field, 'preview', info.crop);
    goog.dom.dataset.set(field, 'previewSize', info.cropSize.join(','));
    goog.dom.dataset.set(field, 'previewScale', String(info.cropScale));
  }
};


/** @inheritDoc */
bru.ui.ImageListGroup.prototype.handleDragStart_ = function(e) {
  this.uploader_.setHidden(true);

  // var limits = goog.style.getBounds(/** @type {Element} */ (this.currDragItem_.parentNode));
  // limits.width -= this.currDragItem_.offsetWidth + 10;
  // limits.height -= this.currDragItem_.offsetHeight - 20;
  // e.dragger.setLimits(limits);

  if (!this.dispatchEvent(new goog.fx.DragListGroupEvent(
      goog.fx.DragListGroup.EventType.BEFOREDRAGSTART, this, e.browserEvent,
      this.currDragItem_, null, null))) {
    e.preventDefault();
    this.cleanup_();
    return;
  }

  // Record the original location of the current drag item.
  // Note: this.origNextItem_ may be null.
  this.origList_ = /** @type {Element} */ (this.currDragItem_.parentNode);
  this.origNextItem_ = goog.dom.getNextElementSibling(this.currDragItem_);
  this.currHoverItem_ = this.origNextItem_;
  this.currHoverList_ = this.origList_;

  // If there's a CSS class specified for the current drag item, add it.
  // Otherwise, make the actual current drag item hidden (takes up space).
  if (this.currDragItemClasses_) {
    goog.dom.classlist.add.apply(null,
        goog.array.concat(this.currDragItem_, this.currDragItemClasses_));
  } else {
    this.currDragItem_.style.visibility = 'hidden';
  }

  // Precompute distances from top-left corner to center for efficiency.
  var draggerElSize = goog.style.getSize(this.draggerEl_);
  this.draggerEl_.halfWidth = draggerElSize.width / 2;
  this.draggerEl_.halfHeight = draggerElSize.height / 2;

  this.draggerEl_.style.visibility = '';

  // Record the bounds of all the drag lists and all the other drag items. This
  // caching is for efficiency, so that we don't have to recompute the bounds on
  // each drag move. Do this in the state where the current drag item is not in
  // any of the lists, except when update while dragging is disabled, as in this
  // case the current drag item does not get removed until drag ends.
  this.recacheListAndItemBounds_(this.currDragItem_);

  // Listen to events on the dragger.
  goog.events.listen(this.dragger_, goog.fx.Dragger.EventType.DRAG,
      this.handleDragMove_, false, this);

  this.dispatchEvent(
      new goog.fx.DragListGroupEvent(
          goog.fx.DragListGroup.EventType.DRAGSTART, this, e.browserEvent,
          this.currDragItem_, this.draggerEl_, this.dragger_));
};


/** @inheritDoc */
bru.ui.ImageListGroup.prototype.handleDragMove_ = function(dragEvent) {

  // Compute the center of the dragger element (i.e. the cloned drag item).
  var draggerElPos = goog.style.getPageOffset(this.draggerEl_);
  var draggerElCenter = new goog.math.Coordinate(
      draggerElPos.x + this.draggerEl_.halfWidth,
      draggerElPos.y + this.draggerEl_.halfHeight);

  // Check whether the center is hovering over one of the drag lists.
  var hoverList = this.getHoverDragList_(draggerElCenter);

  // If hovering over a list, find the next item (if drag were to end now).
  var hoverNextItem =
      hoverList ? this.getHoverNextItem_(hoverList, draggerElCenter) : null;

  var rv = this.dispatchEvent(
      new goog.fx.DragListGroupEvent(
          goog.fx.DragListGroup.EventType.BEFOREDRAGMOVE, this, dragEvent,
          this.currDragItem_, this.draggerEl_, this.dragger_,
          draggerElCenter, hoverList, hoverNextItem));
  if (!rv) {
    return false;
  }

  if (hoverList) {
    if (this.updateWhileDragging_) {
      this.insertCurrDragItem_(hoverList, hoverNextItem);
    } else {
      // If update while dragging is disabled do not insert
      // the dragged item, but update the hovered item instead.
      this.updateCurrHoverItem(hoverNextItem, draggerElCenter);
    }
    this.currDragItem_.style.display = '';
    // Add drag list's hover class (if any).
    if (hoverList.dlgDragHoverClass_) {
      goog.dom.classlist.add(hoverList, hoverList.dlgDragHoverClass_);
    }

  } else {
    // Not hovering over a drag list, so remove the item altogether unless
    // specified otherwise by the user.
    if (!this.isCurrDragItemAlwaysDisplayed_) {
      this.currDragItem_.style.display = 'none';
    }

    // Remove hover classes (if any) from all drag lists.
    for (var i = 0, n = this.dragLists_.length; i < n; i++) {
      var dragList = this.dragLists_[i];
      if (dragList.dlgDragHoverClass_) {
        goog.dom.classlist.remove(dragList, dragList.dlgDragHoverClass_);
      }
    }
  }

  // If the current hover list is different than the last, the lists may have
  // shrunk, so we should recache the bounds.
  if (this.lastHoverItem_ != hoverNextItem) {
    this.lastHoverItem_ = hoverNextItem;
    this.currHoverList_ = hoverList;
    this.recacheListAndItemBounds_(this.currDragItem_);
  }

  this.dispatchEvent(
      new goog.fx.DragListGroupEvent(
          goog.fx.DragListGroup.EventType.DRAGMOVE, this, dragEvent,
          /** @type {Element} */ (this.currDragItem_),
          this.draggerEl_, this.dragger_,
          draggerElCenter, hoverList, hoverNextItem));

  // Return false to prevent selection due to mouse drag.
  return false;
};


/** @inheritDoc */
bru.ui.ImageListGroup.prototype.handleDragEnd_ = function(dragEvent) {
  var hoverList = /** @type {Element} */ (this.currDragItem_.parentNode);
  this.sync_();
  this.uploader_.setHidden(false);

  return bru.ui.ImageListGroup.superClass_.handleDragEnd_.call(this, dragEvent);
};


/**
 * Caches the heights of each drag list and drag item, except for the current
 * drag item.
 *
 * @param {Element} currDragItem The item currently being dragged.
 * @private
 */
bru.ui.ImageListGroup.prototype.recacheListAndItemBounds_ = function(
    currDragItem) {
  for (var i = 0, n = this.dragLists_.length; i < n; i++) {
    var dragList = this.dragLists_[i];
    dragList.dlgBounds_ = goog.style.getBounds(dragList);
  }

  for (var i = 0, n = this.dragItems_.length; i < n; i++) {
    var dragItem = this.dragItems_[i];
    //if (dragItem != currDragItem) {
      dragItem.dlgBounds_ = goog.style.getBounds(dragItem);
    //}
  }
};


/** @inheritDoc */
bru.ui.ImageListGroup.prototype.getHoverNextItem_ = function(
    hoverList, draggerElCenter) {

  var hoverListItems = goog.dom.getChildren(hoverList);

  var afterItemIndex;
  var distanceToClosestPoint = Infinity;
  var side;

  for (var i = 0, item; item = hoverListItems[i]; i++) {
    var distanceToPoint = bru.ui.ImageListGroup.distanceFromItem_(item, draggerElCenter);
    if (distanceToPoint[0] < distanceToClosestPoint) {
      distanceToClosestPoint = distanceToPoint[0];
      side = distanceToPoint[1];
      afterItemIndex = i;
    }
  }

  if (!side) {
    afterItemIndex++;
  }

  return hoverListItems[afterItemIndex] || null;
};


/**
 * Private helper for getHoverNextItem_().
 * @param {Element} item
 * @param {goog.math.Coordinate} target
 * @return {Array.<number|boolean>}
 * @private
 */
bru.ui.ImageListGroup.distanceFromItem_ = function(item, target) {
  var itemBounds = item.dlgBounds_;
  var itemLeftX = itemBounds.left;
  var itemRightX = itemBounds.left + itemBounds.width;
  var itemCenterY = itemBounds.top + (itemBounds.height - 1) / 2;
  var dxLeft = Math.abs(itemLeftX - target.x);
  var dxRight = Math.abs(itemRightX - target.x);
  var dx = Math.min(dxLeft, dxRight);
  return [Math.sqrt(Math.pow(dx, 2) + Math.pow(target.y - itemCenterY, 2)), dxLeft < dxRight];
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
bru.ui.ImageListGroup.prototype.showCrop_ = function(context) {
  // Получаем метаданные по текущему изображению.
  // TODO: Наверное имеет смысл вынести в отдельный метод,
  // если вдруг еще где понадобится.
  var target = context.getElement();
  this.cropItem_ = /** @type {Element} */ (goog.dom.getAncestorByClass(target, 'imagelist-item'));
  var index = goog.dom.dataset.get(this.cropItem_, 'index');
  var info = this.getItemInfo_(this.form_[this.entityId_ + '-' + index]);
  this.cropInfo_ = info;

  /**
   * @type {goog.pubsub.PubSub}
   */
  var pubsub = goog.pubsub.PubSub.getInstance();
  pubsub.publish('uploader-sethiden', true);

  var cropDialog = new bru.ui.Dialog();
  cropDialog.setContent(this.generateCropDialogHtml_(info));
  cropDialog.render();
  cropDialog.setVisible(true);

  this.cropDialog_ = cropDialog;

  var crop = new bru.ui.Crop(/** @type {string} */ (info.crop), info.cropSize[0], info.cropSize[1]);

  // Вычисляем минимальные размеры изображения.
  var minSize = this.getCropMinSize().clone();
  minSize.scale(/** @type {number} */ (info.cropScale));
  minSize.round();
  crop.setMinSize(minSize);

  if (this.getAspectRatio()) {
     crop.setAspectRatio(this.getAspectRatio());
  }
  if (info.cropInfo && info.cropInfo.length) {
    crop.setPreset(info.cropInfo[0], info.cropInfo[1], info.cropInfo[2], info.cropInfo[3]);
  } else {
    crop.setMaxSize();
  }

  var imgEl = cropDialog.getElementByClass('dialog-crop-preview');
  crop.decorate(imgEl);

  this.crop_ = crop;

  this.eventHandler_
    .listenOnce(cropDialog, goog.ui.PopupBase.EventType.HIDE, function(e) {
      crop.dispose();
      pubsub.publish('uploader-sethiden', false);
    });
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
bru.ui.ImageListGroup.prototype.updateCrop_ = function(context) {
  var newCrop = this.crop_.get();

  var info = this.cropInfo_;
  info.cropInfo = [newCrop.left, newCrop.top, newCrop.width, newCrop.height];
  var field = this.form_[this.entityId_ + '-' + info.index + '-crop'];
  field.value = newCrop.left + ',' + newCrop.top + ',' +
      newCrop.width + ',' + newCrop.height;

  this.resizeThumbnailCrop_(this.cropItem_, info);

  this.cropInfo_ = null;
  this.cropItem_ = null;
  this.cropDialog_.setVisible(false);
};


/**
 * @param {bru.ui.ImageListGroup.ItemInfo} info
 * @return {string}
 * @private
 */
bru.ui.ImageListGroup.prototype.generateCropDialogHtml_ = function(info) {
  var html = '<div class="dialog-crop">' +
      '<h3>Кадрирование</h3>' +
      '<div class="dialog-crop-description" style="width:' + info.cropSize[0] + 'px">' +
      'Тут можно выделить нужный фрагмент изображения, обрезав лишнее. ' +
      'Двойной клик выделяет максимально возможнный фрагмент, повторный ' +
      'двойной клик отменяет такое выделение.</div>' +
      '<div class="dialog-crop-preview"><img src="' + info.crop + '" width="' +
      info.cropSize[0] + '" height="' + info.cropSize[1] + '"></div>' +
      '<div class="dialog-crop-buttons"><button data-action="' + this.ilgNamespace_ + '.cropsubmit">Готово</button></div>' +
      '</div>';
  return html;
};
