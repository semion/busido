define(["backbone", "gmaps", "backbone.googlemaps", "router"], function(Backbone, google, GoogleMaps, Router){
  "use strict";
  var App = {};

  // location to be updated on drag stop
	App.Location = Backbone.GoogleMaps.Location.extend({
	  idAttribute: 'title',
	  defaults: {
	    lat: 45,
	    lng: -93
	  }
	});

  App.LocationCollection = Backbone.GoogleMaps.LocationCollection.extend({
    model: App.Location
  });

  App.InfoWindow = Backbone.GoogleMaps.InfoWindow.extend({
    template: '#infoWindow-template',

    events: {
      'mouseenter h2': 'logTest'
    },

    logTest: function() {
      console.log('test in InfoWindow');
    }
  });

  App.detectGeoLocation = function(){
    
    var app = this;

    var geolocationSuccess = function(position) {
        app.Location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        app.map.setCenter(app.Location);
        google.maps.event.addListener(app.map, 'idle',
            function(){
                $.getJSON('/api/get_nearest_stops/',{coords: app.map.getCenter().toUrlValue(10)},
                  app.handleStopsList);
            });
    }

    var handleNoGeolocation = function(err){
      $.ajax('http://freegeoip.net/json/', {
            dataType: 'jsonp'
        }).always(handleGeoipRequest); 
    };

    var handleGeoipRequest = function(data){
        app.map.setCenter(new google.maps.LatLng(data.latitude, data.longitude));
    };

    // Try HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(geolocationSuccess, function() {
            handleNoGeolocation(true);
        });
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);

    }

    return this
  }

  App.createMap = function() {
    var mapOptions = {
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    // Instantiate map
    this.map = new google.maps.Map($('#map_canvas')[0], mapOptions);

    return this;
  }

  App.init = function(){
    console.log("wakawaka");
    this.createMap().detectGeoLocation();
  }
  
  // The root path to run the application through.
  App.root = "/";

  return App
});
