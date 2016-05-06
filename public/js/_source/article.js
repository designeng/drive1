goog.provide('drive.Article');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('drive.config');



/**
 * @constructor
 */
drive.Article = function() {
  var article = goog.dom.getElement('article');
  if (!article) {
    return;
  }

  var pics = goog.dom.getElementsByClass('afigure-pic');
  var num = new drive.URandom(drive.ARTICLE_PICTURE_TYPES);

  for (var i = 0, n, rshadow, bshadow, pic; pic = pics[i]; i++) {
    if (!goog.dom.classlist.contains(pic.parentNode, 'afigure-hd')) {
      n = num.getNumber();
      rshadow = goog.dom.createElement('div');
      goog.dom.classlist.add(rshadow, 'rshadow');
      rshadow.innerHTML = '<img src="/images/pic-right-shadow.png" style="left:-' + (22 * n - 1) + 'px">';
      bshadow = goog.dom.createElement('div');
      goog.dom.classlist.addAll(bshadow, ['spr', 'bshadow']);
      bshadow.style.backgroundPosition = '-40px -' + (382 - 22 * n) + 'px';
      goog.dom.append(pic, rshadow, bshadow);
    }
  }

};


/**
 * @param {number} maxnum
 * @constructor
 */
drive.URandom = function(maxnum) {

  /**
   * @type {number}
   * @private
   */
  this.maxnum_ = maxnum;

  /**
   * @type {Array.<number>}
   * @private
   */
  this.numbers_ = [];

  var i = maxnum;
  while (i--) {
    this.numbers_[i] = i;
  }

  /**
   * @type {number}
   * @private
   */
  this.index_ = maxnum - 1;

  /**
   * @type {number}
   * @private
   */
  this.last_ = 0;
};


/**
 * @return {number}
 */
drive.URandom.prototype.getNumber = function() {
  this.index_++;
  if (this.index_ == this.maxnum_) {
    this.shuffle_();
  }
  this.last_ = this.numbers_[this.index_];
  return this.last_;
};


/**
 * @private
 */
drive.URandom.prototype.shuffle_ = function() {
  // Сбрасываем текущий индекс
  this.index_ = 0;

  // Перемешиваем массив пока первый элемент не будет
  // отличаться от последнего сгенерированного
  do {
    this.numbers_.sort(function() {
      return 0.5 - Math.random();
    });
  } while (this.numbers_[0] === this.last_);
};


/**
 * Export
 */
goog.exportSymbol('drv.Article', drive.Article);
