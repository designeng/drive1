goog.provide('bru.ui.uploader.ImageUploader');
goog.provide('bru.ui.uploader.ImageUploader.EventType');
goog.provide('bru.ui.uploader.ImageUploaderEvent');

goog.require('bru.jsaction.EventContract');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.pubsub.PubSub');
goog.require('goog.style');



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
 * Сообщения об ошибках.
 * @enum {string}
 */
bru.ui.uploader.Messages = {
  FILE_SIZE_ERROR: 'Слишком большой файл. Максимально допустимый размер 10MB.',
  IMAGE_FORMAT_ERROR: 'Неизвестный формат изображения. Поддерживаемые форматы: JPEG, GIF, PNG.',
  IMAGE_DIMENSIONS_ERROR: 'Неизвестная ошибка при добавлении файла.' // На самом деле известная
};


/**
 * @param {string} entityId
 * @param {Element|string} container
 * @constructor
 * @extends {goog.events.EventTarget}
 */
bru.ui.uploader.ImageUploader = function(entityId, container) {
  goog.events.EventTarget.call(this);

  /**
   * @type {string}
   * @private
   */
  this.entityId_ = entityId;

  /**
   * @type {number}
   * @private
   */
  this.id_ = ++bru.ui.uploader.ImageUploader.uidCounter_;

  /**
   * @type {Element}
   */
  this.wrapper_ = goog.dom.getElement(container);
};
goog.inherits(bru.ui.uploader.ImageUploader, goog.events.EventTarget);


bru.ui.uploader.ImageUploader.prototype.init = function() {
  // Если класс задан, то считаем что dom для аплоадера уже сформирован.
  // decorate пока не нужен.
  if (!goog.dom.classlist.contains(this.wrapper_,
      goog.getCssName(this.getBaseCssClass(), 'wrapper'))) {
    this.render_();
  }

  /**
   * @type {Element}
   * @private
   */
  this.filelist_ = goog.dom.getElementByClass(
      goog.getCssName(this.getBaseCssClass(), 'filelist'), this.wrapper_);

  /**
   * @type {Element}
   * @private
   */
  this.readyBtn_ = goog.dom.getElementByClass(
      goog.getCssName(this.getBaseCssClass(), 'button-ready'), this.wrapper_);

  var buttonId = 'plupload-button-' + this.id_;
  var wrapperId = 'plupload-wrapper-' + this.id_;

  /**
   * @type {Element}
   * @private
   */
  this.uploadBtn_ = goog.dom.getElement(buttonId);

  var uploader = new plupload.Uploader({
    'container': wrapperId,
    'runtimes': 'flash,html5,html4',
    'browse_button': buttonId,
    'max_file_size': bru.ui.uploader.ImageUploader.UPLOADER_MAX_SIZE,
    'url': bru.ui.uploader.ImageUploader.UPLOADER_URL,
    'flash_swf_url': '/js/uploader.swf',
    'filters': [
      {'title': 'Image files', 'extensions': 'jpg,gif,png'}
    ],
    'multi_selection': this.getMaxFiles() != 1,
    'multipart_params': {'id': this.entityId_},
    'required_features': 'multi_selection,multipart',
    'urlstream_upload': true
  });
  this.uploader_ = uploader;

  var contract = bru.jsaction.EventContract.getInstanceForDocument();
  var dispatcher = contract.getDispatcher();
  dispatcher.registerHandlers('uploader', {
    'retry': this.retry_,
    'stop': this.stop_,
    'ready': this.ready_,
    'remove': this.removeFile_
  }, this);

  /**
   * @type {goog.pubsub.PubSub}
   */
  var pubsub = goog.pubsub.PubSub.getInstance();
  // Пока ни для чего не нужно рефрешить позицию кнопки.
  //pubsub.subscribe('uploader-refresh', this.refresh, this);
  pubsub.subscribe('uploader-sethiden', this.setHidden, this);

  uploader.init();

  uploader.bind('FilesAdded', function(up, files) {
    var maxfiles = this.getMaxFiles();
    var delta = up.files.length - maxfiles;
    if (delta > 0) {
      up.splice(maxfiles, delta);
    }
    up.start();
  }, this);

  uploader.bind('StateChanged', function(up) {
    this.updateList_(up);
    var uploading = uploader.state === bru.ui.uploader.Plupload.STARTED;
    goog.style.setElementShown(this.readyBtn_, !uploading && up.files.length > 0);
  }, this);

  uploader.bind('UploadProgress', function(up, file) {
    var wrapper = goog.dom.getElement(file.id);
    goog.dom.classlist.add(wrapper, goog.getCssName(this.getBaseCssClass(), 'uploading'));
    var el = goog.dom.getElementByClass(goog.getCssName(this.getBaseCssClass(), 'file-progress-p'), wrapper);
    if (el) {
      el.style.width = file['percent'] + 'px';
    }
  }, this);

  uploader.bind('Error', function(up, err) {
    var msg;
    if (err.code == bru.ui.uploader.Plupload.FILE_SIZE_ERROR) {
      msg = bru.ui.uploader.Messages.FILE_SIZE_ERROR;
    } else if (err.code == bru.ui.uploader.Plupload.IMAGE_FORMAT_ERROR) {
      msg = bru.ui.uploader.Messages.IMAGE_FORMAT_ERROR;
    } else if (err.code == bru.ui.uploader.Plupload.IMAGE_DIMENSIONS_ERROR) {
      msg = bru.ui.uploader.Messages.IMAGE_DIMENSIONS_ERROR;
    }
    if (msg) {
      var filename = err.file ? 'Файл: ' + err.file.name + '.\n' : '';
      alert(filename + msg);
    }
  }, this);

  uploader.bind('QueueChanged', this.updateList_, this);

  uploader.bind('BeforeUpload', this.updateList_, this);

  uploader.bind('FileUploaded', function(up, file, info) {
    /** @preserveTry */
    try {
      file.info = goog.json.unsafeParse(info.response);
    } catch (ex) {
      file.info = {};
      file.info['error'] = 'Ошибочный ответ сервера.';
    }

    if (file.info && file.info['error']) {
      file.status = bru.ui.uploader.Plupload.FAILED;
    }
    this.updateList_(up);
  }, this);

  uploader.bind('UploadComplete', function(up, files) {
    var noErrors = true;
    for (var i = 0, file; file = files[i]; i++) {
      if (file.status != bru.ui.uploader.Plupload.DONE) {
        noErrors = false;
        break;
      }
    }
    // Закрываем аплоадер если не было ошибок при загрузке.
    if (this.getAutoclose() && noErrors) {
      this.ready_();
    }
  }, this);
};


/** @inheritDoc */
bru.ui.uploader.ImageUploader.prototype.disposeInternal = function() {
  bru.ui.uploader.ImageUploader.superClass_.disposeInternal.call(this);

  this.uploader_.destroy();

  goog.dom.classlist.remove(this.wrapper_,
      goog.getCssName(this.getBaseCssClass(), 'wrapper'));
  this.wrapper_.innerHTML = '';
};


/**
 * @param {Array.<*>} files
 */
bru.ui.uploader.ImageUploader.prototype.handleReady = function(files) {
  var iuEvent = new bru.ui.uploader.ImageUploaderEvent(
      bru.ui.uploader.ImageUploader.EventType.READY,
      files);

  this.dispatchEvent(iuEvent);
};


/**
 * Default CSS class.
 * @type {string}
 */
bru.ui.uploader.ImageUploader.BASE_CSS_CLASS = goog.getCssName('plupload');


/**
 * Counter for UID.
 * @type {number}
 * @private
 */
bru.ui.uploader.ImageUploader.uidCounter_ = 0;


/**
 * Uploader url.
 * @type {string}
 */
bru.ui.uploader.ImageUploader.UPLOADER_URL = '/upload.php';


/**
 * Максимальный размер файла.
 * @type {string}
 */
bru.ui.uploader.ImageUploader.UPLOADER_MAX_SIZE = '10mb';


/**
 * Показывать числа перед списком файлов.
 * @type {boolean}
 * @private
 */
bru.ui.uploader.ImageUploader.prototype.showNumbers_ = false;


/**
 * Показывать числа перед списком файлов.
 * @type {number}
 * @private
 */
bru.ui.uploader.ImageUploader.prototype.maxFiles_ = 1;


/**
 * Автоматически закрывать аплоадер после загрузки.
 * @type {boolean}
 * @private
 */
bru.ui.uploader.ImageUploader.prototype.autoclose_ = true;


/**
 * @return {string} Base CSS class.
 */
bru.ui.uploader.ImageUploader.prototype.getBaseCssClass = function() {
  return bru.ui.uploader.ImageUploader.BASE_CSS_CLASS;
};


/**
 * @param {boolean} b
 */
bru.ui.uploader.ImageUploader.prototype.setShowNumbers = function(b) {
  this.showNumbers_ = b;
};


/**
 * @return {boolean}
 */
bru.ui.uploader.ImageUploader.prototype.getShowNumbers = function() {
  return this.showNumbers_;
};


/**
 * @param {number} num
 */
bru.ui.uploader.ImageUploader.prototype.setMaxFiles = function(num) {
  this.maxFiles_ = num;
  if (this.uploader_) {
    this.uploader_.settings['multi_selection'] = num != 1;
    this.refresh();
  }
};


/**
 * @return {number}
 */
bru.ui.uploader.ImageUploader.prototype.getMaxFiles = function() {
  return this.maxFiles_;
};


/**
 * @param {boolean} b
 */
bru.ui.uploader.ImageUploader.prototype.setAutoclose = function(b) {
  this.autoclose_ = b;
};


/**
 * @return {boolean}
 */
bru.ui.uploader.ImageUploader.prototype.getAutoclose = function() {
  return this.autoclose_;
};


/**
 * Перерисовываем оверлей на кнопке загрузке.
 */
bru.ui.uploader.ImageUploader.prototype.refresh = function() {
  if (!this.hidden_ && this.uploader_) {
    this.uploader_.refresh();
  }
};


/**
 * @param {boolean} b
 */
bru.ui.uploader.ImageUploader.prototype.setDisabled = function(b) {
  this.setHidden(b);
  goog.style.setElementShown(this.wrapper_, !b);
};


/**
 * @param {boolean} b
 */
bru.ui.uploader.ImageUploader.prototype.setHidden = function(b) {
  this.hidden_ = b;
  if (this.uploader_) {
    this.uploader_.refresh(b);
  }
};


/**
 * @private
 */
bru.ui.uploader.ImageUploader.prototype.render_ = function() {
  goog.dom.classlist.add(this.wrapper_, goog.getCssName(this.getBaseCssClass(), 'wrapper'));
  this.wrapper_.id = 'plupload-wrapper-' + this.id_;
  this.wrapper_.innerHTML = '<div class="' + goog.getCssName(this.getBaseCssClass(), 'filelist') + '"></div>' +
      '<span id="plupload-button-' + this.id_ + '" class="' + goog.getCssName(this.getBaseCssClass(), 'button') + ' ' +
      goog.getCssName(this.getBaseCssClass(), 'button-add') +
      '">Загрузить файл' + (this.getMaxFiles() == 1 ? '' : 'ы') + ' </span>' +
      '<span class="' + goog.getCssName(this.getBaseCssClass(), 'button') + ' ' +
      goog.getCssName(this.getBaseCssClass(), 'button-ready') +
      '" data-action="uploader.ready" style="display:none"><span>Готово</span></span>';
};


/**
 * @private
 */
bru.ui.uploader.ImageUploader.prototype.updateList_ = function(up) {
  var html = [];
  for (var i = 0, file; file = up.files[i]; i++) {
    var className;
    if (file.status == bru.ui.uploader.Plupload.DONE) {
      className = goog.getCssName(this.getBaseCssClass(), 'done');
    } else if (file.status == bru.ui.uploader.Plupload.FAILED) {
      className = goog.getCssName(this.getBaseCssClass(), 'failed');
    } else if (file.status == bru.ui.uploader.Plupload.QUEUED) {
      className = goog.getCssName(this.getBaseCssClass(), 'delete');
    } else if (file.status == bru.ui.uploader.Plupload.UPLOADING) {
      className = goog.getCssName(this.getBaseCssClass(), 'uploading');
    }
    var fileClassName = goog.getCssName(this.getBaseCssClass(), 'file');
    html[i] = '<div id="' + file.id + '" class="' +
        fileClassName + ' ' + className + '" data-namespace="uploader">' +
        (this.showNumbers_ ?
            '<span class="' + goog.getCssName(fileClassName, 'number') + '">' +
            (i + 1) + '.</span>' : '') +
        '<span class="' + goog.getCssName(fileClassName, 'name') + '">' + file.name + '</span>' +
        (this.uploader_.runtime != 'html4' ?
            '<span class="' + goog.getCssName(fileClassName, 'size') + '">' +
            plupload.formatSize(file.size) + '</span>' : '') +
        (file.status == bru.ui.uploader.Plupload.UPLOADING ?
            '<span class="' + goog.getCssName(fileClassName, 'progress') + '">' +
            '<span class="' + goog.getCssName(fileClassName, 'progress-p') + '" style="width:' + file.percent + 'px"></span></span>' : '') +
        (file.status == bru.ui.uploader.Plupload.UPLOADING ?
            '' : '<span class="' + goog.getCssName(fileClassName, 'action') + '" data-action="remove">Удалить</span>') +
        (file.status == bru.ui.uploader.Plupload.FAILED ||
            (file.status == bru.ui.uploader.Plupload.STOPPED && up.state != bru.ui.uploader.Plupload.UPLOADING) ?
            '<span class="' + goog.getCssName(fileClassName, 'action') + '" data-action="retry">' +
            (file.status == bru.ui.uploader.Plupload.STOPPED ? 'Продолжить' : 'Повторить') + '</span>' : '') +
        (file.status == bru.ui.uploader.Plupload.FAILED && file.info && file.info['error'] ?
            '<span class="' + goog.getCssName(fileClassName, 'error-info') + '">' +
            file.info['error'] + '</span>' : '') +
        '</div>';
  }
  this.filelist_.innerHTML = html.join('');

  // Обновляем оверлей если количество файлов поменялось.
  if (!this.filesNum_ || this.filesNum_ != up.files.length) {
    this.filesNum_ = up.files.length;
    up.refresh();
  }
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
bru.ui.uploader.ImageUploader.prototype.removeFile_ = function(context) {
  var el = context.getElement();
  var parent = goog.dom.getAncestorByClass(el, goog.getCssName(this.getBaseCssClass(), 'file'));
  this.uploader_.removeFile(this.uploader_.getFile(parent.id));
  goog.dom.removeNode(parent);
  var uploading = this.uploader_.state === bru.ui.uploader.Plupload.STARTED;
  goog.style.setElementShown(this.readyBtn_, !uploading && this.uploader_.files.length > 0);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
bru.ui.uploader.ImageUploader.prototype.stop_ = function(context) {
  this.uploader_.stop();
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
bru.ui.uploader.ImageUploader.prototype.ready_ = function(context) {
  var up = this.uploader_;
  var data = [];
  for (var i = 0, file; file = up.files[i]; i++) {
    data[i] = file.info;
  }
  this.handleReady(data);
  up.splice(0, up.files.length);
  goog.style.setElementShown(this.readyBtn_, false);
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
bru.ui.uploader.ImageUploader.prototype.retry_ = function(context) {
  var el = context.getElement();
  var parent = goog.dom.getAncestorByClass(el, goog.getCssName(this.getBaseCssClass(), 'file'));
  var file = this.uploader_.getFile(parent.id);
  file.status = bru.ui.uploader.Plupload.QUEUED;
  this.uploader_.start();
};


/**
 * @private
 */
bru.ui.uploader.ImageUploader.prototype.updateProgress_ = function(up, file) {
  var wrapper = goog.dom.getElement(file.id);
  goog.dom.classlist.add(wrapper, goog.getCssName(this.getBaseCssClass(), 'uploading'));
  var el = goog.dom.getElementByClass(goog.getCssName(this.getBaseCssClass(), 'file-progress-p'), wrapper);
  el.style.width = file['percent'] + 'px';
};


/**
 * @enum {string}
 */
bru.ui.uploader.ImageUploader.EventType = {
  READY: 'ready'
};


/**
 * @param {string} type  The type of event.
 * @param {Array.<*>} files
 *
 * @constructor
 * @extends {goog.events.Event}
 */
bru.ui.uploader.ImageUploaderEvent = function(type, files) {
  goog.events.Event.call(this, type);

  /**
   * @type {Array.<*>}
   */
  this.files = files;
};
goog.inherits(bru.ui.uploader.ImageUploaderEvent, goog.events.Event);
