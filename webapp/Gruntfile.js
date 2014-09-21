/* global module:true 
 * 
 * Gruntfile.js
 * npm install -g grunt-cli
 * npm install grunt-contrib-less grunt-contrib-watch grunt-contrib-connect --save-dev
 */
module.exports = function(grunt) {
  'use strict';
  // Default port
  var LIVERELOAD_PORT = 35729;

  grunt.initConfig({
    // connect: {
    //   server: {
    //     options: {
    //       base: '.',
    //       // This will inject live reload script into the html
    //       livereload: LIVERELOAD_PORT
    //     }
    //   }
    // },
  
    watch: {
      options: {
        livereload: LIVERELOAD_PORT
      },
      files: ["./app/**/*","./index.html"],
      tasks: []
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  // grunt.loadNpmTasks('grunt-contrib-connect');

  // Run grunt server to get going
  grunt.registerTask('server', [
    // 'connect',
    'watch'
  ]);
};