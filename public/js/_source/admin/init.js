goog.provide('driveadm.init');

goog.require('goog.debug.ErrorHandler');
goog.require('bru.form.Validator');
goog.require('bru.net.xhr.Xhr');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventWrapper');
goog.require('driveadm.config');
goog.require('bru.jsaction.EventContract');
goog.require('bru.jsaction.EventType');
goog.require('bru.jsaction.Dispatcher');



driveadm.dispatcher = new bru.jsaction.Dispatcher();

var contract = bru.jsaction.EventContract.getInstanceForDocument();
contract.setDispatcher(driveadm.dispatcher);
contract.setValidator(bru.form.Validator.getInstance());

/**
 * Инициализация валидатора.
 * @type {bru.form.Validator}
 */
//driveadm.validator = bru.form.Validator.getInstance();


/**
 * XhrManager
 * @type {bru.net.xhr.Xhr}
 */
driveadm.xhr = new bru.net.xhr.Xhr(driveadm.xhrInfo);


// Инициализируем fx.Animation для использования AnimationFrame.
goog.fx.anim.setAnimationWindow(window);


/**
 * "Modernizer"
 */
if (window.opera && window.opera.postError) {
  goog.dom.classlist.add(document.documentElement, 'opera');
}


/**
 * Export
 */
goog.exportSymbol('drvadm.validatorAddRules', bru.form.Validator.addRules);
goog.exportSymbol('drvadm.validatorAddRule', bru.form.Validator.addRule);
