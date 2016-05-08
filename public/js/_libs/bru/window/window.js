/**
 * @fileoverview Based on bru.window
 */


goog.provide('bru.window');



/**
 * Default height for popup windows
 * @type {number}
 */
bru.window.DEFAULT_POPUP_HEIGHT = 600;


/**
 * Default width for popup windows
 * @type {number}
 */
bru.window.DEFAULT_POPUP_WIDTH = 480;


/**
 * Default target for popup windows
 * @type {string}
 */
bru.window.DEFAULT_POPUP_TARGET = '__popup';


/**
 * Opens a new window.
 *
 * @param {string|Object} linkRef A string or an object that supports toString,
 *     for example goog.Uri.  If this is an object with a 'href' attribute, such
 *     as HTMLAnchorElement, it will be used instead.
 *
 * @param {Object=} opt_options supports the following options:
 *  'target': (string) target (window name). If null, linkRef.target will
 *          be used.
 *  'width': (number) window width.
 *  'height': (number) window height.
 *  'top': (number) distance from top of screen
 *  'left': (number) distance from left of screen
 *  'toolbar': (boolean) show toolbar
 *  'scrollbars': (boolean) show scrollbars
 *  'location': (boolean) show location
 *  'status': (boolean) show status
 *  'menubar': (boolean) show menubar
 *  'resizable': (boolean) resizable
 *
 * @param {Window=} opt_parentWin Parent window that should be used to open the
 *                 new window.
 *
 * @return {Window} Returns the window object that was opened. This returns
 *                  null if a popup blocker prevented the window from being
 *                  opened.
 */
bru.window.open = function(linkRef, opt_options, opt_parentWin) {
  if (!opt_options) {
    opt_options = {};
  }
  var parentWin = opt_parentWin || window;

  // set default properties
  opt_options['target'] = opt_options['target'] ||
      linkRef['target'] || bru.window.DEFAULT_POPUP_TARGET;
  opt_options['width'] = opt_options['width'] ||
      bru.window.DEFAULT_POPUP_WIDTH;
  opt_options['height'] = opt_options['height'] ||
      bru.window.DEFAULT_POPUP_HEIGHT;
  opt_options['left'] = opt_options['left'] ||
      (screen.width - opt_options['width']) >> 1;
  opt_options['top'] = opt_options['top'] ||
      (screen.height - opt_options['height']) >> 1;

  // HTMLAnchorElement has a toString() method with the same behavior as
  // goog.Uri in all browsers except for Safari, which returns
  // '[object HTMLAnchorElement]'.  We check for the href first, then
  // assume that it's a goog.Uri or String otherwise.
  var href = typeof linkRef.href != 'undefined' ? linkRef.href :
      String(linkRef);
  var target = opt_options.target || linkRef.target;

  var sb = [];
  for (var option in opt_options) {
    switch (option) {
      case 'width':
      case 'height':
      case 'top':
      case 'left':
        sb.push(option + '=' + opt_options[option]);
        break;
      case 'target':
        break;
      default:
        sb.push(option + '=' + (opt_options[option] ? 1 : 0));
    }
  }
  var optionString = sb.join(',');

  return parentWin.open(href, target,
      navigator.userAgent.toLowerCase().indexOf('android') < 0 ? optionString : undefined);
};
