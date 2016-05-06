goog.provide('bru.fx.DragListGroup2D');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.fx.DragListGroup');
goog.require('goog.style');



/**
 * @constructor
 * @extends {goog.fx.DragListGroup}
 */
bru.fx.DragListGroup2D = function() {
  bru.fx.DragListGroup2D.base(this, 'constructor');

  /**
   * The amount of distance, in pixels, after which a mousedown or touchstart is
   * considered a drag.
   * @private {number}
   */
  this.hysteresisDistance_ = 5;

};
goog.inherits(bru.fx.DragListGroup2D, goog.fx.DragListGroup);


/** @inheritDoc */
bru.fx.DragListGroup2D.prototype.getHoverNextItem_ = function(
    hoverList, draggerElCenter) {

  var hoverListItems = goog.dom.getChildren(hoverList);

  var afterItemIndex;
  var distanceToClosestPoint = Infinity;
  var side;

  for (var i = 0, item; item = hoverListItems[i]; i++) {
    var distanceToPoint = bru.fx.DragListGroup2D.distanceFromItem_(item, draggerElCenter);
    if (distanceToPoint[0] < distanceToClosestPoint) {
      distanceToClosestPoint = distanceToPoint[0];
      side = distanceToPoint[1];
      afterItemIndex = i;
    }
  }

  if (!side) {
    afterItemIndex++;
  }

  return hoverListItems[afterItemIndex] || null;
};


/** @inheritDoc */
bru.fx.DragListGroup2D.prototype.cloneNode_ = function(sourceEl) {
  return /** @type {Element!} */ (sourceEl.cloneNode(true));
};


/** @inheritDoc */
bru.fx.DragListGroup2D.prototype.handleDragItemMouseover_ = function(e) {
  var targetEl = e.currentTarget;
  goog.asserts.assert(targetEl);
  goog.dom.classlist.addAll(/** @type {Element} */ (targetEl),
      this.dragItemHoverClasses_ || []);
};


/** @inheritDoc */
bru.fx.DragListGroup2D.prototype.handleDragItemMouseout_ = function(e) {
  var targetEl = e.currentTarget;
  goog.asserts.assert(targetEl);
  goog.dom.classlist.removeAll(/** @type {Element} */ (targetEl),
      this.dragItemHoverClasses_ || []);
};


/** @inheritDoc */
bru.fx.DragListGroup2D.prototype.handleDragItemHandleMouseover_ = function(e) {
  var targetEl = e.currentTarget;
  goog.asserts.assert(targetEl);
  goog.dom.classlist.addAll(/** @type {Element} */ (targetEl),
      this.dragItemHandleHoverClasses_ || []);
};


/** @inheritDoc */
bru.fx.DragListGroup2D.prototype.handleDragItemHandleMouseout_ = function(e) {
  var targetEl = e.currentTarget;
  goog.asserts.assert(targetEl);
  goog.dom.classlist.removeAll(/** @type {Element} */ (targetEl),
      this.dragItemHandleHoverClasses_ || []);
};


/**
 * Private helper for getHoverNextItem_().
 * @param {Element} item
 * @param {goog.math.Coordinate} target
 * @return {Array.<number|boolean>}
 * @private
 */
bru.fx.DragListGroup2D.distanceFromItem_ = function(item, target) {
  var itemBounds = item.dlgBounds_;
  var itemLeftX = itemBounds.left;
  var itemRightX = itemBounds.left + itemBounds.width;
  var itemCenterY = itemBounds.top + (itemBounds.height - 1) / 2;
  var dxLeft = Math.abs(itemLeftX - target.x);
  var dxRight = Math.abs(itemRightX - target.x);
  var dx = Math.min(dxLeft, dxRight);
  return [Math.sqrt(Math.pow(dx, 2) + Math.pow(target.y - itemCenterY, 2)), dxLeft < dxRight];
};


/** @inheritDoc */
bru.fx.DragListGroup2D.prototype.recacheListAndItemBounds_ = function(
    currDragItem) {
  for (var i = 0, n = this.dragLists_.length; i < n; i++) {
    var dragList = this.dragLists_[i];
    dragList.dlgBounds_ = goog.style.getBounds(dragList);
  }

  for (i = 0, n = this.dragItems_.length; i < n; i++) {
    var dragItem = this.dragItems_[i];
    dragItem.dlgBounds_ = goog.style.getBounds(dragItem);
  }
};
