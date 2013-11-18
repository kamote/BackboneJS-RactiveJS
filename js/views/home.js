// Filename: views/project/list
define([
  'jquery',
  'underscore',
  'backbone',
  'ractive',
  'views/PageView',
  // Using the Require.js text! plugin, we are loaded raw text
  // which will be used as our views primary template
  'text!templates/layouts/default.html',
  'text!templates/home.html'
], function($, _, Backbone, Ractive, PageView, pageTemplate, homeTemplate){
  console.log(PageView);
  alert('kamote');
  var AppViewHome = PageView.extend({
    id:"home",
    initialize: function(options) {
      this.options = options || {};
      PageView.prototype.initialize.call(this);
      _.bindAll(this, "rdone");
      //this.model = new AppModelSearch();
      this.rsetOptions({ complete: this.rdone });
      this.rsetData({
        activeNav: 'home',
        showFooter: true,
        search: {keyword: '', location: ''},
        overrideHeader: true,
      });
    },

    rdone: function(r) {
      alert('xx');
      var self = this;
      r.on('searchClick', function(event) {
        event.original.preventDefault();
        var searchTarget = "";

        searchTarget = self.model.parseSearchUri(self.rhtml.data.search.keyword, self.rhtml.data.search.location);
        
        app.navigate(searchTarget, {trigger: true});
      });
    },

    render: function() {
      
      var self = this;
      self.addPartials('content', 'templates/home.html', function(){
        
        self.createPage();
        
      });
      return this;
    }
  });

  return AppViewHome;
});