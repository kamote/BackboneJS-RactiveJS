window.AppViewConfirmBooking = AppViewPage.extend({
	id:"confirm-booking",
	initialize: function(options) {
		this.userInput = {};
		this.options = options || {};
		AppViewPage.prototype.initialize.call(this);
		this.rsetOptions({ complete: this.rdone });
		this.rsetData({
			header: {backBtn: 'book'}, 
		});
	},
	
	rdone: function(rthml) {
		rthml.on('confirmClick', function(event){
			event.original.preventDefault()
			console.log('confirmClick', event);
			return false;			
		});
	},
	
	render: function() {
		var self = this;
		
		self.addPartials('content', 'tpl/confirm-booking.html', function(tpl){
			var pending = store.get('book.pending');
			self.rsetData({ book: pending });
			self.createPage();
		});
		return this;
	}
});