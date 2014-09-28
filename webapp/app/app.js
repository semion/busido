/* jshint browser: true, jquery: true, devel: true */
/* global define */
define([
  'jquery',
  'underscore',
  'backbone',
  'router',
  'gmaps',
  'backbone.googlemaps'],
  function($, _, Backbone, Router, google){
  'use strict';
  
  var App = {};

	App.BusStop = Backbone.GoogleMaps.Location.extend({});

  App.BusStopCollection = Backbone.GoogleMaps.LocationCollection.extend({});

  App.BusStopView = Backbone.View.extend({
    render: function(){
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(val.lat, val.lon),
        map: App.map,
        title: .name,
        optimized: true
//        icon: createMarker(13, 14, 7, 'rgba(255, 0, 0, 0.8)')
      });
      
    }
  });

  App.BusStopCollection = Backbone.Collection.extend({
    model: App.Location,
    url: function(){
      return '/api/get_nearest_stops/?coords=' + 
      App.map.getCenter().toUrlValue(10);
    }
  });

  App.MapView = Backbone.GoogleMaps.MapView.extend({
    render: function() {

      return this;
    }
  });





  App.detectGeoLocation = function(){
    var app = this;

    var _geolocationSuccess = function(position) {
        app.Location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        app.map.setCenter(app.Location);
        
    };

    var _handleNoGeolocation = function(err){
      $.ajax('//freegeoip.net/json/', {
            dataType: 'jsonp'
        }).always(_handleGeoipResponse); 
    };

    var _handleGeoipResponse = function(data){
      app.Location = new google.maps.LatLng(data.latitude, data.longitude);
      app.map.setCenter(app.Location);
    };

    // Try HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          _geolocationSuccess,
          _handleNoGeolocation);
    }

    return this;
  };

  App.createMap = function() {
    var mapOptions = {
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // Instantiate map
    this.map = new google.maps.Map($('#map_canvas')[0], mapOptions);

    return this;
  };

  App.init = function(){
    console.log('wakawaka');
    this.createMap().detectGeoLocation();
    google.maps.event.addListener(this.map, 'idle', this.stopListChanged);
  };

  App.LocationChanged = function(){
    $.ajax('/api/get_nearest_stops/', {
      type: 'GET',
      dataType: 'json',
      data: {coords: this.Location.toUrlValue(10)}
    }).always(this.handleStopsList);
  };

  
  
  // The root path to run the application through.
  App.root = '/';

  return App;
});
