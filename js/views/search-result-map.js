window.AppViewSearchResultMap = AppViewPage.extend({
	id:"search-map-result",
	initialize: function(options) {
		AppViewPage.prototype.initialize.call(this);
		_.bindAll(this, "rdone");
		this.options = options || {};

		this.model = new AppModelSearch();
		this.rsetOptions({ complete: this.rdone });
		this.rsetData({
			overrideHeader: true,
			showFooter: false,
			header: {backBtn: this.options.keyword || 'home', title: "Result on Map"},
			activeNav: 'home',
		});
	},
	
	rdone: function(r) {
		var self = this;

		self.options.results = self.model.getFromCookie();

		self.map_controls = $('#map_search_result_controls');
		self.map_canvas = $('#map_search_result_canvas');
		self.mapMarkers = [];

		self._initialize_map(false, function() {
			self._attach_results(self.options.results)
		});
		
		/*navigator.geolocation.getCurrentPosition(function(pos) {
			var crd = pos.coords;

			self._initialize_map(crd, function() {
				self._attach_results(self.options.results)
			});
		}, function() {
			self._initialize_map(false, function() {
				self._attach_results(self.options.results)
			});
		});*/
	},

	render: function() {
		var self = this;
		
		self.addPartials('content', 'tpl/_search/search-map.html', function(tpl){
			self.createPage();
		});
		
		return this;
	},

	_attach_results: function(results) {
		//hacked on map clicked
		//http://you.arenot.me/2010/06/29/google-maps-api-v3-0-multiple-markers-multiple-infowindows/
		var self = this;

		self.getTpl('tpl/_search/search-map-template.html', function(tpl) {
			var infowindow = null;

			infowindow = new google.maps.InfoWindow({
				content: 'Loading...',
				maxWidth: 300,
			});

			var salons = [];

			for (var i = results.length - 1; i >= 0; i--) {

				var result = results[i];

				salons.push(result.salon_branch_id);
				

				var salonLatLng = new google.maps.LatLng(result.salon_branch_lat, result.salon_branch_lng);
				var ractiveMap = new Ractive({
					template: tpl,
					data: {result: result}
				});

				var gMarker = new google.maps.Marker({
					position: salonLatLng,
					map: self.gmap,
					title: result.salon_branch_name,
					html: ractiveMap.renderHTML()
				});

				self.mapMarkers.push(gMarker);

				google.maps.event.addListener(gMarker, 'click', function() {
					infowindow.setContent(this.html);
					infowindow.open(self.gmap, this);

					self.gmap.setZoom(13);
					self.gmap.setCenter(gMarker.getPosition());
				});
			}

			self.map_auto_center();

			self.$el.on('click', '.btn-bookViaMap', function(e) {
				e.preventDefault();
				$self = $(this);
				if(app.models.auth.isLoggedIn() !== true) {
					app.pages.modalLogin.show(); return;
				} else {
					var salonId = $self.data('salon_branch_id');
					var bookSalonByMap = new AppViewBook({isSalon: true, salonId: salonId});
				}
				
			});
		});

		
	},

	map_auto_center :function () {
		var self = this;

		//  Create a new viewpoint bound
		var bounds = new google.maps.LatLngBounds();
		
		for (var i = self.mapMarkers.length - 1; i >= 0; i--) {
			var marker = self.mapMarkers[i];
			bounds.extend(marker.position);
		}

		//  Fit these bounds to the map
		self.gmap.fitBounds(bounds);
	},

	_initialize_map: function(myLocation, cb) {
		var self = this;

		if(myLocation) {
			var myLatlng = new google.maps.LatLng(myLocation.latitude, myLocation.longitude);
			var mapOptions = {
				zoom: 3,
				center: myLatlng,
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
		} else {
			var mapOptions = {
				zoom: 3,
				//center: myLatlng,
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
		}
		

		self.gmap = new google.maps.Map(document.getElementById('map_search_result_canvas'), mapOptions);
		console.log('mygmap', self.gmap);

		google.maps.event.addDomListener(window, "resize", function() {
			var center = self.gmap.getCenter();
			google.maps.event.trigger(self.gmap, "resize");
			self.gmap.setCenter(center); 
  		});

		cb();
	}
});