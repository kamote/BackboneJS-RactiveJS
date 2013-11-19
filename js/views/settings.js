window.AppViewSettingsChangePassword = AppViewBasePageModal.extend({
	
	initialize: function(options) {
		this.options = options || {};
		if(this.options.parent != undefined) {
			this.parent = this.options.parent;
		}
		AppViewBasePageModal.prototype.initialize.call(this);

		this.opts = {};
		_.bindAll(this, "rdone");
		this.opts.complete = this.rdone;
		this.render();
	},

	resetUIState: function() {
		var self = this;
		var changePassword = {
			current_password: '',
			password: '',
			confirm_password: '',
			complete: false,
		}

		self.rhtml.set('changePassword', changePassword);
		self.rhtml.set('fErrors', {});
	},
	
	rdone: function(r) {
		var self = this;

		var fnChagePassword = function() {
			var postData = {
				current_password: self.rhtml.data.changePassword.current_password,
				password: self.rhtml.data.changePassword.password,
			}

			app.models['auth'].changePassword(postData, function(reply) {
				console.log('changePassword', reply);
				if(reply.status === 'success') {

					self.hideModal();
					var AHOptions = {
						content: reply.message,
						status: 'success',
						dismissable: true,
						sticky: false,
					}

					var alertHelper = new AppViewHelperAlert(AHOptions);

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
		

		var signUpValidator = new FormValidator('form-change-password', [{
				name: 'current_password',
				display: 'Current Password',
				rules: 'required'
			},
			{
				name: 'password',
				rules: 'required|min_length[8]|max_length[20]',
				display: 'Password'
			},
			{
				name: 'password_confirm',
				display: 'password Confirmation',
				rules: 'required|matches[password]',
			}], function(errors, event) {
				event.preventDefault();
				console.log('errors', errors);

				if (errors.length > 0) {
					
					for (var i = errors.length - 1; i >= 0; i--) {
						self.rhtml.set('fErrors.'+ errors[i].name, true);
					}

					var error = errors[0];
					var AHOptions = {
						content: error.message,
						status: 'danger',
						dismissable: false,
						sticky: false,
					}

					var alertHelper = new AppViewHelperAlert(AHOptions);

					return false;
					// Show the errors
				} else {
					fnChagePassword();
				}
			});

		r.on('doChangePasswordClick', function(event){
			event.original.preventDefault();
			$("#form-change-password").submit();
		});

		r.on('fieldBlur', function(event) {
			event.original.preventDefault();
			console.log('some blur', event);
			var name = event.node.name;
			//validator specific hack
			//update
			signUpValidator.errors = [];
			signUpValidator.fields[name].value = event.node.value;
			var field = signUpValidator.fields[name];
			signUpValidator._validateField(field);
			
			//endof validator hack
			console.log('errors', signUpValidator.errors);
			var fieldErr = _.findWhere(signUpValidator.errors, { name: name });
			console.log('err on filed', fieldErr);
			if(fieldErr) {
				self.rhtml.set('fErrors.'+name, true);

				var AHOptions = {
					content: fieldErr.message,
					status: 'danger',
					dismissable: true,
					sticky: false,
				}

				var alertHelper = new AppViewHelperAlert(AHOptions);
			} else {
				self.rhtml.set('fErrors.'+name, false);
			}
			
		});
	},
	
	render: function() {
		var self = this;
		self.opts.data = {
			changePassword: {
				current_password: '',
				password: '',
				confirm_password: '',
				complete: false,
			}
		}

		self.getTpl('tpl/_settings/change-password.html', function(tpl) {
			self.opts.template = tpl;
			self.createModal(null, true);
		});
		
		return this;
	}
});

window.AppViewSettings = AppViewPage.extend({
	id:"settings",
	initialize: function(options) {
		this.options = options || {};
		AppViewPage.prototype.initialize.call(this);
		_.bindAll(this, "rdone");
		this.rsetOptions({ complete: this.rdone });
		this.userData = app.models['auth'].userData || null;
		this.rsetData({
			header: {
				backBtn: 'home',
				title: 'Settings'
			}, 
			activeNav: 'settings',
		});
	},
	
	rdone: function(r) {
		var self = this;
		r.on('logoutClick', function(event) {
			event.original.preventDefault();
			app.models['auth'].logout(function(reply){
				console.log('logout', reply);
				var to;
				if(location.hash.indexOf('home') > -1){
					to = "";
				} else {
					to = "#home";
				}
				
				app.navigate(to, {trigger: true, replace: true});
			});
		});

		r.on('fbConnectClick', function(event) {
			event.original.preventDefault();
			app.models['auth'].fbConnect(function(reply){
				self.rhtml.set('user.fb_id', reply.data.fb_id);
				self.rhtml.set('user.fb_email', reply.data.fb_email);
			});
		});

		r.on('fbDisConnectClick', function(event) {
			event.original.preventDefault();
			app.models['auth'].fbDisConnect(function(reply){
				self.rhtml.set('user.fb_id', reply.data.fb_id);
				self.rhtml.set('user.fb_email', reply.data.fb_email);
			});
		});

		var changePasswordView = new AppViewSettingsChangePassword({parent: self});

		r.on('changePasswordClick', function(event) {
			event.original.preventDefault();
			
			changePasswordView.resetUIState();
			changePasswordView.show();
		});

		var changeMobileView = new AppViewSettingsChangeMobile({
			parent: self, 
			mobile: self.userData.mobile 
		});

		r.on('changeMobileClick', function(event) {
			event.original.preventDefault();
			changeMobileView.show();
		});

		
	},
	
	render: function() {
		var self = this;
		self.addPartials('content', 'tpl/settings.html', function(tpl){
			self.rsetData({
				user: self.userData
			});
			self.createPage();
		});
		return this;
	}
});

window.AppViewSettingsChangeMobile = AppViewBasePageModal.extend({
	
	initialize: function(options) {
		this.options = options || {};
		if(this.options.parent != undefined) {
			this.parent = this.options.parent;
		}
		AppViewBasePageModal.prototype.initialize.call(this);

		this.opts = {};
		_.bindAll(this, "rdone");
		this.opts.complete = this.rdone;
		this.render();
	},
	
	rdone: function(r) {
		var self = this;

		r.on('doChangeMobileClick', function(event) {
			event.original.preventDefault();

			var postData = {
				mobile: self.rhtml.data.mobile
			}

			app.models['auth'].updateUserInfo(postData, function(reply) {

				if(reply.status === 'success') {
					self.parent.userData.mobile = self.rhtml.data.mobile;
					self.parent.rhtml.set('user.mobile' , self.rhtml.data.mobile);
				}

				self.hideModal();
			});
		});
	},
	
	render: function() {
		var self = this;
		self.opts.data = {
			mobile: self.options.mobile
		}

		self.getTpl('tpl/_settings/change-mobile.html', function(tpl) {
			self.opts.template = tpl;
			self.createModal(null, true);
		});
		
		return this;
	}
});