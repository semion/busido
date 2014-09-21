define(["backbone"], function(Backbone) {
  "use strict";

  // Defining the application router.
  return Backbone.Router.extend({
    routes: {
      "/": "index"
    },

    index: function() {
      console.log("Welcome to your / route.");
    }
  });

});
