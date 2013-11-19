define(function(require) {
  var $                   = require('jquery'),
  _                       = require('underscore'),
  Backbone                = require('backbone'),
  Ractive                 = require('ractive'),
  AppViewBasePageModal    = require('views/AppViewBasePageModal');

  var AppViewBookDate = AppViewBasePageModal.extend({
  	
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
  		var d = new Date(self.opts.date);

  		/*
  		$('#schedule_date').datepicker("option", "beforeShowDay", function(date) {
  			return self.removeDayOff(date, self.employee.unvailable_days, self.employee.stylist_holidays);
  		});
  		removeDayOff: function(date, days, holidays) {
  			var templates = days;

  			if(holidays) {
  				holidays = holidays.split(",");
  			} else {
  				holidays = [];
  			}

  			if($.inArray(date.getDay(), templates) == -1) {
  				var m = moment(date);
  				if($.inArray(m.format('YYYY-MM-DD'), holidays) == -1) {
  					return [true, ""];
  				} else {
  					return [false, "ui-state-block-time", "Unavailable Dayoff"];
  				}
  			} else {
  				return [false, "ui-state-block-time", "Unavailable"];
  			}
      }
      */
  		$( "#datepicker" ).datepicker({
  			minDate: new Date(),
  			defaultDate: d,
  			onSelect: function(dateText, instance) {
  				//http://stackoverflow.com/questions/2193169/jquery-ui-datepicker-ie-reload-or-jumps-to-the-top-of-the-page
  				$(".ui-datepicker a").removeAttr("href");
  				self.parent.fnDateSelected($("#" + instance.id).datepicker('getDate'));
  				self.closeModal(function() {
  					self.parent.show();
  				});
  				return false;
  			},
  			beforeShowDay: function(date) {
  				var templates = self.opts.data.templates;
  				var holidays = self.opts.data.holidays;

  				if(_.contains(templates, moment(date).day())) {
  					var m = moment(date)
  					//console.log(_.contains(holidays, m.format('YYYY-MM-DD')), 'wow', holidays, m.format('YYYY-MM-DD'));
  					if(_.contains(holidays, m.format('YYYY-MM-DD'))) {
  						return [false, "ui-state-block-time", "Unavailable Dayoff"];
  					}

  					return [true, ""];
  				}

  				return [false, "ui-state-block-time", "Unavailable"];
  			},
  			showButtonPanel: true,
        showOtherMonths: true,
        selectOtherMonths: true,
  		});
  	},
  	
  	render: function() {
  		var self = this;
  		
  		self.getTpl('tpl/_book/book-date.html', function(tpl) {
  			self.opts.template = tpl;
  			self.opts.data = {};
  			if(self.opts.stylistId) {
  				self.parent.stylistModel.findHoliDaysOffs(self.opts.stylistId, {}, function(data) {
  					if(data.status == 'success') {
  						self.opts.data.templates = data.data.templates;
  						self.opts.data.holidays = data.data.holidays;
  					}
  					//
  					console.log(data);
  					self.createModal();
  				});
  				
  			} else {
  				self.createModal();
  			}
  		});
  		
  		return this;
  	}
  });
  
  return AppViewBookDate;
});