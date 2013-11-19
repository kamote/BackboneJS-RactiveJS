define(function(require) {
  
  var $           = require('jquery'),
  _               = require('underscore'),
  Backbone        = require('backbone'),
  AppViewBasePage = require('views/AppViewBasePage'),
  tpl             = require('text!tpl/layouts/page.html'),
  AppViewHome     = require('views/home'),
  AppViewLogin    = require('views/login'),
  AppViewSearch   = require('views/search'),
  AppViewModalLogin = require('views/modal-login'),
  AppModelAuth    = require('models/auth');

  var AppRouter = Backbone.Router.extend({
    routes: {
      ""              : "home",
      "home"            : "home",
      "login"           : "login",
      "signup"          : "register",
      "forgot-password"     : "forgotPassword",
      "map/*keyword"        : "searchResultMap",
      "search/:kw/city/:loc"    : "search",
      "search/:kw"        : "search",
      "search/city/:loc"      : "searchByCity",
      "confirm"         : "confirmBooking",
      "book"            : "book",
      "profile/:id"       : "employeeProfile",
      "stylist/:id/map"     : "profileMap",
      "stylist/:id(/:page)"   : "profile",
      "salon/:id/map"       : "salonMap",
      "salon/:id(/:page)"     : "salon",
      "settings"          : "settings",
      "appointments(/:page)"    : "appointments",
      "terms-condition"     : "termsCondition",
      "privacy-policy"      : "privacyPolicy",
      "about-us"          : "aboutUs",

      "*call"           :"dispatch"
    },
    
    employeeProfile: function(id) {
      if(id == undefined) id = null;
      
      this.changePage(new AppViewEmployeeProfile({eid: id}))
    },

    profile: function(id, page) {
      var stylistId = id || null;
      var page = page || 'services';
      this.changePage(new AppViewStylistProfile({
        stylistId: stylistId,
        page: page
      }));
    },

    profileMap: function(id) {
      var stylistId = id || null;
      var p = {
        stylistId: stylistId,
      }

      this.changePage(new AppViewStylistMap(p));
    },
    
    initialize: function(options) {
      console.log("init", typeof options, location.hash);
      this.firstPage = true;
      this.historypage = [];
      this.page = null;
      this.modal = null;
      this.existingPage = null;
      this.models = {};
      this.pages = {};
      this.models['auth'] = new AppModelAuth();
      this.pages.modalLogin = new AppViewModalLogin();
    },

    storeRoute: function() {
      return this.historypage.push(Backbone.history.fragment);
    },

    getPreviousPage: function(navigate) {
      if (this.historypage.length > 1) {
        return this.historypage[this.historypage.length - 2];
      } else {
        return 'home';
      }
    },

    logout: function() {
    },
    
    isLoggedIn: function() {
    },
    
    before: function(route, params) {
      this.storeRoute();
      //$.mobile.showPageLoadingMsg();
    },
    
    after: function(route, params) {
      //$.mobile.hidePageLoadingMsg();
    },
    
    changePage:function (page) {
      //close modals
      var hasModal = $('[id^="app-modal-container-"]'); 
      if(hasModal.length > 0) {
        hasModal.each(function(){
          $(this).data('ubookView').close(true);
        });
        $('#app-container').show();
      }
      
      $('#app-container').show();
      //this.pages.modalLogin.hide();
      //console.log(page.el, page);
      
      if(this.page == null) {
        this.page = page;
      } else {
        var old = this.page;
        this.page = null;
        
      }
      console.log('old exist?', typeof old);
      if(old != undefined) {
        console.log("old", old);
        //old.$el.hide();
        //old.teardown(true);
      }
      //page.$el.hide();
      page.render();
        
          this.page = page;
          if (this.firstPage) {
              this.firstPage = false;
        scrollTime = 200;
          } else {
            scrollTime = 100;
          }
      var self = this;
     
        
        //$('.modal').modal('hide');
        
        $('#app-container')
        .html(page.$el)
        .promise()
        .done(function(){
          setTimeout(function() { window.scrollTo(0, 1) }, scrollTime);
        });
        
        
          
    },
    
    cleanup: function(old, remove) {
      if(old.rhtml != undefined) {
        old.rhtml.teardown();
      }
      if(old.subs != undefined && !_.isEmpty(old.subs)) {
        for(sub in old.subs) {
          old.subs[sub].undelegateEvents();
          if(old.subs[sub].rhtml != undefined) {
            old.subs[sub].rhtml.teardown();
          }
        }
      }
      
      old.undelegateEvents();
      if(remove != undefined && remove === true) {
        old.remove();
      }
    },
    
    home: function() {
      this.changePage(new AppViewHome({}));
    },
    login: function() {
      this.changePage(new AppViewLogin({}));
    },
    
    register: function() {
      this.changePage(new AppViewRegister({}));
    },

    forgotPassword: function() {
      this.changePage(new AppViewForgotPassword({}));
    },
    
    search: function(kw, loc) {
      
      if(loc == undefined) loc = '';
      if(kw == undefined) kw = '';

      this.changePage(new AppViewSearch({keyword: kw, location: loc}));
    },

    searchByCity: function(loc) {
      if(loc == undefined) loc = '';
      this.changePage(new AppViewSearch({keyword: '', location: loc}));
    },

    searchResultMap: function(keyword)
    {
      this.changePage(new AppViewSearchResultMap({
        keyword: keyword  
      }));
    },
    
    book: function() {
      this.changePage(new AppViewBook({}));
    },
    
    confirmBooking: function() {
      this.changePage(new AppViewConfirmBooking({}));
    },
    
    salon: function(id, page) {
      var id = id || null;
      var page = page || 'services';
      this.changePage(new AppViewSalon({
        salonId: id,
        page: page
      }));
    },

    salonMap: function(id) {
      var id = id || null;
      console.log('xxx', id);
      var p = {
        salonId: id
      }

      this.changePage(new AppViewSalonMap(p));
    },
    
    settings: function() {
      
      if( ! this.models.auth.isLoggedIn()) {
        app.navigate('home', {trigger: true});
      }
      
      this.changePage(new AppViewSettings({}));
    },
    
    appointments: function(page) {
      
      if( ! this.models.auth.isLoggedIn()) {
        app.navigate('home', {trigger: true});
      }

      var page = page || 'upcoming';
      
      this.changePage(new AppViewAppointment({
        page: page
      }));
    },

    termsCondition: function(page) {
      this.changePage(new AppViewTermsCondition());
    },

    privacyPolicy: function(page) {
      this.changePage(new AppViewPrivacyPolicy());
    },

    aboutUs: function(page) {
      this.changePage(new AppViewAboutUs());
    },

    dispatch: function(call) {

    }
  });

  var initialize = function(){
    app = new AppRouter;
    Backbone.history.start();
  };

  return {
    initialize: initialize
  };
});