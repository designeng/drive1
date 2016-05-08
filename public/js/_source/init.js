goog.provide('drive.init');

goog.require('goog.debug.ErrorHandler');
goog.require('bru.form.Validator');
goog.require('bru.net.xhr.Xhr');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventWrapper');
goog.require('goog.pubsub.PubSub');
goog.require('drive.config');
goog.require('bru.jsaction.EventContract');
goog.require('bru.jsaction.EventType');
goog.require('bru.jsaction.Dispatcher');



drive.dispatcher = new bru.jsaction.Dispatcher();

var contract = bru.jsaction.EventContract.getInstanceForDocument();
contract.setDispatcher(drive.dispatcher);
contract.setValidator(bru.form.Validator.getInstance());

drive.dispatcher.registerHandlers('page', {
  'print': function() {window.print();}
});


/**
 * Глобальный pubsub, все общение объектов будет происходить через него.
 * @type {goog.pubsub.PubSub}
 */
drive.pubsub = goog.pubsub.PubSub.getInstance();


/**
 * Инициализация валидатора.
 * @type {bru.form.Validator}
 */
//drive.validator = bru.form.Validator.getInstance();


/**
 * XhrManager
 * @type {bru.net.xhr.Xhr}
 */
drive.xhr = new bru.net.xhr.Xhr(drive.xhrInfo);


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
goog.exportSymbol('drv.validatorAddRules', bru.form.Validator.addRules);
goog.exportSymbol('drv.validatorAddRule', bru.form.Validator.addRule);
