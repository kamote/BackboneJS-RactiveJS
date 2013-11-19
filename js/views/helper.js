window.AppViewHelperAlert = AppViewBase.extend({
	id:"alert-helper",
	el: "#app-helper-alert",
	initialize: function(options) {
		this.opts = {};
		this.opts.data = {};
		this.opts.data.content = options.content || '';
		this.opts.data.dismissable = options.dismissable || true;
		this.opts.data.timeout = options.timeout || 3500;
		this.opts.data.sticky = options.sticky || false;
		this.opts.data.status = options.status || 'success';

		AppViewBase.prototype.initialize.call(this);
		_.bindAll(this, "rdone");
		this.opts.complete = this.rdone;
		this.render();
	},
	
	render: function() {
		var self = this;
		
		self.getTpl('tpl/_helpers/alert.html', function(tpl){
			
			self.setRHTML(tpl, self.opts);
		});

		return this;
	},

	rdone: function(r) {
		var self = this;
		self.$el.addClass('in');
		if(self.opts.data.sticky == false) {
			setTimeout(function() {
				self.$el.removeClass('in');
			}, self.opts.data.timeout);
		}
	},

});