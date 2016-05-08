goog.provide('bru.i18n.Bubble');
goog.provide('bru.i18n.Bubble_en');
goog.provide('bru.i18n.Bubble_ru');



bru.i18n.Bubble_en = {
  YES: 'Yes',
  NO: 'No'
};


bru.i18n.Bubble_ru = {
  YES: 'Да',
  NO: 'Нет'
};


if (goog.LOCALE == 'ru' || goog.LOCALE == 'ru-RU') {
  bru.i18n.Bubble = bru.i18n.Bubble_ru;
} else {
  bru.i18n.Bubble = bru.i18n.Bubble_en;
}
