goog.provide('bru.net.xhr.Behaviour');
goog.provide('bru.net.xhr.Config');
goog.provide('bru.net.xhr.Method');
goog.provide('bru.net.xhr.Xhr');

goog.require('bru.i18n.XhrErrors');
goog.require('bru.net.xhr.Behaviour');
goog.require('bru.net.xhr.Method');
goog.require('bru.style');
goog.require('bru.ui.Bubble');
goog.require('bru.ui.Spinner');
goog.require('bru.ui.bubble');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.json');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrManager');
goog.require('goog.structs.Map');


/**
 * GET/POST
 * @enum {number}
 */
bru.net.xhr.Method = {
  GET: 0,
  POST: 1
};


/**
 * GET/POST
 * @enum {number}
 */
bru.net.xhr.Behaviour = {
  SILENT: 0,
  SHOW_ERRORS: 1
};


/**
 * @typedef {{
 *     url: string,
 *     xhrMethod: bru.net.xhr.Method,
 *     behaviour: bru.net.xhr.Behaviour,
 *     priority: number
 * }}
 */
bru.net.xhr.Config;


/**
 * @param {goog.structs.Map} xhrInfo Массив с информацией по всем запросам сайта.
 * @constructor
 */
bru.net.xhr.Xhr = function(xhrInfo) {

  /**
   * @type {goog.structs.Map}
   * @private
   */
  this.xhrInfo_ = xhrInfo;

  /**
   * @type {goog.structs.Map}
   * @private
   */
  this.requestInfo_ = new goog.structs.Map();

  var headers = new goog.structs.Map('X-Requested-With', 'XMLHttpRequest');

  /**
   * @type {goog.net.XhrManager}
   * @private
   */
  this.xhrManager_ = new goog.net.XhrManager(0, headers, 0, 6);

  goog.events.listen(this.xhrManager_,
      goog.net.EventType.READY, this.onReady_, false, this);
  goog.events.listen(this.xhrManager_,
      goog.net.EventType.COMPLETE, this.onComplete_, false, this);
  goog.events.listen(this.xhrManager_,
      goog.net.EventType.SUCCESS, this.onSuccess_, false, this);
  goog.events.listen(this.xhrManager_,
      goog.net.EventType.ERROR, this.onError_, false, this);
};


/**
 * @type {Function}
 * @private
 */
bru.net.xhr.Xhr.prototype.getCustomParams_ = goog.nullFunction;


/**
 * @param {Function} fn
 */
bru.net.xhr.Xhr.prototype.setCustomParamsFunction = function(fn) {
  this.getCustomParams_ = fn;
};


/**
 * @return {goog.net.XhrManager}
 */
bru.net.xhr.Xhr.prototype.getXhrManager = function() {
  return this.xhrManager_;
};


/**
 * @param {goog.net.XhrManager.Event} e
 * @private
 */
bru.net.xhr.Xhr.prototype.onReady_ = function(e) {
  var requestInfo = this.requestInfo_.get(e.id);
  var info = this.xhrInfo_.get(e.id);
  if (requestInfo.spinner) {
    requestInfo.spinner.start();
  } else if (!requestInfo.silent && info.behaviour === bru.net.xhr.Behaviour.SHOW_ERRORS) {
    this.busyTm_ = setTimeout(goog.bind(bru.style.setDocumentBusy, this, true), bru.ui.Spinner.START_DELAY);
  }
};


/**
 * @param {goog.net.XhrManager.Event} e
 * @private
 */
bru.net.xhr.Xhr.prototype.onComplete_ = function(e) {
  clearTimeout(this.busyTm_);
  var requestInfo = this.requestInfo_.get(e.id);
  var info = this.xhrInfo_.get(e.id);
  if (requestInfo.spinner) {
    goog.dispose(requestInfo.spinner);
  } else if (!requestInfo.silent && info.behaviour === bru.net.xhr.Behaviour.SHOW_ERRORS) {
    bru.style.setDocumentBusy(false);
  }
};


/**
 * @param {goog.net.XhrManager.Event} e
 * @private
 */
bru.net.xhr.Xhr.prototype.onSuccess_ = function(e) {
  var id = e.id;
  var requestInfo = this.requestInfo_.get(id);
  this.requestInfo_.remove(id);
  var info = this.xhrInfo_.get(id);
  var data;

  /** @preserveTry */
  try {
    data = goog.json.unsafeParse(e.xhrIo.getResponseText());
  } catch (ex) {
    if (!requestInfo.silent) {
      this.showError_(bru.i18n.XhrErrors.INVALID_JSON,
          bru.ui.Bubble.Type.ERROR, info.behaviour, requestInfo.anchor);
    }
    return;
  }

  var notification = data['error'] || data['notification'];
  if (notification && goog.isArray(notification)) {
    notification = notification.join('<p>');
  }

  if (notification) {
    if (!requestInfo.silent) {
      this.showError_(notification, bru.ui.Bubble.Type.ALERT, info.behaviour, requestInfo.anchor);
    }
    if (requestInfo.errorCallback) {
      requestInfo.params.unshift(data);
      requestInfo.errorCallback.apply(requestInfo.handler || requestInfo.errorCallback, requestInfo.params);
    }
  } else if (requestInfo.callback) {
    requestInfo.params.unshift(data);
    requestInfo.callback.apply(requestInfo.handler || requestInfo.callback, requestInfo.params);
  }
};


/**
 * @param {goog.net.XhrManager.Event} e
 * @private
 */
bru.net.xhr.Xhr.prototype.onError_ = function(e) {
  var id = e.id;
  var requestInfo = this.requestInfo_.get(id);
  this.requestInfo_.remove(id);
  if (requestInfo.errorCallback) {
    requestInfo.errorCallback.apply(requestInfo.handler || requestInfo.errorCallback, requestInfo.params);
  }
  if (!requestInfo.silent) {
    var info = this.xhrInfo_.get(id);
    var httpStatus = e.xhrIo.getStatus();
    var status = e.xhrIo.getResponseHeader('X-Request-ID') || httpStatus;
    var errorText = bru.i18n.XhrErrors.REQUEST_ERROR;
    if (httpStatus == 401 || httpStatus == 403) {
      /** @preserveTry */
      try {
        errorText = goog.json.unsafeParse(e.xhrIo.getResponseText())['error'];
      } catch (ex) {}
    }
    this.showError_(errorText + (status ? ' <nobr>(' + status + ')</nobr>.' : '.'),
        bru.ui.Bubble.Type.ERROR, info.behaviour, requestInfo.anchor);
  }
};


/**
 * @param {string} msg
 * @param {bru.ui.Bubble.Type} type
 * @param {number=} opt_behaviour
 * @param {Element=} opt_anchor
 * @private
 */
bru.net.xhr.Xhr.prototype.showError_ = function(msg, type, opt_behaviour, opt_anchor) {
  if (opt_behaviour !== bru.net.xhr.Behaviour.SHOW_ERRORS) {
    return;
  }

  if (opt_anchor) {
    bru.ui.bubble.bubble(opt_anchor, msg, type, undefined, 'xhrnotification');
  } else {
    alert(msg.replace(/<[^>]+>/g, '\n '));
  }
};


/**
 * Aborts the request associated with id.
 * @param {string} id The id of the request to abort.
 * @param {boolean=} opt_force If true, remove the id now so it can be reused.
 *     No events are fired and the callback is not called when forced.
 */
bru.net.xhr.Xhr.prototype.abort = function(id, opt_force) {
  this.xhrManager_.abort(id, opt_force);
};


/**
 * @param {string} id Request Id.
 * @param {goog.Uri.QueryData|string=} opt_content Post data.
 * @param {Function=} opt_callback Callback function for when request is
 *     complete. The only param is the event object from the COMPLETE event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @param {boolean=} opt_noabort Не прерывать текущий запрос если о есть.
 * @param {Object.<*>=} opt_options
 * @param {...*} var_args
 * @return {goog.net.XhrManager.Request} The queued request object.
 */
bru.net.xhr.Xhr.prototype.send = function(id, opt_content, opt_callback,
    opt_handler, opt_noabort, opt_options, var_args) {
  if (opt_noabort) {
    if (this.xhrManager_.isBusy(id)) {
      return null;
    }
  } else {
    this.abort(id, true);
  }

  this.requestInfo_.set(id, {
    callback: opt_callback,
    handler: opt_handler,
    spinner: /** @type {bru.ui.Spinner} */ (opt_options && opt_options.spinner),
    anchor: /** @type {Element} */ (opt_options && opt_options.anchor),
    silent: /** @type {boolean} */ (opt_options && opt_options.silent),
    errorCallback: /** @type {Function} */ (opt_options && opt_options.errorCallback),
    params: goog.array.slice(arguments, 6)
  });

  return this.managerSend_(id, opt_content,
      /** @type {string} */(opt_options && opt_options.url));
};


/**
 * @param {string} id
 * @param {goog.Uri.QueryData|string=} opt_content Post data.
 * @param {string=} opt_url
 * @return {goog.net.XhrManager.Request} The queued request object.
 * @private
 */
bru.net.xhr.Xhr.prototype.managerSend_ = function(id, opt_content, opt_url) {
  opt_content = opt_content.toString();
  var info = this.xhrInfo_.get(id);
  var get = info.xhrMethod == bru.net.xhr.Method.GET;
  var customContent = this.getCustomParams_();
  var content = customContent && !get ? customContent + '&' + opt_content : opt_content;
  return this.xhrManager_.send(id, (opt_url || info.url) + (get ? '?' + content : ''),
      get ? 'GET' : 'POST',
      get ? undefined : content, null,
      info.priority || 100);
};
