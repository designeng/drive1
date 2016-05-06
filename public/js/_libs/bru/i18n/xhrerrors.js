goog.provide('bru.i18n.XhrErrors');
goog.provide('bru.i18n.XhrErrors_en');
goog.provide('bru.i18n.XhrErrors_ru');



bru.i18n.XhrErrors_en = {
  REQUEST_ERROR: 'Request error',
  INVALID_JSON: 'Invalid server response.'
};


bru.i18n.XhrErrors_ru = {
  REQUEST_ERROR: 'Ошибка исполнения запроса',
  INVALID_JSON: 'Ошибочный ответ сервера.'
};


if (goog.LOCALE == 'ru' || goog.LOCALE == 'ru-RU') {
  bru.i18n.XhrErrors = bru.i18n.XhrErrors_ru;
} else {
  bru.i18n.XhrErrors = bru.i18n.XhrErrors_en;
}

