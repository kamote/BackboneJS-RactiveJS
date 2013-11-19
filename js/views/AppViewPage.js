define(function(require) {
  
  var $           = require('jquery'),
  _               = require('underscore'),
  Backbone        = require('backbone'),
  AppViewBasePage = require('views/AppViewBasePage'),
  tpl             = require('text!tpl/layouts/page.html');

  return AppViewPage = AppViewBasePage.extend({
    layout: 'tpl/layouts/page.html',
    
    initialize: function(options) {
      this.options = options || {};
      AppViewBasePage.prototype.initialize.call(this);
    }
  });
});