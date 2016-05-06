goog.provide('bru.ui.popup.Dialog');

goog.require('bru.ui.popup.Base');


/**
 * @constructor
 * @param {Element=} opt_element "Прикрепленный" элемент. Его позиция будет
 *    использована как начальная для анимации открытия попапа.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link
 *    goog.ui.Component} for semantics.
 * @extends {bru.ui.popup.Base}
 */
bru.ui.popup.Dialog = function(opt_element, opt_domHelper) {
  bru.ui.popup.Base.call(this, opt_element, opt_domHelper);

};
goog.inherits(bru.ui.popup.Dialog, bru.ui.popup.Base);


/**
 * className попапа.
 * @type {string}
 * @private
 */
bru.ui.popup.Dialog.prototype.content_ = '';


/** @inheritDoc */
bru.ui.popup.Dialog.prototype.disposeInternal = function() {
  bru.ui.popup.Dialog.superClass_.disposeInternal.call(this);
};
