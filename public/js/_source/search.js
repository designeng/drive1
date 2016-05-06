goog.provide('drive.carSearch.Form');

goog.require('bru.string');
goog.require('bru.form.CheckboxToggle');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.ui.decorate');
goog.require('goog.ui.SelectionModel');
goog.require('goog.Uri.QueryData');
goog.require('goog.net.cookies');
goog.require('goog.History');
goog.require('drive.ToggleButton');
goog.require('drive.Compare');



/**
 * @constructor
 */
drive.carSearch.Form = function() {

  /**
   * @type {HTMLFormElement}
   * @private
   */
  this.form_ = /** @type {HTMLFormElement} */ (goog.dom.getElement('car-search-form'));

  /**
   * @type {goog.History}
   * @private
   */
  this.history_ = new goog.History();

  /**
   * @type {goog.ui.SelectionModel}
   * @private
   */
  this.typeSM_ = this.renderButtons_('t');

  var ctBodytype = new bru.form.CheckboxToggle('car-search-form-bodytype-toggle');
  var ctCountry = new bru.form.CheckboxToggle('car-search-form-country-toggle');

  goog.events.listen(ctBodytype, goog.events.EventType.CHANGE,
      this.onFormChange_, false, this);
  goog.events.listen(ctCountry, goog.events.EventType.CHANGE,
      this.onFormChange_, false, this);
  var selects = this.form_.getElementsByTagName('select');
  for (var i = 0, select; select = selects[i]; i++) {
    goog.events.listen(select, goog.events.EventType.CHANGE,
        this.onFormChange_, false, this);
  }
  var inputs = this.form_.getElementsByTagName('input');
  var input;
  for (i = 0; input = inputs[i]; i++) {
    goog.events.listen(input, goog.events.EventType.CLICK,
        this.onFormChange_, false, this);
  }
  drive.dispatcher.registerHandlers('carsearch', {
      'more': this.onMore_}, this);
  goog.events.listen(this.history_, goog.history.EventType.NAVIGATE,
      this.historyChanged_, false, this);

  this.formInit_(this.history_.getToken());
  this.history_.setEnabled(true);
};


/**
 * @type {string}
 */
drive.carSearch.Form.COOKIE_NAME = '.DriveSearch';


/**
 * @type {number}
 */
drive.carSearch.Form.COOKIE_MAXAGE = 365 * 24 * 60 * 60;


/**
 * @param {goog.history.Event} e Browser's event object.
 * @private
 */
drive.carSearch.Form.prototype.historyChanged_ = function(e) {
  // Инициализируем форму если история поменялась браузером.
  if (e.isNavigation) {
    this.formInit_(e.token);
  }
  this.load_();
};


/**
 * @param {goog.events.Event} e
 * @private
 */
drive.carSearch.Form.prototype.onFormChange_ = function(e) {
  e.stopPropagation();
  this.formSet_(e);
  this.updateCookiesAndToken_();
};


/**
 * @param {goog.events.Event} e
 * @private
 */
drive.carSearch.Form.prototype.onAction_ = function(e) {
  var tb = e.target;
  if (tb.isChecked()) {
    return;
  }
  var value = tb.getValue().split(':');
  goog.dom.forms.setValue(this.form_[value[0]], value[1]);

  this.formSet_();
  this.updateCookiesAndToken_();
};


/**
 * @param {goog.jsaction.Context} context
 * @private
 */
drive.carSearch.Form.prototype.onMore_ = function(context) {
  if (this.lastSince_) {
    this.load_(true);
  }
};


/**
 * @private
 */
drive.carSearch.Form.prototype.updateCookiesAndToken_ = function() {
  var q = goog.Uri.QueryData.createFromMap(goog.dom.forms.getFormDataMap(this.form_));

  var cookie = this.encode_(q.toString());
  goog.net.cookies.set(drive.carSearch.Form.COOKIE_NAME,
      cookie, drive.carSearch.Form.COOKIE_MAXAGE, '/'/*, 'drive.ru'*/);

  this.history_.setToken(cookie);
};


/**
 * @param {goog.events.Event=} opt_e
 * @private
 */
drive.carSearch.Form.prototype.formSet_ = function(opt_e) {
  var items = this.typeSM_.getItems();
  var value = goog.dom.forms.getValue(this.form_['t']);
  for (var i = 0, item; item = items[i]; i++) {
    if (item.getValue().split(':')[1] == value) {
      this.typeSM_.setSelectedItem(item);
    }
  }

  // Устанавливаем селекты с ценами.
  var priceFrom = this.form_['p'];
  var priceTo = this.form_['P'];
  if (opt_e && opt_e.type == goog.events.EventType.CHANGE &&
      opt_e.target == priceTo && priceTo.selectedIndex < priceFrom.selectedIndex) {
    priceFrom.selectedIndex = priceTo.selectedIndex;
  } else if (priceTo.selectedIndex < priceFrom.selectedIndex) {
    priceTo.selectedIndex = priceFrom.selectedIndex;
  }

  // Отключаем выбор возраста и пробега для новых машин.
  var type = this.form_['t'].selectedIndex;
  this.form_['m'].disabled = type == 1;
  this.form_['a'].disabled = type == 1;

  var disabled = this.form_['b'].selectedIndex > 0;
  var checkboxes = goog.dom.getElement('car-search-form-table-country').getElementsByTagName('input');
  for (var i = 0, checkbox; checkbox = checkboxes[i]; i++) {
    checkbox.disabled = disabled;
    goog.dom.classlist.enable(checkbox.parentNode, 'car-search-form-brand-disabled', disabled);
  }
};


/**
 * @param {string} q
 * @private
 */
drive.carSearch.Form.prototype.formInit_ = function(q) {
  this.restore_(q);
  this.formSet_();
};


/**
 * @param {string} q
 * @private
 */
drive.carSearch.Form.prototype.restore_ = function(q) {
  var data = this.decode_(q);
  var dataKeys = data.getKeys();
  var inputs = this.form_.getElementsByTagName('input');
  for (var j = 0, key; key = dataKeys[j]; j++) {
    var value = /** @type {Array.<string>} */(data.get(key));
    var fields = this.form_[key];
    // Чекбоксы с индексом
    if (key == 'c' || key == 'C') {
      for (var i = 0, input; input = inputs[i]; i++) {
        if (input.type == 'checkbox' && input.name.charAt(0) == key) {
          for (var k = 0; k < value.length; k++) {
            input.checked = goog.array.contains(value, input.value);
          }
        }
      }
    } else {
      if (fields.type) {
        goog.dom.forms.setValue(fields, value[0]);
      } else {
        for (i = 0; i < fields.length; i++) {
          if (fields[i].value == value[0]) {
            goog.dom.forms.setValue(fields[i], value[0]);
          }
        }
      }
    }
  }
};


/**
 * @param {boolean=} opt_more
 * @private
 */
drive.carSearch.Form.prototype.load_ = function(opt_more) {
  clearTimeout(this.tm_);

  var q = goog.Uri.QueryData.createFromMap(goog.dom.forms.getFormDataMap(this.form_));
  if (opt_more) {
    q.add('since', this.lastSince_);
  }

  if (!opt_more) {
    goog.dom.classlist.add(goog.dom.getElement('car-search-results'), 'car-search-results-busy');
  }
  drive.xhr.send(drive.XhrRequests.CAR_SEARCH, q, this.show_, this, false,
      {url: this.form_.action}, opt_more);
};


/**
 * @param {string} q
 * @return {string}
 * @private
 */
drive.carSearch.Form.prototype.encode_ = function(q) {
  var data = q.split('&');
  var encodedData = [];
  for (var i = 0; i < data.length; i++) {
    var pair = data[i].split('=');
    var key = pair[0].charAt(0);
    var value = pair[1];
    if (value) {
      encodedData.push(key + value);
    }
  }
  return encodedData.join(':');
};


/**
 * @param {string} q
 * @return {goog.structs.Map}
 * @private
 */
drive.carSearch.Form.prototype.decode_ = function(q) {
  var data = q.split(':');
  var decodedData = new goog.structs.Map();
  for (var i = 0; i < data.length; i++) {
    var key = data[i].charAt(0);
    var value = data[i].substring(1);
    var t = decodedData.containsKey(key) ? decodedData.get(key) : [];
    t.push(value);
    decodedData.set(key, t);
  }
  return decodedData;
};


/**
 * param {*} data
 * param {boolean=} opt_more
 * @private
 */
drive.carSearch.Form.prototype.show_ = function(data, opt_more) {
  var ids = [];
  var dataFromCookies = goog.net.cookies.get(drive.Compare.COMPARE_COOKIE_NAME);
  if (dataFromCookies) {
    var dataFromCookiesArray = dataFromCookies.split(',');
    for (var i = 0, id; id = dataFromCookiesArray[i]; i += 2) {
      ids.push(id);
    }
  }

  // Устанавливаем последний since.
  var cars = data['cars'];
  if (cars.length) {
    this.lastSince_ = cars[cars.length - 1]['since'];
  }

  var html = this.render_(data, ids);
  var wrapper = goog.dom.getElement('car-search-results');
  html = opt_more ?
      wrapper.innerHTML + '<div class="car-search-results-more car-search-results-busy">' +
      '<div class="hr"><hr></div>' + html + '</div>':
      html || '<h3>' + data['resTitle'] + '<h3>';

  goog.style.setElementShown(goog.dom.getElement('car-search-results-legend'), opt_more || cars.length);
  goog.style.setElementShown(goog.dom.getElement('car-search-more'), data['button']);
  this.tm_ = setTimeout(goog.bind(this.reveal_, this, html, opt_more), 100);
};


/**
 * param {string} html
 * param {boolean=} opt_more
 * @private
 */
drive.carSearch.Form.prototype.reveal_ = function(html, opt_more) {
  var wrapper = goog.dom.getElement('car-search-results');
  wrapper.innerHTML = html;
  if (opt_more) {
    var moreEls = goog.dom.getElementsByClass('car-search-results-more');
    wrapper = moreEls[moreEls.length - 1];
    goog.reflect.sinkValue(wrapper.offsetTop); // Force reflow
  }
  goog.dom.classlist.remove(wrapper, 'car-search-results-busy');
};


/**
 * @param {string} name
 * @return {goog.ui.SelectionModel}
 * @private
 */
drive.carSearch.Form.prototype.renderButtons_ = function(name) {
  var groupEl = goog.dom.createElement('div');
  goog.dom.classlist.add(groupEl, 't-btn-group');
  goog.dom.insertSiblingBefore(groupEl, this.form_.firstChild);

  var selectionModel = new goog.ui.SelectionModel();
  selectionModel.setSelectionHandler(function(button, select) {
    if (button) {
      button.setChecked(select);
    }
  });

  var select = this.form_[name];
  for (var i = 0, option; option = select.options[i]; i++) {
    var tb = new drive.ToggleButton(option.text);
    tb.setAutoStates(goog.ui.Component.State.CHECKED, false);
    selectionModel.addItem(tb);
    if (i == select.selectedIndex) {
      selectionModel.setSelectedItem(tb);
    }
    tb.setValue(name + ':' + option.value);
    var collapsed = goog.ui.ButtonSide.BOTH;
    if (i == 0) {
      collapsed ^= goog.ui.ButtonSide.START;
    }
    if (i == select.options.length - 1) {
      collapsed ^= goog.ui.ButtonSide.END;
    }
    tb.setCollapsed(collapsed);
    tb.render(groupEl);
    goog.events.listen(tb, goog.ui.Component.EventType.ACTION,
        this.onAction_, false, this);
  }

  return selectionModel;
};


/**
 * @param {Object.<string|number>} data
 * @param {Array.<string>} bookmarkIds
 * @return {string}
 * @private
 */
drive.carSearch.Form.prototype.render_ = function(data, bookmarkIds) {
  var html = [];
  for (var i = 0, entry; entry = data['cars'][i]; i++) {
    var url = entry['url'];
    var misc = entry['misc'];
    var id = entry['modelid'] || entry['id']['$id'];
    html[i] = '<div class="acard">' +
        '<div class="acard-price">' + bru.string.formatMoney(entry['price']) + '<span><i class="i"></i></span></div>' +
        '<div class="acard-mileage">' + (entry['mileage'] || '—') + '</div>' +
        '<div class="acard-year">' + (entry['year'] || '—') + '</div>' +
        '<div class="acard-caption"><a class="compare-link" href="' + url + '">' + entry['title'] + '</a></div>' +
        '<div class="acard-pic-wrapper">' +
        '<div class="acard-pic' + (entry['type'] ? ' acard-pic-models' : '') + '"><a href="' + url +
        '"><img src="' + entry['pic'] + '"></a></div>' +
        (entry['urgent'] == 1 ? '<span class="i acard-urgent"></span>' :
        entry['bargain'] == 1 ? '<span class="i acard-bargain"></span>' : '') +
        '</div>' +
        '<div class="acard-compare"><span data-action="compare.add" data-id="' + id + '">' +
        (goog.array.contains(bookmarkIds, id) ? 'Убрать из сравнения' : 'Добавить к сравнению') +
        '</span></div>' +
        '<div class="acard-info">' + entry['info'] + '</div>' +
        '</div>';
  }
  return html.join('');
};


/**
 * Export
 */
goog.exportSymbol('drv.CsForm', drive.carSearch.Form);
