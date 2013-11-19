window.AppViewStylistMap = AppViewPage.extend({
	id:"stylist-map",
	initialize: function(options) {
		this.opts = options || {};
		AppViewPage.prototype.initialize.call(this);
		_.bindAll(this, "rdone");
		_.bindAll(this, "_initialize_map");
		this.model = new AppModelStylist();
		this.rsetOptions({ complete: this.rdone });
	},
	
	rdone: function(r) {
		var self = this;
		self._initialize_map();
	},

	_initialize_map: function() {
		var self = this;

		var stylist = self.rhtml.data.stylist;
		var stylistSalonLatLng = new google.maps.LatLng(stylist.salon_branch_lat, stylist.salon_branch_lng);
		
		var mapOptions = {
			zoom: 15,
			center: stylistSalonLatLng,
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
		

		var map = new google.maps.Map(document.getElementById('map_stylist_canvas'), mapOptions);

		var gMarker = new google.maps.Marker({
			position: stylistSalonLatLng,
			map: map,
			title: stylist.first_name + ' ' + stylist.last_name,
		});

		var infowindow = new google.maps.InfoWindow({
			content: 'Loading...',
			maxWidth: 300,
		});

		self.getTpl('tpl/_stylist/map-detail.html', function(tpl) {
			var ractiveMap = new Ractive({
				template: tpl,
				data: {
					stylist: stylist
				}
			});

			infowindow.setContent(ractiveMap.renderHTML());

			self.$el.on('click', '.btn-bookViaStylistMap', function(e) {
				e.preventDefault();
				$this = $(this);
				
				if(app.models.auth.isLoggedIn() !== true) {
					app.pages.modalLogin.parent = self;
					app.pages.modalLogin.show(); return;
				} else {
					var stylistId = $this.data('stylist_id');
					var bookSalonBySalonMap = new AppViewBook({stylistId: stylistId});
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
		self.addPartials('content', 'tpl/_stylist/map.html', function(tpl){
			self.model.findById(self.opts.stylistId, function(reply) {
				if(reply.status === 'success') {
					var stylist = reply.data;
					self.rsetData({
						stylist : stylist,
						showFooter: false,
						//overrideHeader: true,
						header: {
							backBtn: 'stylist/' + self.opts.stylistId,
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