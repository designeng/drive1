goog.provide('drive.ToggleButton');

goog.require('goog.ui.Button');
goog.require('goog.ui.Component.State');
goog.require('goog.ui.ControlContent');
goog.require('drive.ButtonRenderer');
goog.require('goog.ui.registry');



/**
 * A toggle button, with checkbox-like semantics.  Rendered using
 * {@link goog.ui.CustomButtonRenderer} by default, though any
 * {@link goog.ui.ButtonRenderer} would work.
 *
 * @param {goog.ui.ControlContent} content Text caption or existing DOM
 *     structure to display as the button's caption.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Renderer used to render or
 *     decorate the button; defaults to {@link goog.ui.CustomButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM hepler, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Button}
 */
drive.ToggleButton = function(content, opt_renderer, opt_domHelper) {
  goog.ui.Button.call(this, content, opt_renderer ||
      drive.ButtonRenderer.getInstance(), opt_domHelper);
  this.setSupportedState(goog.ui.Component.State.CHECKED, true);
};
goog.inherits(drive.ToggleButton, goog.ui.Button);


// Register a decorator factory function for drive.ToggleButtons.
goog.ui.registry.setDecoratorByClassName(
  goog.getCssName('t-btn'), function() {
  return new drive.ToggleButton(null);
});
