goog.provide('drive.deleteConfirm');

goog.require('bru.ui.bubble');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('bru.jsaction.util');


/**
 * @param {string} btn
 */
drive.deleteConfirm = function(btn) {
  var button = goog.dom.getElement(btn);

  // Сбрасываем флаг удаления на всякий случай.
  button.form['deleted'].value = '';

  goog.events.listen(button, goog.events.EventType.CLICK, function() {
      drive.deleteConfirmDialog(button);
      });
};


/**
 * @param {Element} button
 */
drive.deleteConfirmDialog = function(button) {
  bru.ui.bubble.bubble(button, 'Вы действительно хотите удалить это объявление?',
      bru.ui.Bubble.Type.CONFIRM, goog.positioning.Corner.TOP_LEFT, undefined, function(rconfirm) {
        button.form['deleted'].value = rconfirm ? '1' : '';
        if (rconfirm) {
          bru.jsaction.util.submitForm(button.form);
        }
      });
};


/**
 * Export
 */
goog.exportSymbol('drv.delConfirm', drive.deleteConfirm);
