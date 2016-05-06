/**
 * @fileoverview Ресурсы для ImageListGroup
 */

goog.provide('bru.i18n.ImageListGroup');
goog.provide('bru.i18n.ImageListGroup_en');
goog.provide('bru.i18n.ImageListGroup_ru');



bru.i18n.ImageListGroup_en = {
  CROP_CAPTION: 'Image crop',
  CROP_INTRO: 'Double click will automatically select the maximum image area.',
  INFO: 'If you want to crop uploaded {MAX_IMAGES, plural, one {image} other {images}}, ' +
    'please do so now. After submitting your post, you will be unable to crop these images.' +
    '{MAX_IMAGES, plural, one {image} other { You can change the order of appearance by dragging the images to the desired place.}}',
  ACTION_CROP: 'Crop',
  ACTION_LINK: 'Insert into text',
  ACTION_REPLACE: 'Replace',
  ACTION_DELETE: 'Delete',
  ACTION_CONFIRM: 'Are you sure?',
  CROP_SUBMIT_BUTTON: 'OK'
};

bru.i18n.ImageListGroup_ru = {
  CROP_CAPTION: 'Кадрирование',
  CROP_INTRO: 'Двойной клик выделяет максимально возможный фрагмент.',
  INFO: 'Если {MAX_IMAGES, plural, one {изображение} other {какое-то из изображений}} нужно скадрировать, ' +
    'сделайте это&nbsp;сейчас. После сохранения формы такой возможности уже не&nbsp;будет.' +
    '{MAX_IMAGES, plural, one {} other { Также вы можете поменять порядок вывода изображений, перетаскивая их&nbsp;мышкой.}}',
  ACTION_CROP: 'Кадрировать',
  ACTION_LINK: 'Вставить в текст',
  ACTION_REPLACE: 'Заменить',
  ACTION_DELETE: 'Удалить',
  ACTION_CONFIRM: 'Вы уверены?',
  CROP_SUBMIT_BUTTON: 'Готово'
};


if (goog.LOCALE == 'ru' || goog.LOCALE == 'ru-RU') {
  bru.i18n.ImageListGroup = bru.i18n.ImageListGroup_ru;
} else {
  bru.i18n.ImageListGroup = bru.i18n.ImageListGroup_en;
}
