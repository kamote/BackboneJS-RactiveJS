define(function(require) {
  var $       = require('jquery'),
  _           = require('underscore'),
  Backbone    = require('backbone'),
  Ractive     = require('ractive'),
  AppViewPage = require('views/AppViewPage'),
  tpl         = require('text!tpl/home.html');

  var AppViewLogin = AppViewPage.extend({
    id:"login",
    initialize: function(options) {
      this.options = options || {};
      AppViewPage.prototype.initialize.call(this);
      _.bindAll(this, "rdone");
      this.rsetOptions({ complete: this.rdone });
      this.rsetData({
        activeNav: 'login',
        overrideHeader: true,
        showFooter: false,
        login: {
          email: '',
          password: '',
        },
        fErrors: {
          email: false,
          password: false,
        }
      });
    },
    
    rdone: function(rhtml) {
      var self = this;

      var loginValidator = new FormValidator('form-login', [{
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
              app.navigate('home', {trigger: true});  
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
        $("#form-login").submit();
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
        var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
        app.models.auth.fbLogin(function(reply) {
          app.navigate('home', {trigger: true});
        }); 
      });
    },
    
    render: function() {
      
      var self = this;
      self.addPartials('content', 'tpl/login.html', function(tpl){
        
        self.createPage();
        
      });
      return this;
    }
  });

  return AppViewLogin;
});