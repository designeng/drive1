goog.provide('bru.ui.ImageListGroup2');

goog.require('bru.fx.DragListGroup2D');
goog.require('bru.i18n.ImageListGroup');
goog.require('bru.jsaction.EventContract');
goog.require('bru.jsaction.util');
goog.require('bru.net.xhr.Behaviour');
goog.require('bru.net.xhr.Xhr');
goog.require('bru.ui.Crop');
goog.require('bru.ui.Dialog2');
goog.require('bru.ui.IdGenerator');
goog.require('bru.ui.uploader.ImageUploaderBase');
goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.dom.dataset');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.fx.DragListGroup');
goog.require('goog.fx.DragListGroupEvent');
goog.require('goog.fx.Dragger');
goog.require('goog.i18n.MessageFormat');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.pubsub.PubSub');
goog.require('goog.structs.Map');
goog.require('goog.style');
goog.require('goog.ui.PopupBase');



/**
 * @param {string|HTMLFormElement} form Форма в которую будет писаться информация
 * по загруженным картинким
 * @param {string} type Тип загружаемых картинок
 * @param {string|Element} container Контейрер в который будет рендериться все картинки
 * @constructor
 * @extends {bru.fx.DragListGroup2D}
 */
bru.ui.ImageListGroup2 = function(form, type, container) {
  bru.ui.ImageListGroup2.base(this, 'constructor');

  /**
   * The user-supplied CSS classes to add to a drag item handle on hover (not
   * during a drag action).
   * @private {Array|undefined}
   */
  bru.ui.ImageListGroup2.prototype.dragItemHoverClasses_ = [goog.getCssName('imagelist-hover')];

  /**
   * The user-supplied CSS classes to add to the current drag item (during a
   * drag action).
   * @private {Array|undefined}
   */
  bru.ui.ImageListGroup2.prototype.currDragItemClasses_ = [goog.getCssName('imagelist-current')];

  /**
   * The user-supplied CSS classes to add to the clone of the current drag item
   * that's actually being dragged around (during a drag action).
   * @private {Array<string>|undefined}
   */
  bru.ui.ImageListGroup2.prototype.draggerElClasses_ = [goog.getCssName('imagelist-dragger')];

  /**
   * @type {string}
   * @private
   */
  this.id_;

  /**
   * @type {Element}
   * @private
   */
  this.hidden_;

  /**
   * @type {number}
   * @private
   */
  this.imagesNumber_;

  /**
   * @type {boolean}
   * @private
   */
   this.CropInfoRendered_;

  /**
   * @type {Element}
   * @private
   */
  this.removeConfirmItem_;

  /**
   * @type {Element}
   * @private
   */
  this.cropItem_;

  /**
   * @type {bru.ui.Crop}
   * @private
   */
  this.crop_;

  /**
   * @type {bru.net.xhr.Xhr}
   * @private
   */
  this.xhr_;

  /**
   * @type {bru.ui.ImageListGroup2.ItemInfo?}
   * @private
   */
   this.cropInfo_;

  /**
   * @type {bru.ui.Dialog2}
   * @private
   */
   this.cropDialog_;

  /**
   * @type {HTMLFormElement}
   * @private
   */
  this.form_ = /** @type {HTMLFormElement} */ (goog.dom.getElement(form));

  /**
   * Префикс hidden полей, например "photos" для полей "photos-1, photos-2, ...".
   * Он же используется как идентификатор типа загрузаемых картинок.
   * @type {string}
   * @private
   */
  this.type_ = type;

  /**
   * @type {Element}
   * @private
   */
  //this.container_ = goog.dom.getElement(container);

  /**
   * Namespace для jsaction.
   * @type {string}
   * @private
   */
  this.ilgNamespace_ = 'ilg' + this.getId();

  /**
   * @type {goog.structs.Map}
   * @private
   */
  this.replaceUploaders_ = new goog.structs.Map();

  var contract = bru.jsaction.EventContract.getInstanceForDocument();
  var dispatcher = contract.getDispatcher();
  dispatcher.registerHandlers(this.ilgNamespace_, {
    'remove': this.remove_,
    'link': this.externalLink_,
    'crop': this.showCrop_,
    'cropsubmit': this.updateCrop_
  }, this);
};
goog.inherits(bru.ui.ImageListGroup2, bru.fx.DragListGroup2D);


/**
 * Generator for unique IDs.
 * @type {bru.ui.IdGenerator}
 * @private
 */
bru.ui.ImageListGroup2.prototype.idGenerator_ = bru.ui.IdGenerator.getInstance();


/**
 * @typedef {{
 *     index: number,
 *     id: string,
 *     thumbnail: string,
 *     thumbnailSize: Array.<number>,
 *     preview: (string|undefined),
 *     previewSize: (Array.<number>|undefined),
 *     crop: (Array.<number>|undefined),
 *     cropMinSize: (Array.<number>|undefined)
 * }}
 */
bru.ui.ImageListGroup2.ItemInfo;


/**
 * @type {boolean}
 * @private
 */
bru.ui.ImageListGroup2.prototype.allowCrop_ = true;


/**
 * @type {boolean}
 * @private
 */
bru.ui.ImageListGroup2.prototype.allowLink_;


/**
 * @type {boolean}
 * @private
 */
bru.ui.ImageListGroup2.prototype.allowReplace_ = true;


/**
 * @type {goog.math.Size}
 * @private
 */
bru.ui.ImageListGroup2.prototype.aspectRatio_;


/**
 * Показываем ли номер картинки.
 * @type {boolean}
 * @private
 */
bru.ui.ImageListGroup2.prototype.showNumbers_ = false;


/**
 * CSS класс для кнопки аплоадера.
 * @type {string}
 * @private
 */
bru.ui.ImageListGroup2.prototype.buttonClassName_ = 'xbutton';


/**
 * Максимальное количество изображений.
 * @type {number}
 * @private
 */
bru.ui.ImageListGroup2.prototype.maxImages_ = 1;


/**
 * Показывать сообщение с помощью по кропу и другой информацией.
 * @type {boolean}
 * @private
 */
bru.ui.ImageListGroup2.prototype.showCropInfo_ = true;


/**
 * @type {bru.ui.uploader.ImageUploaderBase}
 * @private
 */
bru.ui.ImageListGroup2.prototype.uploader_;


/**
 * @type {Element}
 * @private
 */
bru.ui.ImageListGroup2.prototype.lastHoverItem_;


/**
 * @return {string} Base CSS class.
 */
bru.ui.ImageListGroup2.prototype.getCssClass = function() {
  return goog.getCssName('imagelist');
};


/**
 * @return {string} Unique ID.
 */
bru.ui.ImageListGroup2.prototype.getId = function() {
  return this.id_ || (this.id_ = this.idGenerator_.getNextUniqueId());
};


/**
 * @return {boolean}
 */
bru.ui.ImageListGroup2.prototype.getAllowCrop = function() {
  return this.allowCrop_;
};


/**
 * @param {boolean} b
 */
bru.ui.ImageListGroup2.prototype.setAllowCrop = function(b) {
  this.allowCrop_ = b;
};


/**
 * @return {boolean}
 */
bru.ui.ImageListGroup2.prototype.getAllowLink = function() {
  return this.allowLink_;
};


/**
 * @param {boolean} b
 */
bru.ui.ImageListGroup2.prototype.setAllowLink = function(b) {
  this.allowLink_ = b;
};


/**
 * @return {boolean}
 */
bru.ui.ImageListGroup2.prototype.getAllowReplace = function() {
  return this.allowReplace_;
};


/**
 * @param {boolean} b
 */
bru.ui.ImageListGroup2.prototype.setAllowReplace = function(b) {
  this.allowReplace_ = b;
};


/**
 * @return {goog.math.Size}
 */
bru.ui.ImageListGroup2.prototype.getAspectRatio = function() {
  return this.aspectRatio_;
};


/**
 * @param {number} x
 * @param {number} y
 */
bru.ui.ImageListGroup2.prototype.setAspectRatio = function(x, y) {
  this.aspectRatio_ = new goog.math.Size(x, y);
};


/**
 * @param {boolean} b
 */
bru.ui.ImageListGroup2.prototype.setShowNumbers = function(b) {
  this.showNumbers_ = b;
};


/**
 * @return {boolean}
 */
bru.ui.ImageListGroup2.prototype.getShowNumbers = function() {
  return this.showNumbers_;
};


/**
 * @param {string} className
 */
bru.ui.ImageListGroup2.prototype.setButtonClass = function(className) {
  this.buttonClassName_ = className;
};


/**
 * @return {string}
 */
bru.ui.ImageListGroup2.prototype.getButtonClass = function() {
  return this.buttonClassName_;
};


/**
 * @return {number}
 */
bru.ui.ImageListGroup2.prototype.getMaxImages = function() {
  return this.maxImages_;
};


/**
 * @param {number} num
 */
bru.ui.ImageListGroup2.prototype.setMaxImages = function(num) {
  this.maxImages_ = num;
};


/**
 * @return {boolean}
 */
bru.ui.ImageListGroup2.prototype.getShowCropInfo = function() {
  return this.showCropInfo_;
};


/**
 * @param {boolean} b
 */
bru.ui.ImageListGroup2.prototype.setShowCropInfo = function(b) {
  this.showCropInfo_ = b;
};


/**
 * @return {bru.ui.uploader.ImageUploaderBase}
 */
bru.ui.ImageListGroup2.prototype.getUploader = function() {
  return this.uploader_;
};


/** @inheritDoc */
bru.ui.ImageListGroup2.prototype.addDragList = function(
    dragListElement, growthDirection, opt_unused, opt_dragHoverClass) {

  goog.dom.classlist.add(dragListElement, this.getCssClass());
  goog.style.setUnselectable(dragListElement, true);

  // Подготавливаем контейнер для скрытых полей.
  var hiddenContainer = goog.dom.createElement('div');
  hiddenContainer.style.position = 'absolute';
  goog.dom.insertSiblingAfter(hiddenContainer, dragListElement);
  this.hidden_ = hiddenContainer;

  for (var i = 0, field; field = this.form_[this.type_ + '-' + (i + 1)]; i++) {
    // Перекидываем скрытые поля в контейнер.
    goog.dom.appendChild(hiddenContainer, goog.dom.removeNode(field));

    // Рисуем тамбнейл с контролами.
    this.renderThumbnail_(this.getItemInfo_(field), dragListElement);
  }
  // Количество изображений.
  this.imagesNumber_ = i;

  if (i > 0) {
    this.CropInfoRendered_ = true;
  }

  // Инициализация аплоадера.
  var uploaderContainer = goog.dom.createElement('div');
  goog.dom.insertSiblingAfter(uploaderContainer, dragListElement);
  this.uploader_ = new bru.ui.uploader.ImageUploaderBase(this.type_, this.buttonClassName_);
  this.uploader_.render(uploaderContainer);
  this.eventHandler_
      .listen(this.uploader_, bru.ui.uploader.ImageUploaderBase.EventType.READY,
          this.handleFilesUploaded_);

  this.updateUploaderMaxFiles_();

  bru.ui.ImageListGroup2.superClass_.addDragList.apply(this, arguments);
};


/**
 * @param {*} file
 * @param {number=} opt_index
 * @return {bru.ui.ImageListGroup2.ItemInfo}
 * @private
 */
bru.ui.ImageListGroup2.prototype.prepareFileInfo_ = function(file, opt_index) {
  var thumbnailInfo = file['thumbnail'];
  var info = {
    id: /** @type {string} */ (file['id']),
    index: opt_index || ++this.imagesNumber_,
    thumbnail: /** @type {string} */ (thumbnailInfo[0]),
    thumbnailSize: [
        /** @type {number} */ (thumbnailInfo[1]),
        /** @type {number} */ (thumbnailInfo[2])]
  };

  var previewInfo = file['preview'];
  if (this.allowCrop_ && previewInfo) {
    this.renderCropInfo_();
    info.preview = /** @type {string} */ (previewInfo[0]);
    info.previewSize = [
        /** @type {number} */ (previewInfo[1]),
        /** @type {number} */ (previewInfo[2])];
    info.crop = /** @type {Array.<number>} */ (file['crop']);
    info.cropMinSize = /** @type {Array.<number>} */ (file['cropMinSize']);
  }

  return info;
};


/**
 * @param {*} file
 * @private
 */
bru.ui.ImageListGroup2.prototype.addItem_ = function(file) {
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
 * @param {Element} item
 * @private
 */
bru.ui.ImageListGroup2.prototype.replaceItem_ = function(file, item) {
  var index = Number(goog.dom.dataset.get(item, 'index'));
  var info = this.prepareFileInfo_(file, index);

  goog.dispose(this.replaceUploaders_.get(goog.getUid(item)));

  // Раздельно заменяем html чтобы сохранить imagelist-pic-wrapper.
  this.getHandleForDragItem_(item).innerHTML =
      this.getThumbnailWrapperHtml_(info);
  var controlsClass = goog.getCssName(this.getCssClass(), 'controls');
  goog.dom.getElementByClass(controlsClass, item).innerHTML =
      this.getThumbnailControlsHtml_(info);

  this.initReplaceUploader_(item);
  this.resizeThumbnailCrop_(item, info);
  this.createHiddenField_(info);
};


/**
 * @param {Element} dragItem
 * @private
 */
bru.ui.ImageListGroup2.prototype.removeItem_ = function(dragItem) {
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

  // Удаляем тамбнейл и ассоциированный с ним аплоадер.
  goog.dispose(this.replaceUploaders_.get(goog.getUid(dragItem)));
  goog.dom.removeNode(dragItem);

  this.imagesNumber_--;
};


/** @inheritDoc */
bru.ui.ImageListGroup2.prototype.getHandleForDragItem_ = function(dragItem) {
  return goog.dom.getElementByClass(
      goog.getCssName(this.getCssClass(), 'pic-wrapper'), dragItem);
};


/**
 * @param {bru.ui.uploader.ImageUploaderBaseEvent} e
 * @private
 */
bru.ui.ImageListGroup2.prototype.handleFilesUploaded_ = function(e) {
  for (var i = 0, file; file = e.files[i]; i++) {
    this.addItem_(file);
  }
  this.updateUploaderMaxFiles_();
};


/**
 * @param {bru.ui.uploader.ImageUploaderBaseEvent} e
 * @private
 */
bru.ui.ImageListGroup2.prototype.handleReplaceFileUploaded_ = function(e) {
  var item = /** @type {Element} */ (goog.dom.getAncestorByClass(e.target.getElement(),
      goog.getCssName(this.getCssClass(), 'item')));
  this.replaceItem_(e.files[0], item);
};


/**
 * @param {!goog.events.BrowserEvent} e MOUSEDOWN or TOUCHSTART event.
 * @private
 */
bru.ui.ImageListGroup2.prototype.removeConfirm_ = function(e) {
  var target = /** @type {Node} */ (e.target);
  var removeConfirm = this.removeConfirmItem_.nextSibling;

  // Если мы кликнули на плашку "Вы уверены?", то удаляем елемент.
  if (goog.dom.contains(removeConfirm, target)) {
    var item = /** @type {Element} */ (goog.dom.getAncestorByClass(target,
        goog.getCssName(this.getCssClass(), 'item')));
    goog.dispose(this.replaceUploaders_.get(goog.getUid(item)));
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
bru.ui.ImageListGroup2.prototype.remove_ = function(context) {
  var target = context.getElement();
  var remove = /** @type {Element} */ (goog.dom.getAncestorByClass(target,
      goog.getCssName(this.getCssClass(), 'control-remove')));
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
bru.ui.ImageListGroup2.prototype.showRemoveConfirm_ = function(el, b) {
  goog.style.setElementShown(el, !b);
  goog.style.setElementShown(/** @type {Element} */ (el.nextSibling), b);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
bru.ui.ImageListGroup2.prototype.externalLink_ = function(context) {
  var target = context.getElement();
  var item = /** @type {Element} */ (goog.dom.getAncestorByClass(target,
    goog.getCssName(this.getCssClass(), 'item')));

  var index = goog.dom.dataset.get(item, 'index');
  var info = this.getItemInfo_(this.form_[this.type_ + '-' + index]);
  goog.pubsub.PubSub.getInstance().publish('imagelist-link', info);
};


/**
 * Синхронизируем данные между списком, аплоадером и формой.
 * @private
 */
bru.ui.ImageListGroup2.prototype.updateUploaderMaxFiles_ = function() {
  // Устанавливаем максимальное количество файлов для аплоадера,
  // чтобы нельзя было загрузить больше изображений, чем нужно.
  var uploaderFiles = Math.max(0, this.getMaxImages() - this.imagesNumber_);
  this.uploader_.setVisible(uploaderFiles > 0);
  this.uploader_.setMaxFiles(uploaderFiles);
};


/**
 * @param {bru.ui.ImageListGroup2.ItemInfo} info
 * @param {Element=} opt_container
 * @return {Element}
 * @private
 */
bru.ui.ImageListGroup2.prototype.renderThumbnail_ = function(info, opt_container) {
  var container = opt_container || this.dragLists_[0];
  var el =
      /** @type {Element} */ (goog.dom.htmlToDocumentFragment(this.getThumbnailHtml_(info)));
  container.appendChild(el);
  this.initReplaceUploader_(el);
  this.resizeThumbnailCrop_(el, info);
  return el;
};


/**
 * @param {Element} item
 * @private
 */
bru.ui.ImageListGroup2.prototype.initReplaceUploader_ = function(item) {
  if (!this.allowReplace_) {
    return;
  }

  var uploaderContainer = goog.dom.getElementByClass(goog.getCssName(this.getCssClass(), 'control-replace'), item);
  var uploader = new bru.ui.uploader.ImageUploaderBase(this.type_);
  uploader.setButtonCaption(bru.i18n.ImageListGroup.ACTION_REPLACE);
  uploader.render(uploaderContainer);
  uploader.setVisible(true);

  this.replaceUploaders_.set(goog.getUid(item), uploader);

  this.eventHandler_
      .listen(uploader, bru.ui.uploader.ImageUploaderBase.EventType.READY,
          this.handleReplaceFileUploaded_);
};


/**
 * @param {Element} item
 * @param {bru.ui.ImageListGroup2.ItemInfo} info
 * @private
 */
bru.ui.ImageListGroup2.prototype.resizeThumbnailCrop_ = function(item, info) {
  if (!info.preview) {
    return;
  }

  // Вычисляем коэффициент по большей стороне.
  var scale = info.previewSize[0] > info.previewSize[1] ?
    info.thumbnailSize[0] / info.previewSize[0] :
    info.thumbnailSize[1] / info.previewSize[1];
  var clip = [
      Math.round(info.crop[1] * scale),
      Math.round((info.crop[0] + info.crop[2]) * scale),
      Math.round((info.crop[1] + info.crop[3]) * scale),
      Math.round(info.crop[0] * scale)];
  var mask = goog.dom.getElementByClass(
      goog.getCssName(this.getCssClass(), 'pic-mask'), item);
  mask.style.clip = 'rect(' + clip[0] + 'px, ' +
      clip[1] + 'px, ' +
      clip[2] + 'px, ' + clip[3] + 'px)';
};


/**
 * @private
 */
bru.ui.ImageListGroup2.prototype.renderCropInfo_ = function() {
  if (!this.showCropInfo_ || this.CropInfoRendered_) {
    return;
  }
  var container = this.dragLists_[0];
  var el = goog.dom.createElement('div');
  goog.dom.classlist.add(el, 'imagelist-warning');
  el.innerHTML = new goog.i18n.MessageFormat(bru.i18n.ImageListGroup.INFO)
      .format({'MAX_IMAGES': this.maxImages_});
  goog.dom.insertSiblingBefore(el, container);
  this.CropInfoRendered_ = true;
};


/**
 * @private
 */
bru.ui.ImageListGroup2.prototype.sync_ = function() {
  // Запоминаем мета-данные.
  var fields = this.hidden_.getElementsByTagName('input');
  var itemsInfo = [];
  for (var i = 0, field; field = fields[i]; i++) {
    var info = this.getItemInfo_(field);
    itemsInfo[info.index - 1] = this.getItemInfo_(field);
  }

  // Удаляем все поля.
  this.hidden_.innerHTML = '';

  // Меняем индексы в тамбнейле и пересоздаем скрытые поля в нужном порядке.
  var hoverList = this.dragLists_[0];
  var hoverListItems = goog.dom.getChildren(hoverList);
  var item;
  for (i = 0; item = hoverListItems[i]; i++) {
    var oldIndex = Number(goog.dom.dataset.get(item, 'index'));
    info = itemsInfo[oldIndex - 1];
    if (info) {
      info.index = i + 1;
      // Создаем скрытое поле.
      this.createHiddenField_(info);
    }

    // Изменяем индекс в тамбнейле.
    goog.dom.dataset.set(item, 'index', String(i + 1));
    if (this.showNumbers_) {
      var numEl = goog.dom.getElementByClass(
          goog.getCssName(this.getCssClass(), 'number'), item);
      numEl.innerHTML = i + 1;
    }
  }

  // Очищаем временный массив.
  itemsInfo.length = 0;

  goog.pubsub.PubSub.getInstance().publish('imagelist-sync', true);
};


/**
 * @param {!Element} field
 * @return {bru.ui.ImageListGroup2.ItemInfo}
 * @private
 */
bru.ui.ImageListGroup2.prototype.getItemInfo_ = function(field) {
  var fieldData = goog.dom.dataset.getAll(field);
  var ret = {
    index: Number(/(\d+)$/.exec(field.name)[1]), // 'photo-15' -> 15
    id: /** @type {string} */ (field.value),
    thumbnail: /** @type {string} */ (fieldData['thumbnail']),
    thumbnailSize: bru.ui.ImageListGroup2.splitNumbers_(
        /** @type {string} */ (fieldData['thumbnailSize']))
  };
  var preview = fieldData['preview'];
  if (preview) {
    ret.preview = preview;
    ret.previewSize = bru.ui.ImageListGroup2.splitNumbers_(
        /** @type {string} */ (fieldData['previewSize']));
    ret.crop = bru.ui.ImageListGroup2.splitNumbers_(
        /** @type {string} */ (fieldData['crop']));
    ret.cropMinSize = bru.ui.ImageListGroup2.splitNumbers_(
        /** @type {string} */ (fieldData['cropMinSize']));
  }
  return ret;
};


/**
 * @param {string} str
 * @return {Array.<number>}
 * @private
 */
bru.ui.ImageListGroup2.splitNumbers_ = function(str) {
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
 * @param {bru.ui.ImageListGroup2.ItemInfo} info
 * @private
 */
bru.ui.ImageListGroup2.prototype.createHiddenField_ = function(info) {
  var fieldName = this.type_ + '-' + info.index;
  var field = goog.dom.createDom('input', {
      name: fieldName,
      type: 'hidden',
      value: info.id});
  goog.dom.dataset.set(field, 'thumbnail', info.thumbnail);
  goog.dom.dataset.set(field, 'thumbnailSize', info.thumbnailSize.join(','));
  if (info.preview) {
    goog.dom.dataset.set(field, 'preview', info.preview);
    goog.dom.dataset.set(field, 'previewSize', info.previewSize.join(','));
    goog.dom.dataset.set(field, 'crop', info.crop.join(','));
    goog.dom.dataset.set(field, 'cropMinSize', info.cropMinSize.join(','));
  }

  goog.dom.removeNode(this.form_[fieldName]);
  this.hidden_.appendChild(field);
};

/** @inheritDoc */
bru.ui.ImageListGroup2.prototype.handleDragStart_ = function(e) {
  //goog.pubsub.PubSub.getInstance().publish('uploader-showoverlay', false);

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
bru.ui.ImageListGroup2.prototype.handleDragMove_ = function(dragEvent) {

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
bru.ui.ImageListGroup2.prototype.handleDragEnd_ = function(dragEvent) {
  this.sync_();

  //goog.pubsub.PubSub.getInstance().publish('uploader-showoverlay', true);

  return bru.ui.ImageListGroup2.superClass_.handleDragEnd_.call(this, dragEvent);
};


/** @inheritDoc */
bru.ui.ImageListGroup2.prototype.getHoverNextItem_ = function(
    hoverList, draggerElCenter) {

  var hoverListItems = goog.dom.getChildren(hoverList);

  var afterItemIndex;
  var distanceToClosestPoint = Infinity;
  var side;

  for (var i = 0, item; item = hoverListItems[i]; i++) {
    var distanceToPoint = bru.ui.ImageListGroup2.distanceFromItem_(item, draggerElCenter);
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
bru.ui.ImageListGroup2.distanceFromItem_ = function(item, target) {
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
bru.ui.ImageListGroup2.prototype.showCrop_ = function(context) {
  // Получаем метаданные по текущему изображению.
  // TODO: Наверное имеет смысл вынести в отдельный метод,
  // если вдруг еще где понадобится.
  var target = context.getElement();
  this.cropItem_ = /** @type {Element} */ (goog.dom.getAncestorByClass(target,
      goog.getCssName(this.getCssClass(), 'item')));
  var index = goog.dom.dataset.get(this.cropItem_, 'index');
  var info = this.getItemInfo_(this.form_[this.type_ + '-' + index]);
  this.cropInfo_ = info;

  this.cropDialog_ = new bru.ui.Dialog2(
      goog.dom.getElementByClass(goog.getCssName(this.getCssClass(), 'pic'),
      this.cropItem_));
  this.cropDialog_.setContent(this.getCropDialogHtml_(info));
  this.cropDialog_.render();
  this.cropDialog_.setVisible(true);

  var crop = new bru.ui.Crop(
      /** @type {string} */ (info.preview),
      info.previewSize[0], info.previewSize[1]);
  crop.setMinSize(info.cropMinSize[0], info.cropMinSize[1]);
  if (this.aspectRatio_) {
     crop.setAspectRatio(this.aspectRatio_);
  }
  if (info.crop && info.crop.length) {
    crop.setPreset(info.crop[0], info.crop[1], info.crop[2], info.crop[3]);
  } else {
    crop.setMaxSize();
  }
  crop.decorate(this.cropDialog_.getElementByClass(goog.getCssName('dialog-crop-preview')));
  this.crop_ = crop;

  this.eventHandler_
      .listenOnce(this.cropDialog_, goog.ui.PopupBase.EventType.HIDE,
          function() {crop.dispose();});
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
bru.ui.ImageListGroup2.prototype.updateCrop_ = function(context) {
  bru.jsaction.util.preventDefault(context.getEvent());

  var newCrop = this.crop_.get();
  var newCropArray = [newCrop.left, newCrop.top, newCrop.width, newCrop.height];

  var q = goog.Uri.QueryData.createFromMap({
    '_': 'crop',
    'id': this.cropInfo_.id,
    'crop': newCropArray.join(','),
    'type': this.type_
  });

  var fctx = goog.global['d2']['__fctx'];
  if (fctx && fctx.length) {
    for (var i = 0, key; key = fctx[i]; i += 2) {
      q.add(key, fctx[i + 1]);
    }
  }

  goog.dispose(this.xhr_);
  this.xhr_ = new bru.net.xhr.Xhr(
    new goog.structs.Map('upx', {
      url: bru.ui.uploader.ImageUploaderBase.UPLOADER_URL,
      behaviour: bru.net.xhr.Behaviour.SHOW_ERRORS
    })
  );
  this.xhr_.send('upx', q, this.updateCropCallback_, this, undefined, {
        anchor: context.getElement()['submit'],
        spinner: drive2.spinner(goog.dom.getElementByClass(
            goog.getCssName('dialog-crop-spinner'), context.getElement()))
      }, newCropArray);
};


/**
 * @param {*} data
 * @param {Array.<number>} cropArray
 * @private
 */
bru.ui.ImageListGroup2.prototype.updateCropCallback_ = function(data, cropArray) {
  goog.dispose(this.xhr_);

  this.cropInfo_.crop = cropArray;

  var field = this.form_[this.type_ + '-' + this.cropInfo_.index];
  field.value = data['id'];
  goog.dom.dataset.set(field, 'crop', cropArray.join(','));

  this.resizeThumbnailCrop_(this.cropItem_, this.cropInfo_);

  this.cropInfo_ = null;
  this.cropItem_ = null;
  this.cropDialog_.setVisible(false);
};


/**
 * @param {bru.ui.ImageListGroup2.ItemInfo} info
 * @return {string}
 * @private
 */
bru.ui.ImageListGroup2.prototype.getThumbnailHtml_ = function(info) {
  var controlCssName = goog.getCssName(this.getCssClass(), 'control');
  var captionCssName = goog.getCssName(controlCssName, 'caption');
  return '<div class="' + goog.getCssName(this.getCssClass(), 'item') + '" data-index="' + info.index + '">' +
      '<div class="' + goog.getCssName(this.getCssClass(), 'pic-wrapper') + '">' +
      this.getThumbnailWrapperHtml_(info) +
      '</div>' +
      '<div class="' + goog.getCssName(this.getCssClass(), 'controls') + '">' +
      this.getThumbnailControlsHtml_(info) +
      '</div></div>';
};


/**
 * @param {bru.ui.ImageListGroup2.ItemInfo} info
 * @return {string}
 * @private
 */
bru.ui.ImageListGroup2.prototype.getThumbnailWrapperHtml_ = function(info) {
  return '<div class="' + goog.getCssName(this.getCssClass(), 'pic') + '" style="width:' +
      info.thumbnailSize[0] + 'px;height:' + info.thumbnailSize[1] +
      'px"><img src="' + info.thumbnail + '" width=' +
      info.thumbnailSize[0] + ' height=' + info.thumbnailSize[1] +
      '><div class="' + goog.getCssName(this.getCssClass(), 'pic-overlay') +
      '"></div><img src="' + info.thumbnail + '" class="' + goog.getCssName(this.getCssClass(), 'pic-mask') + '"></div>' +
      (this.showNumbers_ ? '<span class="' + goog.getCssName(this.getCssClass(), 'number') + '">' +
      info.index + '</span>' : '');
};


/**
 * @param {bru.ui.ImageListGroup2.ItemInfo} info
 * @return {string}
 * @private
 */
bru.ui.ImageListGroup2.prototype.getThumbnailControlsHtml_ = function(info) {
  var controlCssName = goog.getCssName(this.getCssClass(), 'control');
  var captionCssName = goog.getCssName(controlCssName, 'caption');
  return (this.allowCrop_ && info.preview ? '<div class="' + controlCssName + ' ' +
      goog.getCssName(controlCssName, 'crop') + '">' +
      '<span class="' + captionCssName +
      '" data-action="' + this.ilgNamespace_ + '.crop" onclick="">' +
      bru.i18n.ImageListGroup.ACTION_CROP + '</span></div>' : '') +
      (this.allowLink_ ? '<div class="' + controlCssName + ' ' +
      goog.getCssName(controlCssName, 'link') + '">' +
      '<span class="' + captionCssName +
      '" data-action="' + this.ilgNamespace_ + '.link" onclick="">' +
      bru.i18n.ImageListGroup.ACTION_LINK + '</span></div>' : '') +
      (this.allowReplace_ ? '<div class="' +
      goog.getCssName(controlCssName, 'replace') + '"></div>' : '') +
      '<div class="' + controlCssName + ' ' +
      goog.getCssName(controlCssName, 'remove') + '">' +
      '<span class="' + captionCssName +
      '" data-action="' + this.ilgNamespace_ + '.remove" onclick="">' +
      bru.i18n.ImageListGroup.ACTION_DELETE + '</span></div>' +
      '<div style="display:none" class="' + controlCssName + ' ' +
      goog.getCssName(controlCssName, 'remove-confirm') + '">' +
      bru.i18n.ImageListGroup.ACTION_CONFIRM + '</div>';
};


/**
 * @param {bru.ui.ImageListGroup2.ItemInfo} info
 * @return {string}
 * @private
 */
bru.ui.ImageListGroup2.prototype.getCropDialogHtml_ = function(info) {
  var cssName = goog.getCssName('dialog-crop');
  // TODO: сабмит по ctrl+enter.
  return '<div class="' + cssName + '">' +
      '<h3>' + bru.i18n.ImageListGroup.CROP_CAPTION + '</h3>' +
      '<form data-keysubmit="1" data-action="submit:' +
      this.ilgNamespace_ + '.cropsubmit">' +
      '<div class="' + goog.getCssName(cssName, 'description') +
      '" style="width:' + info.previewSize[0] + 'px">' +
      bru.i18n.ImageListGroup.CROP_INTRO + '</div>' +
      '<div class="' + goog.getCssName(cssName, 'preview') +
      '"><img src="' + info.preview + '" width="' +
      info.previewSize[0] + '" height="' + info.previewSize[1] + '"></div>' +
      '<div class="' + goog.getCssName(cssName, 'buttons') + '">' +
      '<span class="' + goog.getCssName(cssName, 'spinner') + '"></span>' +
      '<button name="submit" class="xbutton" type="submit">' +
      bru.i18n.ImageListGroup.CROP_SUBMIT_BUTTON +
      '</button></div></form>' +
      '</div>';
};
