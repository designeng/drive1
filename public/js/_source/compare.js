goog.provide('drive.Compare');

goog.require('bru.style.css3.transition');
goog.require('bru.form.Validator');
goog.require('bru.ui.bubble');
goog.require('goog.Uri.QueryData');
goog.require('goog.events');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.style');
goog.require('goog.net.cookies');
goog.require('goog.reflect');



/**
 * @constructor
 */
drive.Compare = function() {
  this.element_ = goog.dom.getElement('compare-sideblock');

  this.form_ = goog.dom.getElement('compare-sideblock-form');

  this.list_ = goog.dom.getElementByClass('compare-sideblock-list', this.element_);

  this.ids_ = goog.dom.getElementByClass('compare-sideblock-ids', this.element_);

  this.title_ = goog.dom.getElementByClass('compare-sideblock-title', this.element_);

  this.close_ = goog.dom.getElementByClass('compare-sideblock-close', this.element_);

  //this.isBookmarks_ = goog.dom.classlist.contains(this.element_, 'compare-sideblock-bookmarks');

  this.handler_ = new goog.events.EventHandler(this);

  /**
   * @type {Array.<string|number>}
   * @private
   */
  this.data_ = [];

  this.setVisibility_(true);
  this.getData_();

  drive.dispatcher.registerHandlers('compare', {
      'show': this.onClick_,
      'add': this.onAdd_,
      'remove': this.onRemove_,
      'removech': this.onRemoveChecked_}, this);

  bru.form.Validator.addRule(this.form_, 'id', '', function(form, el, value) {
    var counter = 0;
    for (var i = 0, chk; chk = el[i]; i++) {
      if (chk.checked) {
        counter++;
      }
      if (counter >= 2) {
        return true;
      }
    }
    return false;
  });
};


/**
 * @type {number}
 */
drive.Compare.TRANSITION_DURATION = 0.3;


/**
 * @type {string}
 */
drive.Compare.COMPARE_COOKIE_NAME = '.DriveCompare';


/**
 * @type {number}
 */
drive.Compare.COOKIE_MAXAGE = 365 * 24 * 60 * 60;


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.Compare.prototype.onClick_ = function(context) {
  this.setVisible_(true);
};


/**
 * @param {boolean} visible
 * @private
 */
drive.Compare.prototype.setVisible_ = function(visible) {
  if (visible == this.visible_) {
    return;
  }

  if (this.transition_) {
    this.transition_.dispose();
  }

  if (visible) {
    this.show_();
  } else {
    this.hide_();
  }
};


/**
 * @private
 */
drive.Compare.prototype.show_ = function() {
  this.setVisibleInit_(true);
  this.visible_ = true;

  this.handler_.listenOnce(
      /** @type {goog.events.EventTarget} */ (this.transition_),
      goog.fx.Transition.EventType.END, this.onShow_);

  goog.style.setElementShown(this.title_, true);
  this.transition_.play();
};


/**
 * @private
 */
drive.Compare.prototype.hide_ = function() {
  this.setVisibleInit_(false);
  this.visible_ = false;

  this.handler_.listenOnce(
      /** @type {goog.events.EventTarget} */ (this.transition_),
      goog.fx.Transition.EventType.END, this.onHide_);

  goog.style.setElementShown(this.title_, true);
  this.transition_.play();
};



/**
 * @param {boolean} visible
 * @private
 */
drive.Compare.prototype.setVisibleInit_ = function(visible) {
  var width = this.element_.offsetWidth;

  var start = [1, 30 - width];
  var end = [0, 0];

  if (this.transition_) {
    this.transition_.dispose();
  }

  this.transition_ = new goog.fx.Animation(
      visible ? start : end,
      visible ? end : start,
      drive.Compare.TRANSITION_DURATION * 1000,
      visible ? goog.fx.easing.easeOut : goog.fx.easing.easeIn);

  var events = [goog.fx.Transition.EventType.BEGIN,
      goog.fx.Animation.EventType.ANIMATE,
      goog.fx.Transition.EventType.END];

  this.handler_.listen(this.transition_, events, this.onAnimate_);
};


/**
 * @param {goog.events.Event} e The event.
 * @protected
 */
drive.Compare.prototype.onAnimate_ = function(e) {
  this.element_.style.left = Math.round(e.y) + 'px';
  goog.style.setOpacity(this.title_, e.x);
};


/**
 * @private
 */
drive.Compare.prototype.onShow_ = function() {
  goog.style.setElementShown(this.title_, false);

  this.handler_
      .listen(document,
          [goog.events.EventType.MOUSEDOWN, goog.events.EventType.TOUCHSTART],
          this.onDocumentMousedown_, true)
      .listen(this.close_, goog.events.EventType.CLICK, this.onCloseClick_)
      .listen(document, goog.events.EventType.KEYDOWN, this.onKey_);
};


/**
 * @private
 */
drive.Compare.prototype.onHide_ = function() {
  this.setVisibility_();
  this.transition_.dispose();
  this.handler_.removeAll();
};


/**
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
drive.Compare.prototype.onCloseClick_ = function(e) {
  this.setVisible_(false);
};


/**
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
drive.Compare.prototype.onKey_ = function(e) {
  if (e.keyCode == goog.events.KeyCodes.ESC) {
    e.stopPropagation();
    e.preventDefault();
    this.setVisible_(false);
  }
};


/**
 * @param {goog.events.BrowserEvent} e The event object.
 * @private
 */
drive.Compare.prototype.onDocumentMousedown_ = function(e) {
  var target = /** @type {Node} */ (e.target);
  var bubble = bru.ui.getBubble();
  if (!goog.dom.contains(this.element_, target) &&
      goog.dom.dataset.get(/** @type {Element} */ (target), 'action') != 'compare.add' &&
      (!bubble || !goog.dom.contains(bubble.getElement(), target))) {
    this.setVisible_(false);
  }
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.Compare.prototype.onAdd_ = function(context) {
  var el = context.getElement();
  var id = /** @type {!string} */ (goog.dom.dataset.get(el, 'id'));

  var isRemoving = goog.array.contains(this.data_, id);
  if (el.parentNode.nodeName == 'TD') {
    el.innerHTML = isRemoving ? 'добавить' : 'убрать';
  } else {
    el.innerHTML = isRemoving ? 'Добавить к сравнению' : 'Убрать из сравнения';
  }
  if (isRemoving) {
    this.removeById_(id);
  } else {
    this.data_.push(id, 1);
    this.saveData_();

    var name;
    var link;
    var parent = /** @type {Element} */ (goog.dom.getAncestorByTagNameAndClass(el, 'tr') ||
        goog.dom.getAncestorByTagNameAndClass(el, 'div', 'acard'));
    if (parent) {
      link = goog.dom.getElementByClass('compare-link', parent);
      name = link.innerHTML;
      link = link.href;
      var table = goog.dom.getAncestorByTagNameAndClass(el, 'table');
      if (table) {
        name = table.getElementsByTagName('caption')[0].innerHTML + ' ' + name;
      }
    } else {
      name = goog.dom.getElement('build-title').innerHTML;
      link = document.location.href;
    }
    this.renderItem_(id, name, link);
    this.setVisibility_();
    this.setVisible_(true);
  }
};


/**
 * @private
 */
drive.Compare.prototype.getData_ = function() {
  var dataFromCookies = goog.net.cookies.get(drive.Compare.COMPARE_COOKIE_NAME);
  if (dataFromCookies) {
    this.data_ = goog.array.concat(this.data_, dataFromCookies.split(','));
    var starButtons = goog.dom.getElementsByClass('acard-star');
    var buttons = goog.dom.getElementsByClass('compare-button');

    var q = new goog.Uri.QueryData();
    var ids = [];

    for (var i = 0, id; id = this.data_[i]; i += 2) {

      // Выставлять состояние кнопок нужно только для Сравнения,
      // в Блокноте все само рисуется после ajax-запроса.
      if (!!this.data_[i + 1]) {
        for (var j = 0, btn; btn = starButtons[j]; j++) {
          if (goog.dom.dataset.get(btn, 'id') == id) {
            goog.dom.classlist.add(btn, 'acard-star-active');
          }
        }
        for (j = 0; btn = buttons[j]; j++) {
          if (goog.dom.dataset.get(btn, 'id') == id) {
            btn.innerHTML = btn.parentNode.nodeName == 'TD' ? 'убрать' : 'Убрать из сравнения';
          }
        }
      }

      ids.push(id);
    }

    q.add('ids', ids.join(','));
    drive.xhr.send(drive.XhrRequests.COMPARE_BUILDS_INFO, q, this.render_, this);
  }
};


/**
 * @private
 */
drive.Compare.prototype.saveData_ = function() {
  var cookie = this.data_.join(',');
  goog.net.cookies.set(drive.Compare.COMPARE_COOKIE_NAME,
      cookie, drive.Compare.COOKIE_MAXAGE, '/'/*, 'drive.ru'*/);
  this.updateIds_();
};


/**
 * @param {*} data
 * @private
 */
drive.Compare.prototype.render_ = function(data) {
  for (var i = 0, id; id = this.data_[i]; i += 2) {
    var unchecked = !this.data_[i + 1];
    this.renderItem_(/** @type {string} */ (id), data[i], data[i + 1], unchecked);
  }
  this.setVisibility_(true);
};


/**
 * @param {string} id
 * @param {string} name
 * @param {string} url
 * @param {boolean=} opt_unchecked
 * @private
 */
drive.Compare.prototype.renderItem_ = function(id, name, url, opt_unchecked) {
  var html = '<input type="checkbox" name="id" value="' + id + '"' +
      (opt_unchecked ? '' : ' checked') + '><label>' +
      '<a href="' + url +'">' + name + '</a>' +
      '<span class="compare-sideblock-list-delete" data-action="remove"' +
      '>Убрать</span></label>';
  var el = goog.dom.createElement('li');
  goog.dom.dataset.set(el, 'id', id);
  el.innerHTML = html;
  goog.dom.appendChild(this.list_, el);
  this.updateIds_();
};

/**
 * @private
 */
drive.Compare.prototype.updateIds_ = function() {
  var ids = [];
  for (var i = 0, j; j = this.data_[i]; i += 2) {
    ids.push(j);
  }
  this.ids_.setAttribute('value', ids.join(','));
};


/**
 * @param {boolean=} opt_nodelay
 * @private
 */
drive.Compare.prototype.setVisibility_ = function(opt_nodelay) {
  var width = this.element_.offsetWidth;
  var height = this.element_.offsetHeight;
  var duration;
  if (opt_nodelay) {
    duration = bru.style.css3.transition.removeDuration(this.element_);
  }
  this.element_.style.marginTop = -(height >> 1) + 'px';
  this.element_.style.left = this.visible_ ? 0 : 30 - width + 'px';
  this.element_.style.visibility = this.data_.length ? 'visible' : 'hidden';
  if (opt_nodelay) {
    goog.reflect.sinkValue(this.element_.offsetTop); // Force reflow
    bru.style.css3.transition.setDuration(this.element_, /** @type {string} */ (duration));
  }
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.Compare.prototype.onRemoveChecked_ = function(context) {
  //var el = context.getElement();

  //bru.ui.bubble.bubble(el, 'Вы действительно хотите удалить отмеченные машины из&nbsp;списка?',
  //    bru.ui.Bubble.Type.CONFIRM, goog.positioning.Corner.TOP_RIGHT, undefined, goog.bind(this.removeChecked_, this));
  //bru.ui.bru.ui.bubble.setFixed();
  this.removeChecked_(true);
};


/**
 * @param {boolean} rconfirm
 * @private
 */
drive.Compare.prototype.removeChecked_ = function(rconfirm) {
  if (!rconfirm) {
    return;
  }

  var checkboxes = this.form_.elements['id'];
  if (!checkboxes.length) {
    checkboxes = [checkboxes];
  }
  var i = checkboxes.length;
  var ch;
  while (i--) {
    ch = checkboxes[i];
    if (ch.checked) {
      this.removeItem_(/** @type {Element} */ (ch.parentNode));
    }
  }
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.Compare.prototype.onRemove_ = function(context) {
  var el = context.getElement();
  var li = /** @type {Element} */ (goog.dom.getAncestorByTagNameAndClass(el, 'li'));
  this.removeItem_(li);
};


/**
 * @param {Element} li
 * @private
 */
drive.Compare.prototype.removeItem_ = function(li) {
  var id = goog.dom.dataset.get(li, 'id');

  goog.dom.removeNode(li);

  // Возвращаем звездочки в исходное состояние
  //if (this.isBookmarks_) {
    var stars = goog.dom.getElementsByClass('acard-star-active');
    for (var i = 0, star; star = stars[i]; i++) {
      if (goog.dom.dataset.get(star, 'id') == id) {
        goog.dom.classlist.remove(star, 'acard-star-active');
      }
    }
  //}

  i = goog.array.indexOf(this.data_, id);
  if (i >= 0) {
    goog.array.splice(this.data_, i, 2);
  }

  this.saveData_();

  // Скрываем блок сравнения, если мы удалили все элементы.
  if (this.visible_) {
    this.setVisible_(!!this.data_.length);
  }
};


/**
 * @param {string} id
 * @private
 */
drive.Compare.prototype.removeById_ = function(id) {
  var lis = goog.dom.getChildren(this.list_);
  for (var i = 0, li; li = lis[i]; i++) {
    var curId = goog.dom.dataset.get(li, 'id');
    if (curId && id == curId) {
      this.removeItem_(li);
    }
  }
};


/**
 * Export
 */
goog.exportSymbol('drv.Compare', drive.Compare);
