goog.provide('drive.ButtonRenderer');

goog.require('goog.ui.FlatButtonRenderer');
goog.require('goog.dom');
goog.require('goog.dom.dataset');



/**
 * Flat renderer for {@link goog.ui.Button}s.  Flat buttons can contain
 * almost arbitrary HTML content, will flow like inline elements, but can be
 * styled like block-level elements.
 * @constructor
 * @extends {goog.ui.FlatButtonRenderer}
 */
drive.ButtonRenderer = function() {
  goog.ui.FlatButtonRenderer.call(this);
};
goog.inherits(drive.ButtonRenderer, goog.ui.FlatButtonRenderer);
goog.addSingletonGetter(drive.ButtonRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
drive.ButtonRenderer.CSS_CLASS = goog.getCssName('t-btn');


/** @override */
drive.ButtonRenderer.prototype.createDom = function(button) {
  var classNames = this.getClassNames(button);
  var attributes = {
    'class': classNames.join(' '),
    'title': button.getTooltip() || ''
  };
  var dom = button.getDomHelper();

  return dom.createDom(
      'div', attributes,
      dom.createDom('span', null, button.getContent()),
      dom.createDom('i', {'class': 'i'}));
};


/**
 * Takes the button's root element and returns the parent element of the
 * button's contents.  Overrides the superclass implementation by taking
 * the nested DIV structure of custom buttons into account.
 * @param {Element} element Root element of the button whose content
 *     element is to be returned.
 * @return {Element} The button's content element (if any).
 */
drive.ButtonRenderer.prototype.getContentElement = function(element) {
  return element && /** @type {Element} */ (element.firstChild);
};


/** @override */
drive.ButtonRenderer.prototype.getCssClass = function() {
  return drive.ButtonRenderer.CSS_CLASS;
};


/** @override */
drive.ButtonRenderer.prototype.getValue = function(element) {
  return goog.dom.dataset.get(element, 'value') || '';
};


/** @override */
drive.ButtonRenderer.prototype.setValue = function(element, value) {
  if (element) {
    goog.dom.dataset.set(element, 'value', value);
  }
};
