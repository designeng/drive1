goog.provide('bru.ui.Crop');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events.EventType');
goog.require('goog.fx.Dragger');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');
goog.require('goog.math.Size');
goog.require('goog.style');
goog.require('goog.ui.Component');


/**
 * @constructor
 * @param {string} url Url изображения.
 * @param {number} width Ширина изображения.
 * @param {number} height Высота изображения.
 * @param {string=} opt_class CSS class name for the crop element, also used
 *     as a class name prefix for related elements.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link
 *     goog.ui.Component} for semantics.
 * @extends {goog.ui.Component}
 */
bru.ui.Crop = function(url, width, height, opt_class, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * Url изображения.
   * @type {string}
   * @private
   */
  this.src_ = url;

  /**
   * Размер изображения.
   * @type {goog.math.Size}
   * @private
   */
  this.size_ = new goog.math.Size(width, height);

  /**
   * CSS class name for the crop element, also used as a class name prefix for
   * related elements.
   * @type {string}
   * @private
   */
  this.class_ = opt_class || goog.getCssName('crop');
};
goog.inherits(bru.ui.Crop, goog.ui.Component);


/**
 * Полупрозрачный оверлей над картинкой.
 * @type {Element}
 * @private
 */
bru.ui.Crop.prototype.overlayEl_;


/**
 * Обводка для кропа.
 * @type {Element}
 * @private
 */
bru.ui.Crop.prototype.borderEl_;


/**
 * Фон под обводкой.
 * @type {Element}
 * @private
 */
bru.ui.Crop.prototype.maskBgEl_;


/**
 * Область кропа.
 * @type {Element}
 * @private
 */
bru.ui.Crop.prototype.cropEl_;


/**
 * Изначальная область кропа.
 * @type {goog.math.Rect}
 * @private
 */
bru.ui.Crop.prototype.preset_ = null;


/**
 * Aspect ratio.
 * @type {goog.math.Size}
 * @private
 */
bru.ui.Crop.prototype.aspectRatio_ = null;


/**
 * Минимальная область кропа.
 * @type {goog.math.Size}
 * @private
 */
bru.ui.Crop.prototype.minSize_ = new goog.math.Size(20, 20);


/**
 * @return {goog.math.Rect}
 */
bru.ui.Crop.prototype.getPreset = function() {
  return this.preset_;
};


/**
 * Устанавливает изначальную область кропа.
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 */
bru.ui.Crop.prototype.setPreset = function(x, y, w, h) {
  this.preset_ = new goog.math.Rect(x, y, w, h);
};


/**
 * Устанавливает минимальную область кропа.
 * @param {number|goog.math.Size} w
 * @param {number=} opt_h
 */
bru.ui.Crop.prototype.setMinSize = function(w, opt_h) {
  this.minSize_ = w instanceof goog.math.Size ? w :
      new goog.math.Size(/** @type {number} */ (w), /** @type {number} */ (opt_h));
};


/**
 * Устанавливает aspect ratio.
 * @param {number|goog.math.Size} x
 * @param {number=} opt_y
 */
bru.ui.Crop.prototype.setAspectRatio = function(x, opt_y) {
  this.aspectRatio_ = x instanceof goog.math.Size ? x :
      new goog.math.Size(/** @type {number} */ (x), /** @type {number} */(opt_y));
};


/**
 * Возвращает aspect ratio.
 * @return {goog.math.Size}
 */
bru.ui.Crop.prototype.getAspectRatio = function() {
  return this.aspectRatio_;
};


/**
 * @const
 * @type {number}
 */
bru.ui.Crop.HANDLE_SIZE = 5;


/**
 * @const
 * @type {number}
 */
bru.ui.Crop.HANDLE_OFFSET = Math.ceil(bru.ui.Crop.HANDLE_SIZE * 0.5) + 1;



/**
 * Creates an initial DOM representation for the component.
 */
bru.ui.Crop.prototype.createDom = function() {
  var dom = this.getDomHelper();
  var el = dom.createElement('div');
  var img = dom.createElement('img');
  img.src = this.src_;
  el.appendChild(img);
  this.decorateInternal(el);
};


/** @inheritDoc */
bru.ui.Crop.prototype.decorateInternal = function(element) {
  bru.ui.Crop.superClass_.decorateInternal.call(this, element);

  var dom = this.getDomHelper();

  goog.dom.classlist.add(element, this.class_);
  goog.style.setSize(element, this.size_);

  var bgStyle = 'background-image:url(' + this.src_ + ')';
  goog.dom.append(/** @type {!Element} */ (element),
      this.overlayEl_ = dom.createDom('div', goog.getCssName(this.class_, 'overlay')),
      this.maskBgEl_ = dom.createDom('div',
          {'className': goog.getCssName(this.class_, 'mask-bg'), 'style': bgStyle}),
      this.borderEl_ = dom.createDom('div', goog.getCssName(this.class_, 'border')),
      this.cropEl_ = dom.createDom('div',
          {'className': goog.getCssName(this.class_, 'mask'), 'style': bgStyle})
  );

  var handles = {};
  var hkeys = ['nw', 'ne', 'sw', 'se'];
  for (var i = 0, hkey; hkey = hkeys[i]; i++) {
    handles[hkey] = dom.createDom('div', {
        style: 'width:' + (bru.ui.Crop.HANDLE_SIZE + 2) + 'px;height:' + (bru.ui.Crop.HANDLE_SIZE + 2) +
        'px;position:absolute;padding:1px;cursor:' + hkey + '-resize'},
        dom.createDom('div', {className: goog.getCssName(this.class_, 'handle'),
            style: 'width:' + bru.ui.Crop.HANDLE_SIZE + 'px;height:' +
            bru.ui.Crop.HANDLE_SIZE + 'px;visibility:hidden'})
        );
    element.appendChild(handles[hkey]);
  }
  this.handles_ = handles;
};


/**
 * Initializes the component just after its DOM has been rendered into the
 * document.  Overrides {@link goog.ui.Component#enterDocument}.
 */
bru.ui.Crop.prototype.enterDocument = function() {
  bru.ui.Crop.superClass_.enterDocument.call(this);

  var elem = this.getElement();
  if (!this.preset_) {
    this.setPreset(0, 0, this.size_.width, this.size_.height);
  }
  this.set(this.preset_);
  this.showHandles_(true);

  goog.style.setUnselectable(elem, true);

  this.getHandler().
      listen(this.cropEl_, goog.events.EventType.DBLCLICK, this.setMaxSize).
      listen(elem, goog.events.EventType.MOUSEDOWN, this.onMousedown_);
};


/**
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
bru.ui.Crop.prototype.onMousedown_ = function(e) {
  var cropEl = this.cropEl_;
  var target = e.target;

  if (target != cropEl) {
    var handles = this.handles_;
    for (var handle in handles) {
      if (target == handles[handle] || target == handles[handle].firstChild) {
        this.curHandle_ = handle;
        break;
      }
    }
    if (!this.curHandle_) {
      return;
    }
  }

  var coords = this.get();
  this.coords_ = coords;
  //this.mousePos = event.page;

  this.dragger_ = new goog.fx.Dragger(this.cropEl_, null,
      new goog.math.Rect(-coords.left, -coords.top,
          this.size_.width - coords.width,
          this.size_.height - coords.height));
  this.dragger_.defaultAction = goog.nullFunction;
  this.getHandler().
      listen(this.dragger_, goog.fx.Dragger.EventType.END, this.onDragEnd_).
      listen(this.dragger_, goog.fx.Dragger.EventType.DRAG, this.onDrag_);
  this.showHandles_(false);
  this.dragger_.startDrag(e);
};


/**
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
bru.ui.Crop.prototype.onDrag_ = function(e) {
  var dragger = this.dragger_;
  var coords = this.coords_;
  var pos = new goog.math.Coordinate(coords.left, coords.top);
  var size = coords.getSize();

  if (this.curHandle_) {
    var dirX = this.curHandle_.charAt(1) == 'w' ? -1 : 1;
    var dirY = this.curHandle_.charAt(0) == 'n' ? -1 : 1;
    pos.x += dirX == -1 ? dragger.deltaX : 0;
    pos.y += dirY == -1 ? dragger.deltaY : 0;
    size.width += dirX * dragger.deltaX;
    size.height += dirY * dragger.deltaY;
    if (pos.x < 0) {
      size.width += pos.x;
      pos.x = 0;
    }
    if (pos.y < 0) {
      size.height += pos.y;
      pos.y = 0;
    }

    size.width = Math.min(size.width, this.size_.width - pos.x);
    size.height = Math.min(size.height, this.size_.height - pos.y);

    if (size.width < this.minSize_.width) {
      if (dirX == -1) {
        pos.x += size.width - this.minSize_.width;
      }
      size.width = this.minSize_.width;
    }
    if (size.height < this.minSize_.height) {
      if (dirY == -1) {
        pos.y += size.height - this.minSize_.height;
      }
      size.height = this.minSize_.height;
    }

    var aspectRatio = this.aspectRatio_;
    if (aspectRatio) {
      var newsize;
      var nsize = new goog.math.Size(size.width / aspectRatio.width, size.height / aspectRatio.height);
      if (nsize.width > nsize.height) {
        newsize = Math.floor(nsize.height * aspectRatio.width);
        if (dirX == -1) {
          pos.x += size.width - newsize;
        }
        size.width = newsize;
      } else if (nsize.width < nsize.height) {
        newsize = Math.floor(nsize.width * aspectRatio.height);
        if (dirY == -1) {
          pos.y += size.height - newsize;
        }
        size.height = newsize;
      }
    }
  } else {
    pos.x += dragger.deltaX;
    pos.y += dragger.deltaY;
    // Limit drag to image rect.
    pos.x = Math.min(this.size_.width - size.width, Math.max(0, pos.x));
    pos.y = Math.min(this.size_.height - size.height, Math.max(0, pos.y));
  }
  var newCoords = new goog.math.Rect(pos.x, pos.y, size.width, size.height);
  this.set(newCoords);

  // Сбрасываем запомненные координаты для setMaxSize.
  this.oldCoords_ = null;
};


/**
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
bru.ui.Crop.prototype.onDragEnd_ = function(e) {
  this.curHandle_ = null;
  this.dragger_.dispose();
  this.showHandles_(true);
};


/**
 * @param {goog.math.Rect} rect
 */
bru.ui.Crop.prototype.set = function(rect) {
  goog.style.setPosition(this.borderEl_, rect.left, rect.top);
  goog.style.setSize(this.borderEl_, rect.width, rect.height);
  this.maskBgEl_.style.clip = 'rect(' + rect.top + 'px, ' +
      (rect.left + rect.width) + 'px, ' +
      (rect.top + rect.height) + 'px, ' + rect.left + 'px)';
  this.cropEl_.style.clip = 'rect(' + (rect.top + 1) + 'px, ' +
      (rect.left + rect.width - 1) + 'px, ' +
      (rect.top + rect.height - 1) + 'px, ' + (rect.left + 1) + 'px)';
  this.setHandles_(rect);
};


/**
 * Возвращает координаты и размеры текущего кропа (goog.math.Rect).
 * @return {goog.math.Rect} .
 */
bru.ui.Crop.prototype.get = function() {
  if (this.inDocument_) {
    var borderEl = this.borderEl_;
    return new goog.math.Rect(borderEl.offsetLeft, borderEl.offsetTop,
        borderEl.offsetWidth, borderEl.offsetHeight);
  } else {
    return this.getPreset();
  }
};


/**
 * Показывает/скрывает элементы управления кропом (handles).
 * @param {boolean} b
 * @private
 */
bru.ui.Crop.prototype.showHandles_ = function(b) {
  for (var handle in this.handles_) {
    this.handles_[handle].firstChild.style.visibility = b ? 'visible' : 'hidden';
  }
};


/**
 * Позиционирует элементы управления кропом (handles).
 * @param {goog.math.Rect} coords
 * @private
 */
bru.ui.Crop.prototype.setHandles_ = function(coords) {
  var handles = this.handles_;
  var sLeft = coords.left - bru.ui.Crop.HANDLE_OFFSET;
  var sTop = coords.top - bru.ui.Crop.HANDLE_OFFSET;
  for (var handle in handles) {
    var left = sLeft;
    var top = sTop;
    if (handle == 'se' || handle == 'ne') {
      left += coords.width - 1;
    }
    if (handle == 'se' || handle == 'sw') {
      top += coords.height - 1;
    }
    handles[handle].style.left = left + 'px';
    handles[handle].style.top = top + 'px';
  }
};


/**
 *
 */
bru.ui.Crop.prototype.setMaxSize = function() {
  var coords;
  if (this.oldCoords_) {
    coords = this.oldCoords_;
    this.oldCoords_ = null;
  } else {
    if (this.inDocument_) {
      this.oldCoords_ = this.get();
    }
    var size = this.size_.clone();
    var pos = new goog.math.Coordinate();
    var aspectRatio = this.aspectRatio_;
    if (aspectRatio) {
      var nsize = new goog.math.Size(size.width / aspectRatio.width, size.height / aspectRatio.height);
      if (nsize.width > nsize.height) {
        size = new goog.math.Size(Math.floor(nsize.height * aspectRatio.width), size.height);
      } else if (nsize.width < nsize.height) {
        size = new goog.math.Size(size.width, Math.floor(nsize.width * aspectRatio.height));
      }
      pos = new goog.math.Coordinate((this.size_.width - size.width) >> 1, (this.size_.height - size.height) >> 1);
    }
    coords = new goog.math.Rect(pos.x, pos.y, size.width, size.height);
  }
  if (this.inDocument_) {
    this.set(coords);
  } else {
    this.setPreset(coords.left, coords.top, coords.width, coords.height);
  }
};


/** @inheritDoc */
bru.ui.Crop.prototype.disposeInternal = function() {
  // The superclass method calls exitDocument, which in turn calls
  // setVisible(false).  Between them they clean up all event handlers.
  bru.ui.Crop.superClass_.disposeInternal.call(this);

  this.overlayEl_ = null;
  this.cropEl_ = null;
  this.borderEl_ = null;
  this.cropEl_ = null;
};
