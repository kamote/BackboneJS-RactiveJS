define(function(require) {
  var $                   = require('jquery'),
  _                       = require('underscore'),
  Backbone                = require('backbone'),
  Ractive                 = require('ractive'),
  AppViewBasePageModal    = require('views/AppViewBasePageModal');

  var AppViewBookTime = AppViewBasePageModal.extend({
  	
  	initialize: function(options) {
  		this.options = options || {};
  		if(this.options.parent != undefined) {
  			this.parent = this.options.parent;
  		}
  		AppViewBasePageModal.prototype.initialize.call(this);
  		this.opts = options || {};
  		_.bindAll(this, "rdone");
  		this.opts.complete = this.rdone;
  		this.render();
  	},
  	
  	rdone: function(r) {
  		var self = this;
  		
  		r.on('selectTimeClick', function(event){
  			event.original.preventDefault();
  			var time = event.node.getAttribute('data-time');
  			time = JSON.parse(time);
  			
  			self.closeModal(function() {
  				self.parent.fnTimeSelected(time);
  				self.parent.show();
  			});
  			
  		});
  		
  	},
  	
  	render: function() {
  		var self = this;
  		var rdata = {
  			loading: true
  		}

  		self.opts.data = rdata;

  		self.pubsub.once('api-load-booking-time-data-done', function(data){
  			var obj = data;
  			self.rhtmlLive(function(){
  				for(var key in obj) {
  					self.rhtml.set(key, obj[key]);
  				}
  			});
  		});

  		if(self.opts.stylistId) {
  			var params = {
  				service_id: self.opts.service.id,
  				date: self.opts.date
  			}
  			
  			self.parent.stylistModel.findTimeSlot(self.opts.stylistId, params, function(reply) {
  				rdata.slot = reply.data;
  				rdata.loading = false;
  				self.pubsub.trigger('api-load-booking-time-data-done', rdata);
  			});
  		}

  		self.getTpl('tpl/_book/book-time.html', function(tpl) {
  			self.opts.template = tpl;
  			self.createModal();
  		});
  		
  		return this;
  	}
  });

  return AppViewBookTime;
});