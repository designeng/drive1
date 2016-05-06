goog.provide('drive.loginInit');

goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.net.cookies');



/**
 * @constructor
 */
drive.loginInit = function() {
  var login = goog.net.cookies.get('login');
  var name = goog.net.cookies.get('name');

  if (login) {
    var wrapper = goog.dom.getElement('nav-top');
    var uls = wrapper.getElementsByTagName('ul');
    var userEl = goog.dom.getElement('nav-top-user');
    userEl.innerHTML = '<strong>' + login + '</strong>';// +
    //    (name ? ' (' + decodeURIComponent(name) + ')': '');
    userEl.href = userEl.href + login;
    goog.style.setElementShown(uls[0], false);
    goog.style.setElementShown(uls[1], true);
  }
};


/**
 * Export
 */
goog.exportSymbol('drv.loginInit', drive.loginInit);
