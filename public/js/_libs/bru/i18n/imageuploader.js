/**
 * @fileoverview Ресурсы для ImageUploader-а
 */

goog.provide('bru.i18n.ImageUploader');
goog.provide('bru.i18n.ImageUploader_en');
goog.provide('bru.i18n.ImageUploader_ru');



bru.i18n.ImageUploader_en = {
  FILE_SIZE_ERROR: 'Max file size is {SIZE}.',
  IMAGE_FORMAT_ERROR: 'Image format is wrong or not supported.',
  IU_UNKNOWN_ERROR: 'Unknown error <nobr>({CODE})</nobr>.',
  INVALID_JSON: 'Invalid server response <nobr>({STATUS})</nobr>.',
  ADD_FILE_BUTTON: 'Upload image{NUM_FILES, plural, one {} other {s}}'
};


bru.i18n.ImageUploader_ru = {
  FILE_SIZE_ERROR: 'Слишком большой файл{SIZE}. Максимально допустимый размер {MAX_SIZE}.',
  IMAGE_FORMAT_ERROR: 'Неизвестный формат изображения. Поддерживаемые форматы: JPEG.',
  IU_UNKNOWN_ERROR: 'Неизвестная ошибка при добавлении фотографии <nobr>({CODE})</nobr>.',
  INVALID_JSON: 'Ошибочный ответ сервера <nobr>({STATUS})</nobr>.',
  ADD_FILE_BUTTON: 'Загрузить фотографи{NUM_FILES, plural, one {ю} other {и}}'
};


if (goog.LOCALE == 'ru' || goog.LOCALE == 'ru-RU') {
  bru.i18n.ImageUploader = bru.i18n.ImageUploader_ru;
} else {
  bru.i18n.ImageUploader = bru.i18n.ImageUploader_en;
}

