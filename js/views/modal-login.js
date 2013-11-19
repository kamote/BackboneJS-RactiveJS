define(function(require) {
  var $                   = require('jquery'),
  _                       = require('underscore'),
  Backbone                = require('backbone'),
  Ractive                 = require('ractive'),
  AppViewBasePageModal    = require('views/AppViewBasePageModal');

  var AppViewModalLogin   = AppViewBasePageModal.extend({
    
    initialize: function(options) {
      this.options = options || {};
      if(this.options.parent != undefined) {
        this.parent = this.options.parent;
      }
      this.modalId = 'app-modal-login';
      AppViewBasePageModal.prototype.initialize.call(this);
      this.opts = options || {};
      _.bindAll(this, "rdone");
      this.opts.complete = this.rdone;
      this.render();
    },
    
    rdone: function(rhtml) {
      var self = this;

      var loginValidator = new FormValidator('form-login-modal', [{
        name: 'email',
        rules: 'required|valid_email'
      },
      {
        name: 'password',
        rules: 'required'
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
          app.models.auth.login(self.rhtml.data.login.email, self.rhtml.data.login.password, function(reply) {
            if(reply.status === 'success') {
              if(self.parent) {
                self.parent.rhtml.set('isLoggedIn', true);
                console.log('isLoggedIn', self.rhtml.data.isLoggedIn);
              } else {
                app.page.rhtml.set('isLoggedIn', true);
                console.log('isLoggedIn', app.page.rhtml.data.isLoggedIn);
              }
              
              self.closeModal(); //TODO decide if we will use hide or reload the view page. 
            } else {
              var AHOptions = {
                content: reply.message,
                status: 'danger',
                dismissable: true,
                sticky: false,
              }

              var alertHelper = new AppViewHelperAlert(AHOptions);
            }
          });
        }
      });

      rhtml.on('loginClick', function(event){
        event.original.preventDefault();
        $("#form-login-modal").submit();
      });

      rhtml.on('fieldBlur', function(event) {
        event.original.preventDefault();
        console.log('some blur', event);
        var name = event.node.name;
        //validator specific hack
        //update
        loginValidator.errors = [];
        loginValidator.fields[name].value = event.node.value;
        var field = loginValidator.fields[name];
        loginValidator._validateField(field);
        
        //endof validator hack
        console.log('errors', loginValidator.errors);
        var fieldErr = _.findWhere(loginValidator.errors, { name: name });
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

      rhtml.on('FBloginClick', function(event){
        event.original.preventDefault();
        app.models.auth.fbLogin(function(reply) {
          var to;
          if(location.hash.indexOf('home') > -1){
            to = "";
          } else {
            to = "#home";
          }

          app.navigate(to, {trigger: true, replace: true});
        });
      });
      
    },
    
    render: function() {
      var self = this;
      self.opts.data = {
        login: {
          email: '',
          password: '',
        },
        fErrors: {
          email: false,
          password: false,
        }
      }

      self.getTpl('tpl/_modal/modal-login.html', function(tpl){
        self.opts.template = tpl;
        self.createModal($.noop, true);
      });
      return this;
    }
  });
  
  return AppViewModalLogin;
});