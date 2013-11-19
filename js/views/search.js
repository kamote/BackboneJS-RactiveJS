define(function(require) {
  var $          = require('jquery'),
  _              = require('underscore'),
  Backbone       = require('backbone'),
  Ractive        = require('ractive'),
  AppViewPage    = require('views/AppViewPage'),
  tpl            = require('text!tpl/home.html'),
  AppModelSearch = require('models/search'),
  AppViewBook    = require('views/book');

  var AppViewSearch = AppViewPage.extend({
    id:"search",
    initialize: function(options) {
      this.userInput = {};
      AppViewPage.prototype.initialize.call(this);
      _.bindAll(this, "rdone");
      this.options = options || {};
      this.model = new AppModelSearch();
      this.rsetOptions({ complete: this.rdone });
      this.rsetData({
        overrideHeader: true,
        header: {backBtn: 'home', title: "Search Result"},
        activeNav: 'home',
      });
      _.bindAll(this, "updateView");
    },
    
    rdone: function(r) {
      var self = this;

      r.on('bookClick', function(event){
        var stylistId = event.node.getAttribute('data-stylist-id') || null;
        /*if(app.models.auth.isLoggedIn() !== true) {
          app.pages.modalLogin.show(); return;
        } else {
          self.book = new AppViewBook({stylistId: stylistId});
          console.log(self.book); 
        }*/
        self.book = new AppViewBook({stylistId: stylistId});
        self.book.show();
      });

      r.on('showMapClick', function(event) {
        event.original.preventDefault();

        searchTarget = self.model.parseSearchUri(self.options.keyword, self.options.location);
        app.navigate("map/" + searchTarget, {trigger: true});
        /*var mapSearchResult = new AppViewMapSearchResult({
          results: self.rhtml.data.results
        });*/
      });

      r.set('loading', true);

      r.on({
        // if this gets torn down, we clean up after ourselves and stop polling
        teardown: function () {
          //clearInterval( intervalId );
          window.removeEventListener('scroll', fnScroll, false);
        }
      });

      self.pageCounter;
      var hasNext = true;

      var fnScroll = function(event) {
        
        if(!hasNext) {
          return false;
        }
        if ($(window).scrollTop() >= $(document).height() - $(window).height() - 700) {
          
          r.set('show_more_result', true);

          if (self.processing) {
            return false;
          }

          self.processing = true;

          var pagingOptions = {
            page: self.pageCounter
          }

          self.model.search(self.options.keyword, 
            self.options.location,
            pagingOptions, 
            function(reply) {
              if(reply.data.length > 0) {
                for(var i=0; i < reply.data.length; i++) {
                  r.data.results.push(reply.data[i]);
                  r.set('show_more_result', false);
                }

                self.pageCounter++;
                hasNext = true;

              } else {
                hasNext = false;
              }

              self.processing = false;

          });
        }
      }

      window.addEventListener('scroll', fnScroll, false);
    },
    
    render: function() {
      var self = this;
      self.pageCounter = 1;
      self.processing = true;

      self.pubsub.once('api-search-done', function(data){
        //console.log(data);
        var data = data;
        self.rhtmlLive(function(){
          self.updateView(data);
        });
      });
      
      //setTimeout(function(){ console.log('delaying api');
      
      self.model.search(self.options.keyword, self.options.location, {}, function(reply) {
        var data = reply.data;
        console.log('search data done');
        self.pubsub.trigger('api-search-done', data);
      });
    
      //}, 3000);
      
      //setTimeout(function(){ console.log('delaying view');
      
      self.addPartials('content', 'tpl/search.html', function(tpl){
        var kw = self.options.keyword;//_.str.capitalize(self.options.keyword);
        self.rsetData({results : [], loading: false, keyword: kw, progress: 60, noresults: false});
        self.createPage();
      });
      
      //}, 3000);
      
      return this;
    },
    
    updateView: function(data) {
      var self = this;
      self.rhtml.set('progress', 98);
        setTimeout(function(){
          self.rhtml.set('loading', false);
          self.rhtml.set('results', data);
          var nores;
          if(data.length < 1) {
            nores = true;
          } else {
            nores = false;
            self.pageCounter = self.pageCounter + 1;
          }
          self.rhtml.set('noresults', nores);
          
          self.processing = false;

        }, 500);
      }
    });

  return AppViewSearch;

  });
