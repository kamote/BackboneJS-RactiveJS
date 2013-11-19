window.AppViewTermsCondition = AppViewPage.extend({
	id:"terms-condition",
	initialize: function(options) {		
		this.options = options || {};
		AppViewPage.prototype.initialize.call(this);
	},

	render: function() {
		var self = this;
		
		self.addPartials('content', 'tpl/terms-condition.html', function(tpl){
			self.createPage();
		});
		return this;
	}
});

window.AppViewPrivacyPolicy = AppViewPage.extend({
	id:"privacy-policy",
	initialize: function(options) {		
		this.options = options || {};
		AppViewPage.prototype.initialize.call(this);
	},

	render: function() {
		var self = this;
		
		self.addPartials('content', 'tpl/privacy-policy.html', function(tpl){
			self.createPage();
		});
		return this;
	}
});

window.AppViewAboutUs = AppViewPage.extend({
	id:"about-us",
	initialize: function(options) {		
		this.options = options || {};
		AppViewPage.prototype.initialize.call(this);
	},

	render: function() {
		var self = this;
		
		self.addPartials('content', 'tpl/about-us.html', function(tpl){
			self.createPage();
		});
		return this;
	}
});