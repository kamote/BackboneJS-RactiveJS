// This is our build configuration - the file we point the RequireJS
// optimiser at. As it stands, it will produce a file called main-built.js
// - to use it you would have to edit the index.html file so that
// data-main='main-built.js' instead of data-main='js/main.js'.
//
// For more sophisticated build process I recommend you investigate
// http://gruntjs.com/ and the RequireJS Grunt plugin.

({
  baseUrl: 'js/',
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },
  },
  paths: {
    jquery: '../bower_components/jquery/jquery',
    underscore: '../bower_components/underscore/underscore',
    backbone: '../bower_components/backbone/backbone',
    text: '../bower_components/requirejs-text/text',
    ractive: 'libs/Ractive',
    store: '../bower_components/store.js/store'
  },
  name: 'main',
  out: 'js/main-built.js'
})