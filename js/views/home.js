define(function(require) {
  var $          = require('jquery'),
  _              = require('underscore'),
  Backbone       = require('backbone'),
  Ractive        = require('ractive'),
  AppViewPage    = require('views/AppViewPage'),
  tpl            = require('text!tpl/home.html'),
  AppModelSearch = require('models/search');

  var AppViewHome = AppViewPage.extend({
    id:"home",
    initialize: function(options) {
      this.options = options || {};
      AppViewPage.prototype.initialize.call(this);
      _.bindAll(this, "rdone");
      this.model = new AppModelSearch();
      this.rsetOptions({ complete: this.rdone });
      this.rsetData({
        activeNav: 'home',
        showFooter: true,
        search: {keyword: '', location: ''},
        overrideHeader: true,
      });
    },

    rdone: function(r) {
      var self = this;
      r.on('searchClick', function(event) {
        event.original.preventDefault();
        var searchTarget = "";

        searchTarget = self.model.parseSearchUri(self.rhtml.data.search.keyword, self.rhtml.data.search.location);
        
        app.navigate(searchTarget, {trigger: true});
      });

      r.on('searchTap', function(event){
        event.original.preventDefault();
        var elem = document.getElementById('extendSearch');
        elem.style.height = "100%";
      });

       r.on('hideExtendedSearch', function(event){
        event.original.preventDefault();
        var elem = document.getElementById('extendSearch');
        elem.style.height = "0";
      });
    },

    render: function() {
      
      var self = this;
      self.addPartials('content', 'tpl/home.html', function(){
        
        self.createPage();
        
      });
      return this;
    }
  });

  return AppViewHome;
});