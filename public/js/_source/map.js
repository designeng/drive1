goog.provide('drive.map');
goog.provide('drive.map.init');
goog.provide('drive.map.load');

goog.require('goog.dom');
goog.require('goog.ui.AnimatedZippy');
goog.require('goog.ui.Zippy');



/**
 *
 */
drive.map.zippy = function() {
  var loaded;
  var zippy = new goog.ui.AnimatedZippy(goog.dom.getElement('map-toggle'),
      goog.dom.getElement('map-canvas'), false);
  zippy.animationDuration = 500;
  goog.events.listen(zippy, goog.ui.Zippy.Events.TOGGLE, function(e) {
    if (!loaded) {
      loaded = true;
      drive.map.load();
    }
  });
};


/**
 * Рисуем карту.
 */
drive.map.init = function() {
  // id, title, city, address, latitude, longitude, isPremium
  var data = goog.global['drv']['__map'];
  if (!data || data.length < 7) {
    return;
  }

  var mapOptions = {
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(goog.dom.getElement('cmap'), mapOptions);
  var infowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();
  var id;
  var title;
  var address;
  var coords = null;
  var marker;
  var link;
  var premium;
  for (var i = 0, l = data.length; i < l; i += 7) {
    id = /** @type {string} */ (data[i]);
    title = /** @type {string} */ (data[i + 1]);
    address = /** @type {string} */ (data[i + 2] + ', ' + data[i + 3]);
    coords = new google.maps.LatLng(
        /** @type {number} */ (data[i + 4]),
        /** @type {number} */ (data[i + 5]));
    premium = data[i + 6] == 1;
    bounds.extend(coords);
    marker = new google.maps.Marker({
      position: coords,
      map: map,
      icon: 'http://maps.google.com/mapfiles/ms/icons/' +
          (premium ? 'yellow-dot.png' : 'red-dot.png'),
      title: title
    });
    link = l == 7 ? null : '/company/' + id + '.html';
    google.maps.event.addListener(marker, 'click', (function(link, marker, address) {
      return function() {
        var title = marker.getTitle();
        infowindow.setContent('<div style="oveflow:hidden;margin:2px 0"><h3 style="font-size:17px;margin-bottom:7px;">' +
            (link ? '<a href="' + link +'">' + title + '</a>' : title) +
            '</h3>' + address + '</div>');
        infowindow.open(map, marker);
      }
    })(link, marker, address));
  }

  if (l == 7) {
    map.setCenter(coords);
    infowindow.setContent('<div style="oveflow:hidden;margin:2px 0"><h3 style="font-size:17px;margin-bottom:7px">' + title + '</h3>' + address + '</div>');
    infowindow.open(map, marker);
  } else {
    map.fitBounds(bounds);
  }

  google.maps.event.addListener(map, 'click', function() {
    infowindow.close();
  });
};


/**
 * Асинхронная загрузка Google Maps API.
 */
drive.map.load = function() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = '//maps.googleapis.com/maps/api/js?v=3.21&key=AIzaSyBk19HoOjYf6HdCB8vkkcLo8QV7Fh1ouQM&sensor=false&language=ru&callback=drv.mapInit';
  document.body.appendChild(script);
};


/**
 * Export
 */
goog.exportSymbol('drv.map', drive.map.load);
goog.exportSymbol('drv.mapInit', drive.map.init);
goog.exportSymbol('drv.mapZippy', drive.map.zippy);
