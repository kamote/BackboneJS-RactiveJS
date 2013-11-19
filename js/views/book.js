define(function(require) {
  var $                   = require('jquery'),
  _                       = require('underscore'),
  Backbone                = require('backbone'),
  Ractive                 = require('ractive'),
  AppViewBasePageModal    = require('views/AppViewBasePageModal');
  AppModelSalon           = require('models/salon'),
  AppModelStylist         = require('models/stylist'),
  AppModelSchedule        = require('models/schedule');
  moment                  = require('moment');

  var AppViewBook = AppViewBasePageModal.extend({
  
  initialize: function(options) {
    this.options = options || {};
    if(this.options.parent != undefined) {
      this.parent = this.options.parent;
    }
    if(app.models.auth.isLoggedIn() !== true) {
      //app.pages.modalLogin.show(); return;
    }
    
    AppViewBasePageModal.prototype.initialize.call(this);
    var opt = options || {};

    this.userData = app.models['auth'].userData || null;
    this.opts = _.extend({}, opt);
    this.opts.data = {};
    this.opts.data.userData = this.userData;
    this.opts.data.complete = false;
    
    //models
    this.stylistModel = new AppModelStylist();
    this.scheduleModel = new AppModelSchedule();
    this.salonModel = new AppModelSalon();

    _.bindAll(this, "rdone");
    this.opts.complete = this.rdone;
    this.render();
  },
  
  rdone: function(r) {
    var self = this;
    
    if(self.opts.service) {
      self.fnOverrideService(self.opts.service);
    }

    r.on('editServiceClick', function(event) {
      event.original.preventDefault();

      if(self.opts.isSalon || self.opts.salon) {
        var opt = {
          parent: self,
          salon: self.opts.salon,
          services: [] //preload is salon service exist
        }

      } else {
        var opt = {
          parent: self,
          stylist: self.rhtml.data.stylist,
          services: self.rhtml.data.stylist.services
        }
      }

      self.bookService = new AppViewBookService(opt);
      self.bookService.show();
      self.hide();
    });
    
    r.on('editTimeClick', function(event) {
      event.original.preventDefault();
      
      //access rthml
      var opt = {
          parent: self,
          service: self.rhtml.data.service, 
          stylistId:  self.rhtml.data.stylist.id,
          date: self.rhtml.data.date
      }
      
      self.bookTime = new AppViewBookTime(opt);
      self.bookTime.show();
      self.hide();
    });

    r.on('editDateClick', function(event) {
      event.original.preventDefault();
      
      //access rthml
      var opt = { 
        parent: self,
        date: self.rhtml.data.date,
        stylistId:  self.rhtml.data.stylist.id,
      }
      
      self.bookDate = new AppViewBookDate(opt);
      self.bookDate.show();
      self.hide();
    });

    r.on('editStylistClick', function(event) {
      event.original.preventDefault();
      
      //access rthml
      var opt = { 
        parent: self,
        service: self.rhtml.data.service,
        salon: self.opts.salon
      }
      
      self.bookStylist= new AppViewBookStylist(opt);
      self.bookStylist.show();
      self.hide();
    });

    r.observe('booking_mobile', function(newValue, oldvalue) {
      self.fnValidateBooking();
    });

    //book appoitnment
    r.on('bookClick', function(event) {
      event.original.preventDefault();
      var ractive = self.rhtml;

      if( ! self.rhtml.data.complete) {
        return self.fnShowErrors();
      }

      var confirmationOptions = {
        rdata: ractive.data,
        parent: self
      }

      var bookConfirmation = new AppViewBookConfirmation(confirmationOptions);
      bookConfirmation.show();

      self.hide();
    });
  },
  
  fnBookSchedule: function(postData, cb) {
    var self = this;

    self.scheduleModel.book(postData, function(data) {
      if(data.status === 'success') {
        //update mobile
        app.models['auth'].updateMobile(postData.mobile);

        cb(true)
      } else {

        var AHOptions = {
          content: data.error.message,
          status: 'danger',
          dismissable: true,
          sticky: false,
        }

        var alertHelper = new AppViewHelperAlert(AHOptions);
        
        return cb(false); 
      }
    })
  },

  fnOverrideService: function(service) {
    var self = this;

    if(service.salon_service_id != undefined) {
      this.rhtml.set('service.id',  service.salon_service_id);
    }
  },

  fnServiceSelected: function(service) {
    var self = this;
    //FIXME:: proper plac of varviable handler
    var _service = service;
    if(service.salon_service_id != undefined) {
      _service.id = service.salon_service_id;
    }

    this.rhtml.set('service', _service);

    if(self.rhtml.data.isSalon) {
      this.rhtml.set('stylist', null);  
    }
    
    //this.rhtml.set('date', null);
    this.rhtml.set('time', null);
    
    self.fnValidateBooking();
  },

  fnStylistSelected: function(stylist) {
    var self = this;
    //FIXME:: proper plac of varviable handler
    this.rhtml.set('stylist', stylist);
    this.rhtml.set('service.price', stylist.service_price);

    self.fnValidateBooking();
  },
  
  fnDateSelected: function(date) {
    this.rhtml.set('date', moment(date).format("YYYY-MM-DD"));
    this.rhtml.set('time', null);

    this.rhtml.set('complete', false);
    //self.fnValidateBooking();
  },

  fnTimeSelected: function(time) {
    var self = this;
    //FIXME:: proper plac of varviable handler
    var time = { 
      start: time[2][0], 
      end : time[2][1]
    }

    this.rhtml.set('time', time);

    self.fnValidateBooking();
  },

  fnValidateBooking: function() {
    var self = this;
    if(self.rhtml.data.service 
      && self.rhtml.data.date
      && self.rhtml.data.stylist
      && self.rhtml.data.time
      && self.rhtml.data.booking_mobile) {

      this.rhtml.set('complete', true);
    } else {
      this.rhtml.set('complete', false);
    }
    
  },

  fnShowErrors: function() {

  },
  
  render: function() {
    var self = this;
    
    self.getTpl('tpl/book.html', function(tpl) {
      self.opts.template = tpl;
      self.opts.data.isSalon = self.opts.isSalon || false;
      self.opts.data.service = self.opts.service || null;
      self.opts.data.time = null;
      self.opts.data.notes = null;
      self.opts.data.date = moment().format("YYYY-MM-DD");
      self.opts.data.booking_mobile = self.userData.mobile;
      self.opts.data.dateFormat = function(item, format) {
        return moment(item).format(format || 'dddd, MMMM Do YYYY');
      }

      if(self.opts.stylist) {
        self.opts.data.stylist = self.opts.stylist;
      }

      console.log('ooppppsss', self.opts);

      if(self.opts.stylistId) {
        self.stylistModel.findById(self.opts.stylistId, function(data) {
          if(data.status === 'success') {
            self.opts.data.stylist = data.data;
          }
          self.createModal();
        });
      } else if(self.opts.isSalon && self.opts.salonId && ! self.opts.salon) {
        self.salonModel.findById(self.opts.salonId, function(reply) {
          if(reply.status === 'success') {
            self.opts.salon = reply.data;
          }
          self.createModal();
        });
        
      } else {
        self.createModal();
      }
      
    });
    
    return this;
  }
  });
  
  return AppViewBook;
});