window.AppViewSalonServiceDetail = AppViewBasePageModal.extend({
	initialize: function(options) {
		this.options = options || {};
		if(this.options.kaller != undefined) {
			this.kaller = this.options.kaller;
		}
		AppViewBasePageModal.prototype.initialize.call(this);
		this.opts = options || {};
		_.bindAll(this, "rdone");
		this.opts.complete = this.rdone;
		this.render();
	},
	
	rdone: function(r) {
		var self = this;

		r.on('bookServiceClick', function(event){
			event.original.preventDefault();
			
			self.closeModal(function() {
				var opt = {
					salon: self.kaller.rhtml.data.salon,
					service: self.opts.service,
					isSalon: true
				}

				var bookService = new AppViewBook(opt);
			});

		});
	},
	
	render: function() {
		var self = this;
		self.opts.data = {};
		self.opts.data.service = self.opts.service;

		self.getTpl('tpl/_salon/service-details.html', function(tpl) {
			self.opts.template = tpl;
			self.createModal();
		});
		
		return this;
	}
});

window.AppViewSalonSub = AppViewBase.extend({
	id:"salon-hours",
	initialize: function(options) {
		this.options = options || {};
		if(this.options.parent != undefined) {
			this.parent = this.options.parent;
		}

		this.opts = options || {};
		AppViewBase.prototype.initialize.call(this);
		_.bindAll(this, "rdone");
	},

	rdone: function(r) {
		var self = this;

		if(self.opts.page === 'services') {
			r.on('serviceClick', function(event){
				event.original.preventDefault();
				var service = event.node.getAttribute('data-service');
				service = JSON.parse(service);

				var opt = {
					service: service,
					kaller: self.parent,
				}

				self.serviceDetail = new AppViewSalonServiceDetail(opt);
				self.serviceDetail.show();
			});
		}
		
	},
	
	render: function() {
		var self = this;
		var salonId = self.opts.parent.opts.salonId;
		
		var roptions = {
			complete: this.rdone,
			data: {
				loading: true,
				salon: self.opts.parent.rhtml.data.salon
			}
		}

		self.pubsub.once('api-load-salon-data-done', function(data){
			var obj = data;
			self.rhtmlLive(function(){
				for(var key in obj) {
					self.rhtml.set(key, obj[key]);
					console.log('update the rhtml', key, obj[key]);
				}
			});
		});

		
		self.getTpl('tpl/_salon/'+ self.opts.page +'.html', function(tpl){
			self.setRHTML(tpl, roptions);
		});

		var rdata = {
			loading: false
		}

		if(self.opts.page === 'services') {
			self.opts.parent.model.findServices(salonId, function(reply) {
				if(reply.status === 'success') {
					rdata.data = reply.data;
				}

				self.pubsub.trigger('api-load-salon-data-done', rdata);
			});
		} else if(self.opts.page === 'team') {
			self.opts.parent.model.findTeams(salonId, function(reply) {
				if(reply.status === 'success') {
					rdata.data = reply.data;
				}

				self.pubsub.trigger('api-load-salon-data-done', rdata);
			});
		} else if(self.opts.page === 'opening-hours') {
			self.opts.parent.model.findOpeningHours(salonId, function(reply) {

				rdata.parseDate = function(item, format) {
					return moment(item).format(format || 'dddd, MMMM Do YYYY');
				}

				rdata.parseTime = function(item, format) {
					return moment(item, 'HH:mm:SS').format(format || 'dddd, MMMM Do YYYY');
				}

				if(reply.status === 'success') {
					rdata.data = reply.data;
				}

				self.pubsub.trigger('api-load-salon-data-done', rdata);
			});
		} else if(self.opts.page === 'information') {
			self.opts.parent.model.findBranches(salonId, function(reply) {
				if(reply.status === 'success') {
					rdata.branches = reply.data;
				}

				self.pubsub.trigger('api-load-salon-data-done', rdata);
			});
		} 

		return this;
	}
});

window.AppViewSalon = AppViewPage.extend({
	id:"salon",
	initialize: function(options) {
		this.opts = options || {};
		AppViewPage.prototype.initialize.call(this);
		_.bindAll(this, "rdone");
		this.model = new AppModelSalon();
		this.rsetOptions({ complete: this.rdone });
	},
	
	rdone: function(r) {
		var self = this;
		r.on('bookClick', function(event){
			var opt = {
				salon: self.rhtml.data.salon,
				isSalon: true
			}

			self.book = new AppViewBook(opt);
			console.log('book', self.book, opt);
		});
		
		r.on('tabSelect', function(event){
			event.original.preventDefault();
			var page = event.node.getAttribute('data-page');
			
			$elem = $(event.node);
			$elem.parent().find('a.active').removeClass('active');
			$elem.addClass('active');
			
			app.navigate(event.node.hash, {trigger: false, replace: true}); //FIXME:: it reloads even if trigger false
			self.renderSub(page);
		});

		//set active links
		$('a[data-page="'+self.opts.page+'"]').addClass('active');
		self.renderSub(self.opts.page);
	},
	
	renderSub: function(fragment) {
		var self = this;
		self.subs.salonSubs = new AppViewSalonSub({el: '#salon-parial-content', page: fragment , parent: self});
		self.subs.salonSubs.render();
	},
	
	render: function() {
		var self = this;
		self.addPartials('content', 'tpl/salon.html', function(tpl){
			self.model.findById(self.opts.salonId, function(reply) {
				if(reply.status === 'success') {
					var salon = reply.data;
					self.rsetData({
						salon : salon,
						//overrideHeader: true,
						header: {
							backBtn: app.getPreviousPage(),
							forwardBtn: 'salon/'+ salon.id + '/map',
							forwardBtnIcon: 'map-marker',
							title: salon.name
						}
					});
					self.createPage();
				}
			});
		});
		return this;
	}
});