goog.provide('drive.CarSelect');

goog.require('drive.init');
goog.require('goog.dom');
goog.require('goog.ui.AnimatedZippy');
goog.require('goog.ui.Zippy');
goog.require('goog.ui.ZippyEvent');
goog.require('drive.spinner');
goog.require('goog.pubsub.PubSub');



/**
 * @param {Element} form
 * @param {string=} opt_model
 * @param {string=} opt_generation
 * @param {number=} opt_productionYear
 * @param {number=} opt_purchaseYear
 * @constructor
 */
drive.CarSelect = function(form, opt_model, opt_generation, opt_productionYear, opt_purchaseYear) {

  this.defaultModel_ = opt_model;
  this.defaultGeneration_ = opt_generation;
  this.defaultProductionYear_ = opt_productionYear;
  this.defaultPurchaseYear_ = opt_purchaseYear;

  form = goog.dom.getElement(form);

  var modelWrapper = goog.dom.getElementByClass('model-wrapper', form);
  if (modelWrapper) {
    /**
     * @type {goog.ui.AnimatedZippy}
     * @private
     */
    this.modelZippy_ = new goog.ui.AnimatedZippy(null, modelWrapper, !!opt_model);
    this.modelZippy_.animationDuration = 400;
  }

  var generationWrapper = goog.dom.getElementByClass('generation-wrapper', form);
  if (generationWrapper) {
    /**
     * @type {goog.ui.AnimatedZippy}
     * @private
     */
    this.generationZippy_ = new goog.ui.AnimatedZippy(null, generationWrapper, !!opt_generation);
    this.generationZippy_.animationDuration = 400;
  }

  /**
   * @type {boolean}
   * @private
   */
  this.modelAlt_ = false;

  /**
   * @type {Element}
   * @private
   */
  this.modelSelectWrapper_ = goog.dom.getElementByClass('model-select', form);

  /**
   * @type {Element}
   * @private
   */
  this.modelSelectAltWrapper_ = goog.dom.getElementByClass('model-select-alt', form);

  /**
   * @type {Element}
   * @private
   */
  this.spinEl_ = goog.dom.getElementByClass('carselect-spin', form);

  /**
   * @type {Element}
   * @private
   */
  this.brandSelect_ = form['brand'];

  /**
   * @type {Element}
   * @private
   */
  this.modelSelect_ = form['model'];

  /**
   * @type {Element}
   * @private
   */
  this.generationSelect_ = form['generation'];

  /**
   * @type {Element}
   * @private
   */
  this.productionYearSelect_ = form['productionYear'];

  /**
   * @type {Element}
   * @private
   */
  this.purchaseYearSelect_ = form['purchaseYear'];

  /**
   * @type {goog.structs.Map}
   * @private
   */
  this.brandInfo_ = new goog.structs.Map();

  /**
   * @type {goog.events.EventHandler}
   * @private
   */
  this.handler_ = new goog.events.EventHandler(this);
  this.handler_
      .listen(this.brandSelect_, goog.events.EventType.CHANGE, this.onChange_)
      .listen(this.modelSelect_, goog.events.EventType.CHANGE, this.onChange_);
  if (this.generationSelect_) {
    this.handler_.listen(this.generationSelect_, goog.events.EventType.CHANGE, this.onChange_);
  }
  if (this.productionYearSelect_) {
    this.handler_.listen(this.productionYearSelect_, goog.events.EventType.CHANGE, this.onChange_);
  }
};


/**
 * Можно ли не выбирать
 * @type {boolean}
 * @private
 */
drive.CarSelect.prototype.emptyBrandAllowed_ = true;


/**
 * @type {boolean}
 * @private
 */
drive.CarSelect.prototype.emptyModelAllowed_ = true;


/**
 * @type {boolean}
 * @private
 */
drive.CarSelect.prototype.emptyGenerationAllowed_ = true;


/**
 * @param {boolean} b
 */
drive.CarSelect.prototype.setEmptyBrandAllowed = function(b) {
  this.emptyBrandAllowed_ = b;
};


/**
 * @param {boolean} b
 */
drive.CarSelect.prototype.setEmptyModelAllowed = function(b) {
  this.emptyModelAllowed_ = b;
};


/**
 * @param {boolean} b
 */
drive.CarSelect.prototype.setEmptyGenerationAllowed = function(b) {
  this.emptyGenerationAllowed_ = b;
};


/**
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
drive.CarSelect.prototype.onChange_ = function(e) {
  var el = e.target;
  if (el.name == 'brand') {
    this.showModels();
  } else if (el.name == 'model') {
    this.renderGenerations_();
  } else if (el.name == 'generation') {
    this.renderYears_();
  } else if (el.name == 'productionYear') {
    this.renderYears_();
  }
};


/**
 * @return {string}
 * @private
 */
drive.CarSelect.prototype.getBrand_ = function() {
  return /** @type {string} */ (goog.dom.forms.getValue(this.brandSelect_));
};


/**
 *
 */
drive.CarSelect.prototype.showModels = function() {
  var brand = this.getBrand_();
  this.getBrandInfo_(brand);
};


/**
 * @param {string} brand
 * @private
 */
drive.CarSelect.prototype.getBrandInfo_ = function(brand) {
  if (!brand || this.brandInfo_.containsKey(brand)) {
    this.renderBrandAndModel_(brand);
  } else {
    var spin = drive.spinner(this.spinEl_);
    if (spin) {
      spin.addDisabledElement(this.modelSelect_, this.generationSelect_);
    }
    var q = new goog.Uri.QueryData();
    q.add('brand', brand);
    drive.xhr.send(
        drive.XhrRequests.BRAND_MODELS_INFO, q,
        this.getModelInfoCallback_, this, false, {
          spinner: spin || null,
          anchor: this.brandSelect_
        }, brand);
  }
};


/**
 * @param {*} data
 * @param {string} brand
 * @private
 */
drive.CarSelect.prototype.getModelInfoCallback_ = function(data, brand) {
  this.brandInfo_.set(brand, data);
  this.renderBrandAndModel_(brand);
};



/**
 * @param {string} brand
 * @private
 */
drive.CarSelect.prototype.renderBrandAndModel_ = function(brand) {
  // Удаляем первый пустой пункт в списке брендов если мы
  // не разрешили выбирать "пустой" бренд.
  if (brand && !this.emptyBrandAllowed_ && !this.brandSelect_.options[0].value) {
    goog.dom.removeNode(this.brandSelect_.options[0]);
  }

  var alt = brand == 'selfmade' || brand == 'other';
  if (alt != this.modelAlt_) {
    if (this.modelSelectWrapper_ && this.modelSelectAltWrapper_) {
      goog.style.setElementShown(this.modelSelectWrapper_, !alt);
      goog.style.setElementShown(this.modelSelectAltWrapper_, alt);
    }
    this.modelAlt_ = alt;
  }

  // Получаем информацию по моделям.
  var modelInfo = this.brandInfo_.get(brand) || [];
  var isEmpty = !modelInfo.length;

  // Генерируем select с моделями.
  var oldPlaceholderText = this.modelSelect_.options[0] && this.modelSelect_.options[0].innerHTML;
  this.modelSelect_.innerHTML = '';
  if (this.emptyModelAllowed_ || isEmpty) {
    this.appendOption_(this.modelSelect_, undefined, oldPlaceholderText, !isEmpty && !this.defaultModel_);
  }
  for (var i = 0, model; model = modelInfo[i]; i++) {
    this.appendOption_(this.modelSelect_, model['id'], model['model'], this.defaultModel_ == model['id']);
  }
  delete this.defaultModel_;

  // Генерируем select с поколениями.
  this.renderGenerations_();

  // Устанавливаем текущее состояние моделей.
  this.modelSelect_.disabled = isEmpty;
  drive.CarSelect.setExpanded_(this.modelZippy_, !isEmpty);
};


/**
 * @private
 */
drive.CarSelect.prototype.renderGenerations_ = function() {
  if (!this.generationSelect_) {
    return;
  }

  // Получаем информацию по поколениям.
  var brand = this.getBrand_();
  var model = this.modelSelect_.selectedIndex - (this.emptyModelAllowed_ ? 1 : 0);
  var modelInfo = this.brandInfo_.get(brand) || [];
  var generationInfo = modelInfo[model] ? modelInfo[model]['generations'] : [];
  var isEmpty = !generationInfo.length;

  // Генерируем select с поколениями.
  var oldPlaceholderText = this.generationSelect_.options[0] && this.generationSelect_.options[0].innerHTML;
  this.generationSelect_.innerHTML = '';
  if (this.emptyGenerationAllowed_ || isEmpty) {
    this.appendOption_(this.generationSelect_, undefined, oldPlaceholderText, !isEmpty && !this.defaultGeneration_)
  }
  for (var i = 0, generation; generation = generationInfo[i]; i++) {
    // Selected только если у нас идинственное поколение или у нас есть
    // поколение по умолчанию
    this.appendOption_(this.generationSelect_, generation[0], generation[1],
        this.defaultGeneration_ == generation[0]);
  }
  delete this.defaultGeneration_;

  // Генерируем select'ы с годами выпуска и покупки.
  this.renderYears_();

  // Устанавливаем текущее состояние поколений.
  //var showGenerations = isEmpty && this.generationSelect_.options.length > (this.emptyGenerationAllowed_ ? 2 : 1);
  this.generationSelect_.disabled = isEmpty;
  drive.CarSelect.setExpanded_(this.generationZippy_, !isEmpty && generationInfo.length > 1);
};


/**
 * @private
 */
drive.CarSelect.prototype.renderYears_ = function() {
  if (!this.productionYearSelect_) {
    return;
  }

  var brand = this.getBrand_();
  var model = this.modelSelect_.selectedIndex - (this.emptyModelAllowed_ ? 1 : 0);
  // Если модель не выбрана, то выбираем первую модель из списка.
  if (model < 0) {
    model = 0;
  }
  var generation = this.generationSelect_.selectedIndex - (this.emptyGenerationAllowed_ ? 1 : 0);
  // Если поколение не выбрано, то выбираем первое поколение из списка.
  if (generation < 0) {
    generation = 0;
  }
  var modelInfo = this.brandInfo_.get(brand) || [];
  var generationInfo = modelInfo[model] ? modelInfo[model]['generations'] : [];
  var yearInfo = generationInfo[generation] && generationInfo[generation][2];

  if (!yearInfo) {
    return;
  }

  // Дата выпуска.
  var endYear = yearInfo;
  var startYear = Math.max(new Date().getFullYear(), endYear);
  var selectedYear = this.defaultProductionYear_ || goog.dom.forms.getValue(this.productionYearSelect_);
  delete this.defaultProductionYear_;
  if (selectedYear && selectedYear < endYear) {
    selectedYear = endYear;
  }
  this.productionYearSelect_.innerHTML = '';
  this.appendOption_(this.productionYearSelect_, undefined, undefined, selectedYear);
  for (var year = startYear; year >= endYear; year--) {
    this.appendOption_(this.productionYearSelect_, year, year, selectedYear == year);
  }

  // Дата покупки.
  if (!this.purchaseYearSelect_) {
    return;
  }

  // Начальный год будет выбраным годом или начальным годом выпуска
  // (последний выведенный в предыдущем цикле).
  endYear = selectedYear || ++year;
  selectedYear = this.defaultPurchaseYear_ || goog.dom.forms.getValue(this.purchaseYearSelect_);
  delete this.defaultPurchaseYear_;
  if (selectedYear && selectedYear < endYear) {
    selectedYear = endYear;
  }
  this.purchaseYearSelect_.innerHTML = '';
  this.appendOption_(this.purchaseYearSelect_, undefined, undefined, selectedYear);
  for (year = startYear; year >= endYear; year--) {
    this.appendOption_(this.purchaseYearSelect_, year, year, selectedYear == year);
  }
};


/**
 * @param {Element} el
 * @param {string|number=} opt_value
 * @param {string|number=} opt_text
 * @param {boolean=} opt_selected
 * @private
 */
drive.CarSelect.prototype.appendOption_ = function(el, opt_value, opt_text, opt_selected) {
  var option = goog.dom.createElement('option');
  goog.dom.appendChild(el, option);
  option.value = opt_value || '';
  option.innerHTML = /** @type {string} */ (opt_text) || '&nbsp;';
  option.selected = opt_selected;
};


/**
 * @param {goog.ui.AnimatedZippy} zippy
 * @param {boolean} expanded
 * @private
 */
drive.CarSelect.setExpanded_ = function(zippy, expanded) {
  if (zippy) {
    zippy.setExpanded(expanded);
  }
};


/**
 * @param {Element} form
 * @param {string=} opt_model
 * @param {string=} opt_generation
 * @param {number=} opt_productionYear
 * @param {number=} opt_purchaseYear
 */
drive.CarSelect.full = function(form, opt_model, opt_generation, opt_productionYear, opt_purchaseYear) {
  var cs = new drive.CarSelect(form, opt_model, opt_generation, opt_productionYear, opt_purchaseYear);
  cs.showModels();
};


/**
 * @param {Element} form
 * @param {string=} opt_model
 * @param {string=} opt_generation
 * @param {number=} opt_productionYear
 * @param {number=} opt_purchaseYear
 */
drive.CarSelect.light = function(form, opt_model, opt_generation, opt_productionYear, opt_purchaseYear) {
  var cs = new drive.CarSelect(form, opt_model, opt_generation, opt_productionYear, opt_purchaseYear);
  cs.setEmptyBrandAllowed(false);
  cs.setEmptyModelAllowed(false);
  cs.setEmptyGenerationAllowed(false);
  cs.showModels();
};


/**
 * Export
 */
goog.exportSymbol('drv.carSelect', drive.CarSelect.full);
goog.exportSymbol('drv.carSelectLight', drive.CarSelect.light);
