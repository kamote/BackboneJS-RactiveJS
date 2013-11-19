/*global define*/
define([
  'underscore',
  'backbone',
  'models/base-model',
  'store'
], function (_, Backbone, AppModelBase, store) {
  'use strict';
  var AppModelAuth = AppModelBase.extend({
    
    initialize: function() {
      if(store.get("Auth.accessToken") != null) this.accessToken = store.get("Auth.accessToken");
      if(store.get("Auth.userData") != null) this.userData = store.get("Auth.userData");
      
    },
    
    isLoggedIn: function() {
      if(this.accessToken != undefined) return true;
      
      return false;
    },
    
    isVerified: function() {
      if(this.userData != undefined && this.userData.verified_email == 1) return true;
      
      return false;
    },

    //update info via booking
    updateMobile: function(mobile) {
      if( this.userData.mobile <= 0 ) {
        this.userData.mobile = mobile;
        store.set("Auth.userData", this.userData);
      }
    },

    updateUserInfo: function(postData, callback) {
      var self = this;
      var uri = window.APIURI + 'users/updateInfo';
      return this.postJSON(uri, postData, function(reply) {
        if(reply.status === 'success') {
          self.userData.mobile = postData.mobile;
          store.set("Auth.userData", self.userData);
        }

        return callback(reply);
      });
    },
    
    logout: function(callback) {
      var uri  = window.APIURI;
      uri += 'auth/logout';

      $.ajax({
        type: "POST",
        url: uri,
        success: function(reply) {
          console.log('logout', reply);
        }
      });

      store.remove("Auth.accessToken");
      store.remove("Auth.userData");
      this.accessToken = undefined;
      this.userData = undefined;

      if(callback != undefined) callback();
    },
    
    login: function(username, pass, callback) {
      uri = APIURI + 'auth/login';
      self = this;
      
      postdata = {username: username, password: pass};
      console.log(uri);
      $.ajax({
        type: "POST",
        url: uri,
        data: postdata,
        success: function successCall(reply){
          console.log(reply);
          
          if(reply.data && reply.data.access_token != undefined) {
            self.initUser(reply.data.access_token, reply.data);
            callback(reply);
          } else {
            //display error
            callback(reply);
          }
        }
      });
    },
    
    initUser: function(accessToken, userData) {
      console.log("initUser", accessToken, userData);
      
      this.accessToken = accessToken;
      this.userData = userData;
      store.set("Auth.accessToken", this.accessToken);
      store.set("Auth.userData", this.userData);
    },

    fbStatusChange: function(response) {
      console.log('fbStatusChange', response);
    },

    fbPreRegister: function(callback) {
      var self = this;

      FB.login(function(response) {
        if (response.authResponse) {
          var access_token = response.authResponse.accessToken;
          console.log('Access Token = '+ access_token);
          FB.api('/me', function (response) {
              response.access_token = access_token;
              callback(response);
          });
        } else {
         console.log('User cancelled login or did not fully authorize.');
        }
      }, {scope: 'publish_actions'});
    },

    register: function(postdata, callback) {
      var self = this;
      var uri = window.APIURI + 'auth/register';

      $.ajax({
        type: "POST",
        url: uri,
        data: postdata,
        success: callback
      });
    },

    changePassword: function(postData, callback) {
      var uri = window.APIURI + 'users/changePassword';
      return this.postJSON(uri, postData, callback);
    },

    forgotPassword: function(postData, callback) {
      var uri = window.APIURI + 'users/forgotPassword';
      return this.postJSON(uri, postData, callback);
    },

    _FBLogin: function(callback) {
      FB.login(function(response) {
        if (response.authResponse) {

          var access_token = response.authResponse.accessToken;
          console.log('Access Token = '+ access_token);

          var response = {
            access_token: access_token
          }

          callback(response);

        } else {
         console.log('User cancelled login or did not fully authorize.');
        }
     }, {scope: 'publish_actions'});
    },

    fbConnect: function(callback) {
      var self = this;
      var uri = APIURI + 'auth/facebook/connect';


      self._FBLogin(function(response) {

        var postData  = {
          fb_access_token: response.access_token
        }

        $.ajax({
          type: "POST",
          url: uri,
          data: postData,
          success: function(reply) {
            if(reply.status == 'success') {
              
              if(reply.data) {
                store.set("Auth.userData", reply.data);
              }

              callback(reply);
            }
          }
        });

      });
    },

    fbDisConnect: function(callback) {
      var self = this;
      var uri = APIURI + 'auth/facebook/disconnect';

      $.ajax({
        type: "POST",
        url: uri,
        success: function(reply) {
          if(reply.status == 'success') {

            if(reply.data) {
              store.set("Auth.userData", reply.data);
            }

            callback(reply);
          }
        }
      });

    },

    fbLogin: function(callback) {
      var self = this;
      var uri = APIURI + 'auth/facebook/login';

      FB.login(function(response) {
       if (response.authResponse) {
         console.log('Welcome!  Fetching your information.... ');
         var access_token = response.authResponse.accessToken;
         console.log('Access Token = '+ access_token);

         $.ajax({
          type: "POST",
          url: uri,
          data: {access_token : access_token},
          success: function(reply) {
            if(reply.data && reply.data.access_token != undefined) {
              self.initUser(reply.data.access_token, reply.data);
              callback(reply);
            }
          }
          });

       } else {
         console.log('User cancelled login or did not fully authorize.');
       }
     }, {scope: 'publish_actions'});
    }
  });
  
  return AppModelAuth;
});