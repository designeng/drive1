goog.provide('bru.i18n.Dialog2');
goog.provide('bru.i18n.Dialog2_en');
goog.provide('bru.i18n.Dialog2_ru');



bru.i18n.Dialog2_en = {
  CLOSE_BUTTON: 'Close (Esc)'
};


bru.i18n.Dialog2_ru = {
  CLOSE_BUTTON: 'Закрыть (Esc)'
};


if (goog.LOCALE == 'ru' || goog.LOCALE == 'ru-RU') {
  bru.i18n.Dialog2 = bru.i18n.Dialog2_ru;
} else {
  bru.i18n.Dialog2 = bru.i18n.Dialog2_en;
}

