goog.provide('bru.events.ActionEvent');

goog.require('goog.events.BrowserEvent');



/**
 * Базовый класс для data-action событий.
 * @param {Event} browserEvent Browser event object.
 * @param {string} type Тип события, он же action.
 * @param {!Element} target Элемент, но котором сработал action.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
bru.events.ActionEvent = function(browserEvent, type, target) {
  goog.events.BrowserEvent.call(this, browserEvent);

  /**
   * Real type of browser event.
   * @type {string}
   */
  this.originalType = browserEvent.type;

  /**
   * Action
   * @type {string}
   */
  this.type = type;

  /**
   * Action target
   * @type {!Element}
   */
  this.actionTarget = target;
};
goog.inherits(bru.events.ActionEvent, goog.events.BrowserEvent);
