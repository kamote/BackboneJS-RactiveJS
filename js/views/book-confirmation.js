define(function(require) {
  var $                   = require('jquery'),
  _                       = require('underscore'),
  Backbone                = require('backbone'),
  Ractive                 = require('ractive'),
  AppViewBasePageModal    = require('views/AppViewBasePageModal');

  var AppViewBookConfirmation = AppViewBasePageModal.extend({
  	
  	initialize: function(options) {
  		this.options = options || {};
  		if(this.options.parent != undefined) {
  			this.parent = this.options.parent;
  		}
  		AppViewBasePageModal.prototype.initialize.call(this);
  		_.bindAll(this, "rdone");
  		
  		this.render();
  	},

  	rdone: function(r) {
  		var self = this;
  		
  		r.on('confirmClick', function(event) {
  			event.original.preventDefault();
  			var ractive = self.rhtml;
  			if( event.node.getAttribute('data-status') == 'working' ) {
  				return false;
  			} else {
  				event.node.setAttribute('data-status', 'working');	
  			}

  			var postData = {
  				stylist_id: ractive.data.stylist.id,
  				stylist_service_id: ractive.data.service.id,
  				date: ractive.data.date,
  				time: ractive.data.time.start,
  				notes: ractive.data.notes,
  				mobile: ractive.data.booking_mobile,
  			}

  			self.parent.fnBookSchedule(postData, function(oks) {
  				event.node.setAttribute('data-status', 'idle');
  				if(oks) {
  					self.parent.cleanup(true);
  					self.closeModal(function(){
  						var bookCemplete = new AppViewBookComplete();
  						bookCemplete.show();
  					});
  				}
  			});
  		});
  		
  	},

  	render: function() {
  		var self = this;
  		self.opts = {};
  		self.opts.complete = self.rdone;

  		self.getTpl('tpl/_book/book-confirmation.html', function(tpl) {
  			self.opts.template = tpl;
  			self.opts.data = self.options.rdata;
  			self.createModal();
  		});
  		
  		return this;
  	}
  });

  return AppViewBookConfirmation;
});