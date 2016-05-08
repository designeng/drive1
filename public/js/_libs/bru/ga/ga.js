goog.provide('bru.ga');
goog.provide('bru.ga.trackEvent');



/**
 * @param {string} category The name you supply for the group of objects
 *    you want to track.
 * @param {string} action A string that is uniquely paired with each category,
 *    and commonly used to define the type of user interaction for the web object.
 * @param {string=} opt_label An optional string to provide additional dimensions
 *    to the event data.
 * @param {number=} opt_value An integer that you can use to provide
 *    numerical data about the user event.
 * @param {boolean=} opt_noninteraction A boolean that when set to true,
 *    indicates that the event hit will not be used in bounce-rate calculation.
 */
bru.ga.trackEvent = function(category, action, opt_label, opt_value, opt_noninteraction) {
  /*
  if (window['_gaq']) {
    window['_gaq'].push(['_trackEvent',
        category, action, opt_label, opt_value, opt_noninteraction]);
  }
  */
  if (window['_ga']) {
    window['_ga']('send', 'event', category, action, opt_label, opt_value);
  }
};
