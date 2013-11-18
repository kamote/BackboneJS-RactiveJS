// Filename: views/project/list
define([
  'jquery',
  'underscore',
  'backbone',
  'ractive',
  // Using the Require.js text! plugin, we are loaded raw text
  // which will be used as our views primary template
  'text!templates/layouts/default.html'
], function($, _, Backbone, Ractive, pageTemplate){
  var RactiveView = new Ractive({
    el: '#container',
    template: pageTemplate,
    partials: {},
    setPartial: function(name, template) {
      this.partials.name = template;
    }
  });

  return RactiveView;
});