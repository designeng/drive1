goog.provide('driveadm.config');
goog.provide('driveadm.EventType');
goog.provide('driveadm.Topics');
goog.provide('driveadm.appdata');
goog.provide('driveadm.messages.Net');

goog.require('bru.net.xhr.Xhr');



/*
driveadm.appdata = {
}
*/


/**
 * Константы для всех тем глобального PubSub.
 * @enum {string}
 */
driveadm.Topics = {
  LIGHTBOX_ZOOM: 'lz' // Lightbox zoom start
};


/**
 * @typedef {{
 *     maxImages: number,
 *     fixedAspectRatio: ?boolean,
 *     minSize: Array.<number>
 * }}
 */
driveadm.ImageListInfo;


/**
 * Все данные для ImageList'ов.
 * @type {Object.<driveadm.ImageListInfo>}
 */
driveadm.imageListsInfo = {
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
driveadm.XhrRequests = {
  BRAND_MODELS_INFO: 'bm'
};


/**
 * Конфигурация всех ajax-запросов
 * @type {goog.structs.Map}
 */
driveadm.xhrInfo = new goog.structs.Map(
  driveadm.XhrRequests.BRAND_MODELS_INFO,
  {
    url: '/suggest.php',
    xhrMethod: bru.net.xhr.Method.GET,
    behaviour: bru.net.xhr.Behaviour.SHOW_ERRORS//,
    //priority: 100
  }
);
