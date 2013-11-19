window.AppViewForgotPassword = AppViewPage.extend({
	id:"forgot-password",
	initialize: function(options) {
		this.options = options || {};
		AppViewPage.prototype.initialize.call(this);
		_.bindAll(this, "rdone");
		this.rsetOptions({ complete: this.rdone });
		this.rsetData({
			forgotPassword: {
				email: ''
			},
			activeNav: 'login',
			success: false,
			showFooter: true,
			header: {
				backBtn: 'login'
			}
		});
	},
	
	rdone: function(rhtml) {
		var self = this;

		var forgotPasswordValidator = new FormValidator('form-forgot-password', [{
			name: 'email',
			rules: 'required|valid_email'
		}], function(errors, event) {
			event.preventDefault();
			
			if (errors.length > 0) {
				for (var i = errors.length - 1; i >= 0; i--) {
					
					self.rhtml.set('fErrors.'+ errors[i].name, true);
				}

				var error = errors[0];
				var AHOptions = {
					content: error.message,
					status: 'danger',
					dismissable: true,
					sticky: false,
				}

				var alertHelper = new AppViewHelperAlert(AHOptions);

				return false;
			} else {
				app.models['auth'].forgotPassword({email : self.rhtml.data.forgotPassword.email }, function(reply) {
					if(reply.status === 'success') {
						self.rhtml.set('success', true);
					} else {
						if(reply.error) {
							var AHOptions = {
								content: reply.error.message,
								status: 'danger',
								dismissable: true,
								sticky: false,
							}

							var alertHelper = new AppViewHelperAlert(AHOptions);
						}
					}
				});
			}
		});

		rhtml.on('forgotPasswordSubmitClick', function(event) {
			event.original.preventDefault();
			$("#form-forgot-password").submit();
		});
	},
	
	render: function() {
		
		var self = this;
		self.addPartials('content', 'tpl/forgot-password.html', function(tpl) {
			self.createPage();
		});
		return this;
	}
});