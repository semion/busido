require.config({
  paths: {
  	"async": "../bower_components/requirejs-plugins/src/async",
    "underscore": "../bower_components/lodash/dist/lodash.underscore",
    "jquery": "../bower_components/jquery/dist/jquery",
    "backbone": "../bower_components/backbone/backbone",
    "backbone.googlemaps": "../bower_components/backbone.googlemaps/lib/backbone.googlemaps"
  },

  deps: ["main"]
});