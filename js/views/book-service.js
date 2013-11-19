define(function(require) {
  var $                   = require('jquery'),
  _                       = require('underscore'),
  Backbone                = require('backbone'),
  Ractive                 = require('ractive'),
  AppViewBasePageModal    = require('views/AppViewBasePageModal');

var AppViewBookService = AppViewBasePageModal.extend({
  
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
    r.on('selectServiceClick', function(event){
      event.original.preventDefault();
      var service = event.node.getAttribute('data-service');
      service = JSON.parse(service);
      
      self.closeModal(function() {
        self.opts.parent.fnServiceSelected(service);
        self.opts.parent.show();
      });
      
    });
  },
  
  render: function() {
    var self = this;
    self.opts.data = {};

    self.getTpl('tpl/_book/book-service.html', function(tpl) {
      self.opts.template = tpl;

      if( ! self.opts.services || self.opts.services.length  <= 0 ) {
        if(self.opts.salon) {
          self.opts.parent.salonModel.findServices(self.opts.salon.id, function(data) {
            if(data.status === 'success') {
              self.opts.data.services = data.data;
              self.createModal();
            }
          });
        } else {
          //we have stylist but we dont have services
          self.opts.parent.stylistModel.findServices(self.opts.stylist.id, function(data) {
            if(data.status === 'success') {
              self.opts.data.services = data.data;
              self.createModal();
            }
          });
        }
      } else {
        //we have services
        self.opts.data.services = self.opts.services;
        self.createModal();
      }

      
    });
    
    return this;
  }
});

return AppViewBookService;

});