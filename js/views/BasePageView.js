
// Filename: views/project/list
// Filename: views/project/list
define(function(require) {
  
  var $       = require('jquery'),
  _           = require('underscore'),
  Backbone    = require('backbone'),
  BaseView    = require('views/BaseView'),
  Ractive     = require('ractive'),
  tpl         = require('text!templates/layouts/default.html');
  
  return BasePageView = BaseView.extend({
    subs: {},
    initialize: function(options) {
      this.options = options || {};
      this.rData = {};
      _.bindAll(this, "layoutSet");
    },
    
    createPage: function() {
      alert('createPage');
      var self = this;
      self.getTpl(this.layout, self.layoutSet);
      return self;
    },
    
    addPartials: function(name, path, callback) {
      var self = this;
      console.log(self.rData);
      if(_.isUndefined(self.rData['partials'])) {
        self.rData.partials = {};
      }
      if(callback == undefined) {
        self.rData.partials[name] = Ractive.parse(path);
        return ;
      } else {
        self.getTpl(path, function(rtpl){
          self.rData.partials[name] = rtpl;
          return callback(self.rData);
        });
      }
      
    },
    
    rsetOptions: function(opts) {
      this.rData = _.extend(this.rData, opts);
    },
    
    rsetData: function(data) {
      if(this.rData.data == undefined) {
        this.rData.data = {};
      }
      this.rData.data = _.extend(this.rData.data, data);
    },
    
    layoutSet: function(rtpl) {
      console.log(this.rData);
      var defData  = {
        showFooter : true
      }

      if(this.rData.data == undefined) {
        this.rData.data = {};
      }

      alert('kamote kng kami');
      //this.rData.data.isLoggedIn = app.models.auth.isLoggedIn() || false;
      this.rData.data  = _.extend(defData, this.rData.data);

      this.setRHTML(rtpl, this.rData);
    }
  });
});