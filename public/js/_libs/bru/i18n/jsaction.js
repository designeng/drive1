goog.provide('bru.i18n.JsAction');
goog.provide('bru.i18n.JsAction_en');
goog.provide('bru.i18n.JsAction_ru');



bru.i18n.JsAction_en = {
  UNLOAD_WARNING: 'You have unsaved data on the page. You may need to save changes before closing this page.'
};


bru.i18n.JsAction_ru = {
  UNLOAD_WARNING: 'На странице есть несохранённые данные.'
};


if (goog.LOCALE == 'ru' || goog.LOCALE == 'ru-RU') {
  bru.i18n.JsAction = bru.i18n.JsAction_ru;
} else {
  bru.i18n.JsAction = bru.i18n.JsAction_en;
}

