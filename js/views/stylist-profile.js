window.AppViewStylistServiceDetail = AppViewBasePageModal.extend({
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
					stylist: self.kaller.rhtml.data.stylist,
					service: self.opts.service,
					isSalon: false
				}

				var bookService = new AppViewBook(opt);
			});
			
		});
	},
	
	render: function() {
		var self = this;
		self.opts.data = {};
		self.opts.data.service = self.opts.service;

		self.getTpl('tpl/_stylist/service-details.html', function(tpl) {
			self.opts.template = tpl;
			self.createModal();
		});
		
		return this;
	}
});

window.AppViewStylistSub = AppViewBase.extend({
	id:"stylist-partial",
	initialize: function(options) {
		this.options = options || {};
		if(this.options.parent != undefined) {
			this.parent = this.options.parent;
			console.log('my parent', this.parent);
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
					kaller: self.parent //FIXME it should be the parent but clonflict wiht global parent n modal
				}

				self.serviceDetail = new AppViewStylistServiceDetail(opt);
				self.serviceDetail.show();
			});
		} else if(self.opts.page === 'contact') {
			self.map_controls = $('#map_controls');
			self.map_canvas = $('#map_canvas');
			self._initialize_map(self.opts.stylist);
		}

	},

	render: function() {
		var self = this;
		var stylistId = self.opts.parent.opts.stylistId;
		
		var roptions = {
			complete: this.rdone,
			data: self.opts.data || {}
		}

		roptions.data.stylist = self.opts.stylist;

		self.getTpl('tpl/_stylist/'+ self.opts.page +'.html', function(tpl){
			if(self.opts.page === 'services') {
				self.opts.parent.model.findServices(stylistId, function(reply) {
					if(reply.status === 'success') {
						var d = {data: reply.data};
						roptions.data = _.extend(roptions.data, d);
						self.setRHTML(tpl, roptions);
					}
				});
			} else if(self.opts.page === 'opening-hours') {
				self.opts.parent.model.findOpeningHours(stylistId, function(reply) {
					if(reply.status === 'success') {
						
						//filter
						roptions.data.parseDate = function(item, format) {
							return moment(item).format(format || 'dddd, MMMM Do YYYY');
						}

						roptions.data.parseTime = function(item, format) {
							return moment(item, 'HH:mm:SS').format(format || 'dddd, MMMM Do YYYY');
						}

						var d = {data: reply.data};
						roptions.data = _.extend(roptions.data, d);
						self.setRHTML(tpl, roptions);

					}
				});
			} else if(self.opts.page === 'contact') {
				self.setRHTML(tpl, roptions);
			}	else {
				console.log('roptionsroptionsroptionsroptions', roptions);
				self.setRHTML(tpl, roptions);
			}
		});
		return this;
	},

	_initialize_map: function(stylist) {
		var self = this;
		var myLatlng = new google.maps.LatLng(stylist.salon_branch_lat,stylist.salon_branch_lng);
		var mapOptions = {
			zoom: 3,
			center: myLatlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}

		self.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

		var contentString = '<div id="content">'+
				'<div id="siteNotice">'+
				'</div>'+
				'<p>Address: '+ stylist.salon_branch_location +'</p>'+
				'<p>Telephone: '+ stylist.salon_branch_phone+'</p>'+
				'</div>'+
				'</div>';

		var infowindow = new google.maps.InfoWindow({
				content: contentString,
				maxWidth: 200
		});

		var marker = new google.maps.Marker({
				position: myLatlng,
				map: self.map
		});
		
		google.maps.event.addListener(marker, 'click', function() {
			infowindow.open(self.map,marker);
		});

		infowindow.open(self.map,marker);

	}
});

window.AppViewStylistProfile = AppViewPage.extend({
	id:"stylist-profile",
	initialize: function(options) {
		this.opts = options || {};
		AppViewPage.prototype.initialize.call(this);
		_.bindAll(this, "rdone");
		this.model = new AppModelStylist();
		this.rsetOptions({ complete: this.rdone });
	},
	
	rdone: function(r) {
		var self = this;
		
		//render sub pages
		self.renderSub(self.opts.page);

		r.on('bookClick', function(event){
			event.original.preventDefault();
			
			var opt = {
				stylist: self.rhtml.data.stylist,
				isSalon: false
			}

			var book = new AppViewBook(opt);
			console.log('book', book, opt);
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
	},
	
	renderSub: function(fragment) {
		var self = this;
		self.subs.salonSubs = new AppViewStylistSub({
			el: '#stylist-partial-content', 
			page: fragment , 
			parent: self,
			stylist: self.rData.data.stylist
		});
		self.subs.salonSubs.render();
	},
	
	render: function() {
		var self = this;
		console.log('go home old page', self.old);
		self.addPartials('content', 'tpl/stylist-profile.html', function(tpl){
			self.model.findById(self.opts.stylistId, function(data) {
				if(data.status === 'success') {
					var stylist = data.data;
					self.rsetData({
						stylist : stylist,
						//overrideHeader: true,
						header: {
							backBtn: app.getPreviousPage(),
							forwardBtn: 'stylist/'+ stylist.id + '/map',
							forwardBtnIcon: 'map-marker',
							title: stylist.first_name + ' ' + stylist.last_name
						}
					});
					self.createPage();
				}
			});
		});
		return this;
	}
});