goog.provide('bru.ui.CharCounter');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.ui.CharCounter');



/**
 * CharCounter widget. Counts the number of characters in a input field or a
 * text box and displays the number of additional characters that may be
 * entered before the maximum length is reached.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} elInput Input or text area
 *     element to count the number of characters in.  You can pass in null
 *     for this if you don't want to expose the number of chars remaining.
 * @param {Element} elCount HTML element to display the remaining number of
 *     characters in.
 * @param {number} maxLength The maximum length.
 * @param {goog.ui.CharCounter.Display=} opt_displayMode Display mode for this
 *     char counter. Defaults to {@link goog.ui.CharCounter.Display.REMAINING}.
 * @constructor
 * @extends {goog.ui.CharCounter}
 */
bru.ui.CharCounter = function(elInput, elCount, maxLength, opt_displayMode) {
  goog.ui.CharCounter.call(this, elInput, elCount, maxLength, opt_displayMode);
};
goog.inherits(bru.ui.CharCounter, goog.ui.CharCounter);


/**
 * @type {number}
 */
bru.ui.CharCounter.FADE = 0.7;


/**
 * Checks length of text in input field and updates the counter. Truncates text
 * if the maximum lengths is exceeded.
 */
bru.ui.CharCounter.prototype.checkLength = function() {
  var count = this.elInput_.value.length;

  // There's no maxlength property for textareas so instead we truncate the
  // text if it gets too long. It's also used to truncate the text in a input
  // field if the maximum length is changed.
  if (count > this.maxLength_) {

    var scrollTop = this.elInput_.scrollTop;
    var scrollLeft = this.elInput_.scrollLeft;

    this.elInput_.value = this.elInput_.value.substring(0, this.maxLength_);
    count = this.maxLength_;

    this.elInput_.scrollTop = scrollTop;
    this.elInput_.scrollLeft = scrollLeft;
  }

  if (this.elCount_) {
    var incremental = this.display_ == goog.ui.CharCounter.Display.INCREMENTAL;
    goog.dom.setTextContent(
        this.elCount_,
        String(incremental ? count : this.maxLength_ - count));
    goog.dom.classlist.enable(this.elCount_, 'charcounter-faded',
        count / this.maxLength_ < bru.ui.CharCounter.FADE);
  }
};
