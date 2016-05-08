goog.provide('bru.form.CheckboxToggle');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.dom.dataset');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.style');



/**
 * @param {string|Element} button
 * @constructor
 * @extends {goog.events.EventTarget}
 */
bru.form.CheckboxToggle = function(button) {
  goog.events.EventTarget.call(this);

  /**
   * @type {Element}
   * @private
   */
  this.button_ = goog.dom.getElement(button);

  /**
   * @type {Element}
   * @private
   */
  this.wrapper_ = /** @type {Element} */ (goog.dom.getAncestorByClass(this.button_, 'cbtoggle-wrapper'));

  goog.style.setUnselectable(this.button_, true);

  this.state_ = this.getState_();
  this.setState_();

  this.listenKey_ = goog.events.listen(this.wrapper_, goog.events.EventType.CLICK, this);
};
goog.inherits(bru.form.CheckboxToggle, goog.events.EventTarget);


/** @inheritDoc */
bru.form.CheckboxToggle.prototype.disposeInternal = function() {
  bru.form.CheckboxToggle.superClass_.disposeInternal.call(this);
  goog.events.unlistenByKey(this.listenKey_);
};


/**
 * @param {goog.events.BrowserEvent} e
 */
bru.form.CheckboxToggle.prototype.handleEvent = function(e) {
  var button = goog.dom.dataset.get(/** @type {Element} */ (e.target), 'checkcaption');

  this.setState_(!!button);

  var state = this.getState_();
  if (state != this.state_) {
    this.state_ = state;
    this.dispatchEvent(goog.events.EventType.CHANGE);
  }
};


/**
 * @param {boolean=} opt_toggle
 * @return {string}
 * @private
 */
bru.form.CheckboxToggle.prototype.getState_ = function(opt_toggle) {
  var inputs = this.wrapper_.getElementsByTagName('input');
  var state = '';
  for (var i = 0, unchecked = 0, input; input = inputs[i]; i++) {
    if (input.type == 'checkbox') {
      state += input.checked ? '1' : '0';
    }
  }
  return state;
};


/**
 * @param {boolean=} opt_toggle
 * @private
 */
bru.form.CheckboxToggle.prototype.setState_ = function(opt_toggle) {
  var inputs = this.wrapper_.getElementsByTagName('input');
  var disabled = false;
  for (var i = 0, unchecked = 0, input; input = inputs[i]; i++) {
    if (input.type == 'checkbox') {
      if (input.disabled) {
        disabled = true;
      }
      if (!input.checked) {
        unchecked++;
      }
    }
  }
  var captionChecked = unchecked > 1;

  if (opt_toggle && !disabled) {
    for (i = 0; input = inputs[i]; i++) {
      if (input.type == 'checkbox') {
        input.checked = captionChecked;
      }
    }
    captionChecked = !captionChecked;
  }

  goog.dom.classlist.enable(this.button_, 'cbtoggle-disabled', disabled);
  this.button_.innerHTML = goog.dom.dataset.get(this.button_,
      (captionChecked ? '' : 'un') + 'checkcaption');
};
