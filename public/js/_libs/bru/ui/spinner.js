goog.provide('bru.ui.Spinner');

goog.require('bru.style');
goog.require('goog.Disposable');
goog.require('goog.dom');
goog.require('goog.fx.CssSpriteAnimation');
goog.require('goog.style');


/**
 * @param {string|Element} target Target element for the spinner.
 * @param {goog.math.Size} size The size of one image in the image sprite.
 * @param {goog.math.Box} box The box describing the layout of the sprites to
 *     use in the large image.  The sprites can be position horizontally or
 *     vertically and using a box here allows the implementation to know which
 *     way to go.
 * @param {number} time The duration in milliseconds for one iteration of the
 *     animation.  For example, if the sprite contains 4 images and the duration
 *     is set to 400ms then each sprite will be displayed for 100ms.
 * @constructor
 * @extends {goog.Disposable}
 */
bru.ui.Spinner = function(target, size, box, time) {
  goog.Disposable.call(this);

  /**
   * Список элементов формы, котрые нужно
   * дисейблить когда Spinner активен.
   * @type {Array.<Element>}
   */
  this.elements_ = [];

  /**
   * Размер спиннера.
   * @type {goog.math.Size}
   * @private
   */
  this.size_ = size;

  /**
   * Область в спрайте для анимации спиннера.
   * @type {goog.math.Box}
   * @private
   */
  this.box_ = box;

  /**
   * Время полной анимации всех кадров спиннера.
   * @type {number}
   * @private
   */
  this.time_ = time;

  /**
   * Spinner target.
   * @type {Element}
   * @private
   */
  this.target_ = goog.dom.getElement(target);
};
goog.inherits(bru.ui.Spinner, goog.Disposable);


/**
 * @type {number}
 */
bru.ui.Spinner.START_DELAY = 300;


/**
 * Active spinners.
 * @type {Object}
 * @private
 */
bru.ui.Spinner.active_ = {};


/**
 * @type {string}
 * @private
 */
bru.ui.Spinner.prototype.class_ = goog.getCssName('spinner');


/**
 * @type {Element}
 * @private
 */
bru.ui.Spinner.prototype.element_ = null;


/**
 * Whether the spinner is running.
 * @type {boolean}
 * @private
 */
bru.ui.Spinner.prototype.inProgress_ = false;


/**
 * Whether the spinner is currently running.
 */
bru.ui.Spinner.prototype.setCssClass = function(cssClass) {
  this.class_ = cssClass;
};


/**
 * Whether the spinner is currently running.
 * @return {boolean}
 */
bru.ui.Spinner.prototype.inProgress = function() {
  return this.inProgress_;
};


/**
 * @return {goog.math.Size}
 */
bru.ui.Spinner.prototype.getSize = function() {
  return this.size_;
};


/**
 * @return {Element}
 */
bru.ui.Spinner.prototype.getElement = function() {
  if (!this.element_) {
    this.render_();
  }
  return this.element_;
};


/**
 * Add button.
 * @param {...string|Element} var_args
 */
bru.ui.Spinner.prototype.addDisabledElement = function(var_args) {
  for (var i = 0, el; el = goog.dom.getElement(arguments[i]); i++) {
    this.elements_.push([el, el.disabled]);
  }
};


/**
 * Start spinner.
 * @param {number=} opt_delay
 */
bru.ui.Spinner.prototype.start = function(opt_delay) {
  if (this.inProgress()) {
    return;
  }

  clearTimeout(this.tm_);
  this.inProgress_ = true;
  this.render_();
  this.animation_ = new goog.fx.CssSpriteAnimation(this.element_, this.size_, this.box_, this.time_);
  this.animation_.play();
  this.tm_ = setTimeout(goog.bind(this.delayedStart_, this), opt_delay || bru.ui.Spinner.START_DELAY);
};


/**
 * Start spinner.
 * @private
 */
bru.ui.Spinner.prototype.delayedStart_ = function() {
  bru.style.setDocumentBusy(true);
  this.setElements_(true);
  this.element_.style.visibility = 'visible';
};


/**
 * Start spinner.
 */
bru.ui.Spinner.prototype.stop = function() {
  bru.style.setDocumentBusy(false);
  this.setElements_(false);
  clearTimeout(this.tm_);

  if (!this.inProgress()) {
    return;
  }

  this.element_.style.visibility = 'hidden';
  this.animation_.dispose();
  this.inProgress_ = false;
};


/**
 * Enable/disable buttons.
 * @param {boolean} disabled
 * @private
 */
bru.ui.Spinner.prototype.setElements_ = function(disabled) {
  for (var i = 0, button; button = this.elements_[i]; i++) {
    button[0].disabled = disabled || button[1];
  }
};


/** @inheritDoc */
bru.ui.Spinner.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');

  this.stop();

  var uid = goog.getUid(this.target_);
  goog.dom.removeNode(this.element_);
  this.element_ = null;
  this.target_ = null;
  this.elements_ = null;
  this.animation_ = null;
  bru.ui.Spinner.active_[uid] = null;
};


/**
 * @private
 */
bru.ui.Spinner.prototype.render_ = function() {
  if (this.element_) {
    return;
  }

  var uid = goog.getUid(this.target_);
  // Убиваем предыдущий активный спиннер.
  goog.dispose(bru.ui.Spinner.active_[uid]);
  bru.ui.Spinner.active_[uid] = this;

  this.element_ = goog.dom.createDom('div', this.class_);
  this.element_.style.visibility = 'hidden';
  goog.style.setSize(this.element_, this.size_);

  var targetSize = goog.style.getSize(this.target_);

  var x = (targetSize.width - this.size_.width) >> 1;
  var y = (targetSize.height - this.size_.height) >> 1;

  goog.style.setPosition(this.element_, x, y);

  this.target_.appendChild(this.element_);
};
