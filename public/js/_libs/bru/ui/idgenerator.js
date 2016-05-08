goog.provide('bru.ui.IdGenerator');



/**
 * Creates a new id generator.
 * @constructor
 */
bru.ui.IdGenerator = function() {
};
goog.addSingletonGetter(bru.ui.IdGenerator);


/**
 * Next unique ID to use
 * @type {number}
 * @private
 */
bru.ui.IdGenerator.prototype.nextId_ = 0;


/**
 * Gets the next unique ID.
 * @return {string} The next unique identifier.
 */
bru.ui.IdGenerator.prototype.getNextUniqueId = function() {
  var n = this.nextId_++;
  var id = '';
  while (n >= 0) {
    id = String.fromCharCode(n % 26 + 97) + id;
    n = Math.floor(n / 26) - 1;
  }
  return id;
};
