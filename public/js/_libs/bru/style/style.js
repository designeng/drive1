goog.provide('bru.style');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.math.Coordinate');
goog.require('goog.style');



/**
 * @param {Element} element The element to make visible.
 * @param {number=} opt_margin
 * @param {boolean=} opt_center Whether to center the element in the viewport.
 *     Defaults to false.
 */
bru.style.scrollToElement = function(element, opt_margin, opt_center) {
  var scroll = bru.style.getViewportOffsetToScrollInto(element, opt_margin, opt_center);
  var container = goog.dom.getDocumentScrollElement();
  container.scrollLeft = scroll.x;
  container.scrollTop = scroll.y;
};


/**
 * @param {Element} element The element to make visible.
 * @param {number=} opt_margin
 * @param {boolean=} opt_center Whether to center the element in the viewport.
 *     Defaults to false.
  * @return {!goog.math.Coordinate} The new scroll position of the viewport,
 *     in form of goog.math.Coordinate(scrollLeft, scrollTop).
 */
bru.style.getViewportOffsetToScrollInto = function(element, opt_margin, opt_center) {
  opt_margin = goog.isNumber(opt_margin) ? opt_margin : 85;
  var viewportElt = goog.style.getClientViewportElement(element);
  var viewport = goog.style.getVisibleRectForElement(viewportElt);
  var container = goog.dom.getDocumentScrollElement();
  var elementPos = goog.style.getPageOffset(element);

  var relX = elementPos.x - container.scrollLeft - opt_margin;
  var relY = elementPos.y - container.scrollTop - opt_margin;

  var spaceX = viewport.getWidth() - element.offsetWidth + 2 * opt_margin;
  var spaceY = viewport.getHeight() - element.offsetHeight - 2 * opt_margin;

  var scrollLeft = container.scrollLeft;
  var scrollTop = container.scrollTop;
  if (opt_center) {
    scrollLeft += relX - spaceX / 2;
    scrollTop += relY - spaceY / 2;
  } else {
    scrollLeft += Math.min(relX, Math.max(relX - spaceX, 0));
    scrollTop += Math.min(relY, Math.max(relY - spaceY, 0));
  }

  return new goog.math.Coordinate(scrollLeft, scrollTop);
};


/**
 * @param {boolean} b
 */
bru.style.setDocumentBusy = function(b) {
  goog.dom.classlist.enable(document.body, 'docbusy', b);
};
