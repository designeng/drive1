goog.provide('bru.ui.uploader.ImageUploaderBase');
goog.provide('bru.ui.uploader.ImageUploaderBase.EventType');
goog.provide('bru.ui.uploader.ImageUploaderBaseEvent');
goog.provide('bru.ui.uploader.Plupload');

goog.require('bru.ga.trackEvent');
goog.require('bru.i18n.ImageUploader');
goog.require('bru.ui.bubble');
goog.require('bru.ui.uploader.Plupload');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events.Event');
goog.require('goog.i18n.MessageFormat');
goog.require('goog.json');
goog.require('goog.style');
goog.require('goog.ui.Component');



/**
 * Константы plupload.
 * @enum {number}
 */
bru.ui.uploader.Plupload = {
  STOPPED: 1,
  STARTED: 2,
  QUEUED: 1,
  UPLOADING: 2,
  FAILED: 4,
  DONE: 5,
  GENERIC_ERROR: -100,
  HTTP_ERROR: -200,
  IO_ERROR: -300,
  SECURITY_ERROR: -400,
  INIT_ERROR: -500,
  FILE_SIZE_ERROR: -600,
  FILE_EXTENSION_ERROR: -601,
  IMAGE_FORMAT_ERROR: -700,
  IMAGE_MEMORY_ERROR: -701,
  IMAGE_DIMENSIONS_ERROR: -702
};


/**
 * @param {string} entityType
 * @param {string=} opt_buttonClass
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
bru.ui.uploader.ImageUploaderBase = function(entityType, opt_buttonClass, opt_domHelper) {
  goog.base(this, opt_domHelper);

  /**
   * @type {string}
   * @private
   */
  this.entityType_ = entityType;

  /**
   * @type {string?}
   * @private
   */
  this.buttonClass_ = opt_buttonClass || null;

  /**
   * @type {string}
   * @private
   */
  this.buttonId_ = this.makeId('b');

  /**
   * @type {string}
   * @private
   */
  this.containerId_ = this.makeId('c');

  /**
   * @type {Array.<string>}
   * @private
   */
   this.errors_ = [];
};
goog.inherits(bru.ui.uploader.ImageUploaderBase, goog.ui.Component);


/**
 * Uploader url.
 * @type {string}
 */
bru.ui.uploader.ImageUploaderBase.UPLOADER_URL = '/ajax/upload.cshtml';


/**
 * Максимальный размер файла.
 * @type {string}
 */
bru.ui.uploader.ImageUploaderBase.UPLOADER_MAX_SIZE = '23MB';


/**
 * Action (_) отправляющийся на сервер.
 * @type {string}
 */
bru.ui.uploader.ImageUploaderBase.prototype.action_ = 'upload';


/**
 * Показывать числа перед списком файлов.
 * @type {number}
 * @private
 */
bru.ui.uploader.ImageUploaderBase.prototype.maxFiles_ = 1;


/**
 * data-поля для кнопки.
 * @type {Object.<string>}
 * @private
 */
bru.ui.uploader.ImageUploaderBase.prototype.dataAttributes_ = {};


/**
 * Кастомный заголовок кнопки загрузки. По умолчанию берется из ресурсов.
 * @type {string}
 * @private
 */
bru.ui.uploader.ImageUploaderBase.prototype.buttonCaption_ = bru.i18n.ImageUploader.ADD_FILE_BUTTON;


/**
 * @enum {string}
 */
bru.ui.uploader.ImageUploaderBase.EventType = {
  READY: 'ready'
};


/**
 * @return {string} Base CSS class.
 */
bru.ui.uploader.ImageUploaderBase.prototype.getCssClass = function() {
  return goog.getCssName('uploader');
};


/**
 * @return {string}
 */
bru.ui.uploader.ImageUploaderBase.prototype.getAction = function() {
  return this.action_;
};


/**
 * @param {string} action
 */
bru.ui.uploader.ImageUploaderBase.prototype.setAction = function(action) {
  this.action_ = action;
};


/**
 * @param {string} name
 * @param {string} value
 */
bru.ui.uploader.ImageUploaderBase.prototype.setDataAttribute = function(name, value) {
  this.dataAttributes_[name] = value;
};


/**
 * @param {number} num
 */
bru.ui.uploader.ImageUploaderBase.prototype.setMaxFiles = function(num) {
  this.maxFiles_ = num;
  if (this.uploader_) {
    this.pluploadInit_();
  }
  if (this.buttonEl_) {
    this.buttonEl_.innerHTML =
        new goog.i18n.MessageFormat(bru.i18n.ImageUploader.ADD_FILE_BUTTON)
        .format({'NUM_FILES': num});
  }
};


/**
 * @return {number}
 */
bru.ui.uploader.ImageUploaderBase.prototype.getMaxFiles = function() {
  return this.maxFiles_;
};


/**
 * @param {string} caption
 */
bru.ui.uploader.ImageUploaderBase.prototype.setButtonCaption = function(caption) {
  this.buttonCaption_ = caption;
};


/**
 * @return {string}
 */
bru.ui.uploader.ImageUploaderBase.prototype.getButtonCaption = function() {
  return this.buttonCaption_;
};


/** @override */
bru.ui.uploader.ImageUploaderBase.prototype.canDecorate = function(element) {
  return false;
};


/** @override */
bru.ui.uploader.ImageUploaderBase.prototype.createDom = function() {
  goog.base(this, 'createDom');

  var element = this.getElement();
  goog.asserts.assert(element, 'getElement() returns null');

  var dom = goog.dom.getDomHelper();
  var progressClass = goog.getCssName(this.getCssClass(), 'progress');
  goog.dom.classlist.add(element, this.getCssClass());
  goog.dom.append(element,
      this.containerEl_ = dom.createDom('div',
          goog.getCssName(this.getCssClass(), 'button'),
          this.buttonEl_ = dom.createDom('span', goog.getCssName(this.getCssClass(), 'button-text') + (this.buttonClass_ ? ' ' + this.buttonClass_ : ''))),
      this.progressEl_ = dom.createDom('div', progressClass,
          this.progressBarEl_ = dom.createDom('div', goog.getCssName(progressClass, 'bar'))),
      this.progressNumEl_ = dom.createDom('div',
          goog.getCssName(progressClass, 'num')));
  this.buttonEl_.innerHTML = new goog.i18n.MessageFormat(this.buttonCaption_).format({'NUM_FILES': this.maxFiles_});
  this.buttonEl_.id = this.buttonId_;
  for (var prop in this.dataAttributes_) {
    this.buttonEl_.setAttribute('data-' + prop, this.dataAttributes_[prop]);
  }
  this.containerEl_.id = this.containerId_;
  this.setProgress_(0, 0, 0);
  this.enableProgress_(false);
};


/** @override */
bru.ui.uploader.ImageUploaderBase.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.pluploadInit_();
};


/**
 * @private
 */
bru.ui.uploader.ImageUploaderBase.prototype.pluploadInit_ = function() {
  if (this.uploader_) {
    this.uploader_.destroy();
    this.uploader_ = null;
  }

  var params = {
    'type': this.entityType_,
    '_': this.action_
  };
  var fctx = goog.global['d2']['__fctx'];
  if (fctx && fctx.length) {
    for (var i = 0, key; key = fctx[i]; i += 2) {
      params[key] = fctx[i + 1];
    }
  }

  this.uploader_ = new plupload.Uploader({
    'container': this.containerId_,
    'runtimes': 'html5,flash,html4',
    'browse_button': this.buttonId_,
    'max_file_size': bru.ui.uploader.ImageUploaderBase.UPLOADER_MAX_SIZE,
    'url': bru.ui.uploader.ImageUploaderBase.UPLOADER_URL,
    'flash_swf_url': '/images/uploader.swf',
    'filters': [
      {'title': 'Image files', 'extensions': 'jpeg,jpg,JPEG,JPG'}
    ],
    'required_features': 'multi_selection,multipart',
    'multi_selection': this.maxFiles_ > 1,
    'multipart': true,
    'multipart_params': params,
    'urlstream_upload': true
  });

  // Подписываемся на uploader-showoverlay для того чтобы перемещать за пределы
  // экрана флэшевый оверлей. Например во время драг'н'дропа, т.к. флэш
  // этого почему-то не любит.
  //this.subKey_ = goog.pubsub.PubSub.getInstance()
  //    .subscribe('uploader-showoverlay', this.showFlashOverlay, this);

  this.uploader_.init();

  this.uploader_.bind('FilesAdded', this.plFilesAdded_, this);
  this.uploader_.bind('StateChanged', this.plStateChanged_, this);
  this.uploader_.bind('UploadProgress', this.plUploadProgress_, this);
  this.uploader_.bind('Error', this.plError_, this);
  this.uploader_.bind('FileUploaded', this.plFileUploaded_, this);
  this.uploader_.bind('UploadComplete', this.plUploadComplete_, this);
};


/** @override */
bru.ui.uploader.ImageUploaderBase.prototype.exitDocument = function() {
  goog.base(this, 'exitDocument');
};


/** @inheritDoc */
bru.ui.uploader.ImageUploaderBase.prototype.disposeInternal = function() {
  //goog.pubsub.PubSub.getInstance().unsubscribeByKey(this.subKey_);

  if (this.uploader_) {
    this.uploader_.destroy();
    this.uploader_ = null;
  }

  goog.base(this, 'disposeInternal');
};


/**
 * @param {boolean} b
 */
bru.ui.uploader.ImageUploaderBase.prototype.setVisible = function(b) {
  this.isVisible_ = b;
  if (this.element_) {
    goog.style.setElementShown(this.element_, b);
  }
};


/**
 * @param {boolean} b
 */
bru.ui.uploader.ImageUploaderBase.prototype.showFlashOverlay = function(b) {
  if (this.uploader_) {
    this.uploader_.refresh(!b);
  }
};


/**
 * @param {boolean} b
 * @private
 */
bru.ui.uploader.ImageUploaderBase.prototype.enableProgress_ = function(b) {
  goog.style.setElementShown(this.buttonEl_, !b);
  this.showFlashOverlay(!b);
  goog.style.setElementShown(this.progressEl_, b);
  goog.style.setElementShown(this.progressNumEl_, b);
};


/**
 * @private
 * @param {number} percent
 * @param {number} uploaded
 * @param {number} total
 */
bru.ui.uploader.ImageUploaderBase.prototype.setProgress_ = function(percent, uploaded, total) {
  this.progressBarEl_.style.width = percent + '%';
  this.progressNumEl_.innerHTML = uploaded + '/' + total;
};


/**
 * @private
 */
bru.ui.uploader.ImageUploaderBase.prototype.showErrors_ = function() {
  if (this.errors_.length && this.isVisible_) {
    bru.ui.bubble.bubble(this.getElement(), '<ul><li>' + this.errors_.join('<li>') + '</ul>');
  }
  this.errors_.length = 0;
};


/**
 * Fires while when the user selects files to upload.
 * @param {plupload.Uploader} uploader
 * @param {Array.<Object>} files
 * @private
 */
bru.ui.uploader.ImageUploaderBase.prototype.plFilesAdded_ = function(uploader, files) {
  clearTimeout(this.errorTm_);

  //bru.ga.trackEvent('Uploader', 'Runtime', uploader.runtime);

  var maxfiles = this.getMaxFiles();
  var delta = uploader.files.length - maxfiles;
  if (delta > 0) {
    uploader.splice(maxfiles, delta);
    maxfiles -= delta;
  }
  this.setProgress_(0, 0, uploader.files.length);
  uploader.start();
};


/**
 * Fires when the overall state is being changed for the upload queue.
 * @param {plupload.Uploader} uploader
 * @private
 */
bru.ui.uploader.ImageUploaderBase.prototype.plStateChanged_ = function(uploader) {
  var uploading = uploader.state === bru.ui.uploader.Plupload.STARTED;
  this.enableProgress_(uploading);
};


/**
 * Fires while a file is being uploaded.
 * @param {plupload.Uploader} uploader
 * @param {Object} file
 * @private
 */
bru.ui.uploader.ImageUploaderBase.prototype.plUploadProgress_ = function(uploader, file) {
  this.setProgress_(uploader.total.percent, uploader.total.uploaded + uploader.total.failed,
      uploader.total.failed + uploader.total.queued + uploader.total.uploaded);
};


/**
 * Fires when a error occurs.
 * @param {plupload.Uploader} uploader
 * @param {Object} error
 * @private
 */
bru.ui.uploader.ImageUploaderBase.prototype.plError_ = function(uploader, error) {
  var gaAction = 'Error-' + error['message'] && error['message'].indexOf('2038') >= 0 ?
                 '2038' : uploader.runtime + error['code'];
  bru.ga.trackEvent('Uploader', 'Error-' + gaAction, goog.json.serialize(error));

  var msg;
  if (error.code == bru.ui.uploader.Plupload.FILE_SIZE_ERROR) {
    msg = new goog.i18n.MessageFormat(bru.i18n.ImageUploader.FILE_SIZE_ERROR)
        .format({'SIZE': error.file && error.file.size ? ' (' + plupload.formatSize(error.file.size) + ')' : '',
        'MAX_SIZE': bru.ui.uploader.ImageUploaderBase.UPLOADER_MAX_SIZE});
  } else if (error.code == bru.ui.uploader.Plupload.IMAGE_FORMAT_ERROR ||
             error.code == bru.ui.uploader.Plupload.FILE_EXTENSION_ERROR) {
    msg = bru.i18n.ImageUploader.IMAGE_FORMAT_ERROR;
  } else {
    var status = error.xrequestid || error.status;
    msg = new goog.i18n.MessageFormat(bru.i18n.ImageUploader.IU_UNKNOWN_ERROR)
        .format({'CODE': error.code + (status ? '; ' + status : '')});
  }
  var filename = error.file ?
      '<strong>' + error.file.name + '</strong>: ' : '';
  this.errors_.push(filename + msg);

  // Показываем ошибки если не было добавлено ни одного файла без ошибок.
  // В этом случае UploadComplete не триггерится.
  clearTimeout(this.errorTm_);
  this.errorTm_ = setTimeout(goog.bind(this.showErrors_, this), 100);
};


/**
 * Fires when a file is successfully uploaded.
 * @param {plupload.Uploader} uploader
 * @param {Object} file
 * @param {Object} info
 * @private
 */
bru.ui.uploader.ImageUploaderBase.prototype.plFileUploaded_ = function(uploader, file, info) {
  /** @preserveTry */
  try {
    file.info = goog.json.unsafeParse(info.response);
  } catch (ex) {
    file.info = {};
    file.info['error'] = new goog.i18n.MessageFormat(bru.i18n.ImageUploader.INVALID_JSON)
        .format({'STATUS': info.xrequestid || info.status});
    file.status = bru.ui.uploader.Plupload.FAILED;
  }

  if (file.info['error'] || file.info['notification']) {
    file.status = bru.ui.uploader.Plupload.FAILED;
  }
};


/**
 * Fires when all files in a queue are uploaded.
 * @param {plupload.Uploader} uploader
 * @param {Array.<Object>} files
 * @private
 */
bru.ui.uploader.ImageUploaderBase.prototype.plUploadComplete_ = function(uploader, files) {
  var data = [];
  for (var i = 0, file; (file = files[i]); i++) {
    if (file.status == bru.ui.uploader.Plupload.FAILED) {
      if (file.info) {
        this.errors_.push((file.name ? '<strong>' + file.name + '</strong>: ' : '') +
            (file.info['error'] || file.info['notification']));
      }
    } else {
      data.push(file.info);
    }
  }

  if (data.length) {
    this.dispatchEvent(
        new bru.ui.uploader.ImageUploaderBaseEvent(
        bru.ui.uploader.ImageUploaderBase.EventType.READY,
        data));
  }

  this.showErrors_();

  // Очищаем очередь файлов.
  uploader.splice();
};


/**
 * @param {string} type  The type of event.
 * @param {Array.<*>} files
 * @constructor
 * @extends {goog.events.Event}
 */
bru.ui.uploader.ImageUploaderBaseEvent = function(type, files) {
  goog.events.Event.call(this, type);

  /**
   * @type {Array.<*>}
   */
  this.files = files;
};
goog.inherits(bru.ui.uploader.ImageUploaderBaseEvent, goog.events.Event);
