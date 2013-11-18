define(function(require) {
  
  var $         = require('jquery'),
  _             = require('underscore'),
  Backbone      = require('backbone'),
  BasePageView  = require('views/BasePageView'),
  tpl           = require('text!templates/layouts/default.html');

  return PageView = BasePageView.extend({
    layout: 'templates/layouts/default.html',
    
    initialize: function(options) {
      this.options = options || {};
      BasePageView.prototype.initialize.call(this);
    }
  });
});