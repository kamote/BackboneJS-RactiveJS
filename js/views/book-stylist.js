define(function(require) {
  var $                   = require('jquery'),
  _                       = require('underscore'),
  Backbone                = require('backbone'),
  Ractive                 = require('ractive'),
  AppViewBasePageModal    = require('views/AppViewBasePageModal');
	
	return AppViewBasePageModal.extend({
		
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
			
			r.on('selectStylistClick', function(event){
				event.original.preventDefault();
				
				var stylist = event.node.getAttribute('data-stylist');
				stylist = JSON.parse(stylist);

				self.closeModal(function() {
					self.parent.fnStylistSelected(stylist);
					self.parent.show();
				});
				
			});
			
		},
		
		render: function() {
			var self = this;
			self.opts.data = {};
			
			self.getTpl('tpl/_book/book-stylist.html', function(tpl) {

				self.opts.template = tpl;	

				var service_id =  self.opts.service.id;

				self.parent.salonModel.findBranchStylistByServiceId(self.opts.salon.id, service_id, function(data) {
					self.opts.data.stylists = data.data;
					self.createModal();
				});

			});
			
			return this;
		}
	});

});