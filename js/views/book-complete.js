define(function(require) {
  var $                   = require('jquery'),
  _                       = require('underscore'),
  Backbone                = require('backbone'),
  Ractive                 = require('ractive'),
  AppViewBasePageModal    = require('views/AppViewBasePageModal');

  var AppViewBookComplete = AppViewBasePageModal.extend({
  	
  	initialize: function(options) {
  		this.options = options || {};
  		if(this.options.parent != undefined) {
  			this.parent = this.options.parent;
  		}
  		AppViewBasePageModal.prototype.initialize.call(this);
  		this.opts = options || {};
  		this.render();
  	},

  	render: function() {
  		var self = this;
  		
  		self.getTpl('tpl/_book/book-complete.html', function(tpl) {
  			self.opts.template = tpl;
  			self.createModal();
  		});
  		
  		return this;
  	}
  });

  return AppViewBookComplete;
});