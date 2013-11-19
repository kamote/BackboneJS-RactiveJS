window.AppViewSalonMap = AppViewPage.extend({
	id:"salon-map",
	initialize: function(options) {
		this.opts = options || {};
		AppViewPage.prototype.initialize.call(this);
		_.bindAll(this, "rdone");
		_.bindAll(this, "_initialize_map");
		this.model = new AppModelSalon();
		this.rsetOptions({ complete: this.rdone });
	},
	
	rdone: function(r) {
		var self = this;
		self._initialize_map();
	},

	_initialize_map: function() {
		var self = this;

		var salon = self.rhtml.data.salon;
		var salonLatLng = new google.maps.LatLng(salon.lat, salon.lng);
		
		var mapOptions = {
			zoom: 15,
			center: salonLatLng,
			disableDefaultUI: true,
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL,
				position: google.maps.ControlPosition.TOP_RIGHT
			},
			streetViewControl: true,
			streetViewControlOptions: {
				position: google.maps.ControlPosition.TOP_LEFT
			},
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		

		var map = new google.maps.Map(document.getElementById('map_salon_canvas'), mapOptions);

		var gMarker = new google.maps.Marker({
			position: salonLatLng,
			map: map,
			title: salon.name,
		});

		var infowindow = new google.maps.InfoWindow({
			content: 'Loading...',
			maxWidth: 300,
		});

		self.getTpl('tpl/_salon/map-detail.html', function(tpl) {
			var ractiveMap = new Ractive({
				template: tpl,
				data: {
					salon: salon
				}
			});

			infowindow.setContent(ractiveMap.renderHTML());

			self.$el.on('click', '.btn-bookViaSalonMap', function(e) {
				e.preventDefault();
				$this = $(this);
				
				if(app.models.auth.isLoggedIn() !== true) {
					app.pages.modalLogin.parent = self;
					app.pages.modalLogin.show(); return;
				} else {
					var salonId = $this.data('salon_branch_id');
					var bookSalonBySalonMap = new AppViewBook({isSalon: true, salonId: salonId});
				}
				
			});
		});

		google.maps.event.addListener(gMarker, 'click', function() {
			infowindow.open(map, gMarker);
			map.setZoom(15);
			map.setCenter(gMarker.getPosition());
		});

		google.maps.event.addDomListener(window, "resize", function() {
			var center = map.getCenter();
			google.maps.event.trigger(map, "resize");
			map.setCenter(center); 
		});

		infowindow.open(map, gMarker);
	},
	
	render: function() {
		var self = this;
		self.addPartials('content', 'tpl/_salon/map.html', function(tpl){
			self.model.findById(self.opts.salonId, function(reply) {
				if(reply.status === 'success') {
					var salon = reply.data;
					self.rsetData({
						salon : salon,
						showFooter: false,
						//overrideHeader: true,
						header: {
							backBtn: app.getPreviousPage() || 'home',
							title: 'Map'
						}
					});
					self.createPage();
				}
			});
		});
		return this;
	}
});