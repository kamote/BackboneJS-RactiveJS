window.AppViewReservationDetails = AppViewBasePageModal.extend({
	
	initialize: function(options) {
		this.options = options || {};
		if(this.options.parent != undefined) {
			this.parent = this.options.parent;
		}

		this.model = new AppModelSchedule();

		this.opts = {};
		AppViewBasePageModal.prototype.initialize.call(this);
		_.bindAll(this, "rdone");
		this.render();
	},
	
	rdone: function(r) {
		var self = this;

		r.on('cancelAppointment', function(event) {
			event.original.preventDefault();

			var r = confirm('Tap on "OK" to cancel the appointment.');
			
			if (r == true) {
				var scheduleId = event.node.getAttribute('data-schedule-id');

				self.model.cancelAppointment({schedule_id: scheduleId}, function(reply) {
					if(reply.status === 'success') {
						self.options.kaller.rhtml.set('appointments.'+ self.options.indexKey + '.status', 0);
						self.closeModal();
					} else {
						//show some alerts here
						self.closeModal();
					}
				});
			}
			
		});

		r.on('closeModal', function() {
			app.navigate('#appointments', {trigger: false, replace: true});
			self.closeModal();
		});
	},

	render: function() {
		var self = this;
		self.opts.data = {};
		self.opts.data.showCancelAppointment = self.options.showCancelAppointment;
		self.opts.data.appointmentId = self.options.appointmentId;
		self.opts.data.appointment = self.options.appointment;
		self.opts.data.dateFormat = function(item, format) {
			return moment(item).tz(window.timezone).format(format || 'dddd, MMMM Do YYYY');
		}

		self.opts.data.isPassIn24HourRule = function(item) {
			var _m = moment(item).tz(window.timezone);
			return (_m.diff(moment().tz(window.timezone), 'hours') >  24);
		}

		self.opts.data.userData = app.models['auth'].userData || null;
		self.opts.complete = this.rdone;

		//24 hour cancel operation
		var _m = self.opts.data.appointment.start_date;

		self.getTpl('tpl/_reservation/reservation-details.html', function(tpl) {
			self.opts.template = tpl;
			self.createModal();
		});
		
		return this;
	},

});

window.AppViewReservationSubpage = AppViewBase.extend({
	//id:"reservation-sub-page",
	initialize: function(options) {
		this.opts = options || {};

		if(this.opts.parent != undefined) {
			this.parent = this.opts.parent;
		}

		AppViewBase.prototype.initialize.call(this);
		_.bindAll(this, "rdone");
	},

	rdone: function(r) {
		var self = this;

		r.on('viewAppointmentClick', function(event){
			event.original.preventDefault();
			var appointmentId = event.node.getAttribute('data-id');
			var appointment = event.node.getAttribute('data-appointment');
			
			var indexKey = event.node.getAttribute('data-index-key');

			var opt = {
				appointmentId: appointmentId,
				appointment: JSON.parse(appointment),
				parent: self.parent,
				kaller: self,
				indexKey: indexKey
			}

			if(self.opts.page === 'upcoming') {
				opt.showCancelAppointment = true;
			} else {
				opt.showCancelAppointment = false;
			}

			/*
			var appointmentUri = '#appointments/'+appointmentId;			
			app.navigate(appointmentUri, {trigger: false, replace: true});
			*/

			self.reservationdDetails = new AppViewReservationDetails(opt);
			self.reservationdDetails.show();
			//self.parent.hide();
		});

	},
	
	render: function() {
		var self = this;
		var roptions = {
			complete: this.rdone,
			data: self.opts.data || {}
		}

		roptions.data.getStatus = function(item) {
			if(item == 0 ) {
				return 'CANCELED';
			} else {
				return 'NEW';
			}
		}

		self.getTpl('tpl/_reservation/'+ self.opts.page +'.html', function(tpl){
			if(self.opts.page === 'upcoming') {
				self.opts.parent.model.myappointments({ scope: 'upcoming'}, function(reply) {
					
					if(reply.status === 'success') {
						var d = { appointments: reply.data};
						roptions.data = _.extend(roptions.data, d);
						self.setRHTML(tpl, roptions);
					}
				});
			} else if(self.opts.page === 'old') {
				self.opts.parent.model.myappointments({ scope: 'old'}, function(reply) {
					if(reply.status === 'success') {
						var d = { appointments: reply.data};
						roptions.data = _.extend(roptions.data, d);
						self.setRHTML(tpl, roptions);
					}
				});
			}
		});

		return this;
	}
});

window.AppViewAppointment = AppViewPage.extend({
	id:"reservation",
	initialize: function(options) {
		this.opts = options || {};
		AppViewPage.prototype.initialize.call(this);
		_.bindAll(this, "rdone");
		this.rsetOptions({ complete: this.rdone });

		this.model = new AppModelSchedule();
		this.rsetData({
			activeNav: 'appointments',
			header: {
				backBtn: 'home', 
				title: "My Appoinment"
			} 
		});
	},
	
	rdone: function(r) {
		var self = this;
		//clicker
		
		r.on('tabSelect', function(event){
			event.original.preventDefault();
			var page = event.node.getAttribute('data-page');
			
			$elem = $(event.node);
			$elem.parent().find('a.active').removeClass('active');
			$elem.addClass('active');
			
			app.navigate(event.node.hash, {trigger: false, replace: true}); //FIXME:: it reloads even if trigger false
			self.renderSub(page);
		});

		$('a[data-page="'+self.opts.page+'"]').addClass('active');
		self.renderSub(self.opts.page || 'upcoming');
	},

	renderSub: function(fragment) {
		var self = this;
		console.log($("#reservation-partial-content").length, 'jquery');
		self.subs.reservationSubs = new AppViewReservationSubpage({el: '#reservation-partial-content', page: fragment , parent: self});
		self.subs.reservationSubs.render();
	},

	render: function() {
		var self = this;
		self.addPartials('content', 'tpl/appointment.html', function(tpl){
			//self.model.myappointments({}, function(data){
				self.rsetData({
					//appointments: data.data,
					userData: app.models['auth'].userData || null
				});
				
				self.createPage();
			//});
		});
		return this;
	}
});