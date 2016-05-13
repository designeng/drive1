goog.provide('drive.loginInit');

goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.net.cookies');
goog.require('goog.events');


/**
 * @constructor
 */
drive.loginInit = function() {
  var login = goog.net.cookies.get('login');
  var name = goog.net.cookies.get('name');

  this.handler_ = new goog.events.EventHandler(this);

  if (login) {
    var wrapper = goog.dom.getElement('nav-top');
    var uls = wrapper.getElementsByTagName('ul');
    var userEl = goog.dom.getElement('nav-top-user');
    var logoutEl = goog.dom.getElement('nav-top-logout');

    this.handler_.listen(logoutEl, goog.events.EventType.CLICK, function() {
      goog.net.cookies.remove(drive.loginInit.LOGIN_COOKIE_NAME);
      goog.net.cookies.remove(drive.loginInit.USERID_COOKIE_NAME);
    });

    userEl.innerHTML = '<strong>' + login + '</strong>';// +
    //    (name ? ' (' + decodeURIComponent(name) + ')': '');
    userEl.href = userEl.href + login;
    goog.style.setElementShown(uls[0], false);
    goog.style.setElementShown(uls[1], true);
  }
};

/**
 * @type {string}
 */
drive.loginInit.LOGIN_COOKIE_NAME = 'login';

/**
 * @type {string}
 */
drive.loginInit.USERID_COOKIE_NAME = 'userid';

/**
 * Export
 */
goog.exportSymbol('drv.loginInit', drive.loginInit);
