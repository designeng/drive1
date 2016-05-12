goog.provide('drive.config');
goog.provide('drive.EventType');
goog.provide('drive.Topics');
goog.provide('drive.appdata');
goog.provide('drive.messages.Net');

goog.require('bru.net.xhr.Xhr');



/**
 * Idle timeout. Если пользователь бездействует больше данного
 * времени, то текущее окно можно считать неактивным.
 * @const
 * @type {number}
 */
//drive.IDLE_TIMEOUT = 15000;


/**
 * @define {boolean}
 */
goog.XHR_DEBUG = false;


/*
drive.appdata = {
}
*/


/**
 * Количество типов теней для маленьких картинках в статьях.
 * @const {number}
 */
drive.ARTICLE_PICTURE_TYPES = 3;


/**
 * Константы для всех тем глобального PubSub.
 * @enum {string}
 */
drive.Topics = {
  CURRENCY_CHANGE: 'ch', // Выбор другой валюты в поиске машин
  PRICE_CHANGE: 'pc', // Изменение цены
  SET_PRICE: 'sp', // Установка цены
  LIGHTBOX_ZOOM: 'lz', // Lightbox zoom start
  BRANDSNAV_SHOW: 'b' // Открылось меню брендов
};


/**
 * @typedef {{
 *     maxImages: number,
 *     fixedAspectRatio: ?boolean,
 *     minSize: Array.<number>
 * }}
 */
drive.ImageListInfo;


/**
 * Все данные для ImageList'ов.
 * @type {Object.<drive.ImageListInfo>}
 */
drive.imageListsInfo = {
  'avatar': {
    maxImages: 1,
    fixedAspectRatio: true,
    minSize: [100, 100]
  },
  'photos': {
    maxImages: 8,
    fixedAspectRatio: true,
    minSize: [480, 360]
  },
  'articlephotos': {
    maxImages: 99,
    fixedAspectRatio: false,
    minSize: [480, 360]
  }
};


/**
 * Список Id всех xhr запросов.
 * TODO: Переделать в объекты.
 * @enum {string}
 */
drive.XhrRequests = {
  BRAND_MODELS_INFO: 'bm', // Информация по брендам (модели, поколения)
  COMPARE_BUILDS_INFO: 'cb', // Информация по брендам для сравнения
  ERROR_FEEDBACK: 'ef', // Отправка
  FORUM: 'f', // Форум
  FORUM_COMMENT: 'fc', // Комментарий
  SELL_INFO: 's', // Страница объявления - получение контактной информации
  CAR_SEARCH: 'c', // Поиск автомобиля
  POLL: 'p' // Опросник под статьей
};


/**
 * Конфигурация всех ajax-запросов
 * @type {goog.structs.Map}
 */
drive.xhrInfo = new goog.structs.Map(
  drive.XhrRequests.BRAND_MODELS_INFO,
  {
    url: goog.XHR_DEBUG ? '/_fish/json.model-info.htm' : '/api/suggest',
    xhrMethod: bru.net.xhr.Method.GET,
    behaviour: bru.net.xhr.Behaviour.SHOW_ERRORS//,
    //priority: 100
  },

  drive.XhrRequests.COMPARE_BUILDS_INFO,
  {
    url: goog.XHR_DEBUG ? '/_fish/json.build-info.htm' : '/api/compare',
    xhrMethod: bru.net.xhr.Method.GET
  },

  drive.XhrRequests.ERROR_FEEDBACK,
  {
    url: '/api.php',
    behaviour: bru.net.xhr.Behaviour.SHOW_ERRORS
  },

  drive.XhrRequests.FORUM,
  {
    url: goog.XHR_DEBUG ? '/_fish/json.forum.htm' : '',
    behaviour: bru.net.xhr.Behaviour.SHOW_ERRORS
  },

  drive.XhrRequests.FORUM_COMMENT,
  {
    url: goog.XHR_DEBUG ? '/_fish/json.forum-comment.htm' : '/api.php',
    behaviour: bru.net.xhr.Behaviour.SHOW_ERRORS
  },

  drive.XhrRequests.SELL_INFO,
  {
    url: '/api.php',
    behaviour: bru.net.xhr.Behaviour.SHOW_ERRORS
  },

  drive.XhrRequests.POLL,
  {
    url: '/api/poll',
    behaviour: bru.net.xhr.Behaviour.SHOW_ERRORS
  },

  drive.XhrRequests.CAR_SEARCH, {}
);
