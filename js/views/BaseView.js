// Filename: views/project/list
define(function(require) {

  var $       = require('jquery'),
  _           = require('underscore'),
  Backbone    = require('backbone'),
  Ractive     = require('ractive'),
  tpl         = require('text!templates/layouts/default.html');

  return Backbone.View.extend({
    tpls: {},
    pubsub: _.extend({}, Backbone.Events),
    
    setHTML: function(html, callback) {
      var self = this;
      self.$el.html(html)
        .promise().done(setTimeout(function(){
          if(_.isFunction(callback)) {
            return callback();
          }
        //self.$el.attr('data-role', 'page').trigger('pagecreate');   
      }, 10));
    },
    
    setRHTML: function(html, options) {
      var self = this;
      var opts = {};
      opts.data = {};
      var viewEl = false;
      if(options.el != undefined) {
        var element = options.el;
      } else {
        if(self.$el != undefined) {
          var element = self.$el;
          viewEl = true;
        } 
      } 
      
      
      if(element == undefined) {
        console.error("No Ractive Element specified");
        return;
      }
      
      opts.el = element;
      opts.template = html;
      
      if(viewEl) {
        if(options != null && options.complete != undefined) {
          var completeCallback = options.complete;
        }
        opts.complete = function() {
          setTimeout(function(){
                self.$el
                .promise().done(function(){
                  self.$el.show();
                });
                
              }, 10); 
          if(completeCallback != undefined) completeCallback(this);
          self.pubsub.trigger("rhtml:complete-callback"); 
        };
        if(completeCallback != undefined) delete(options.complete);
        self.$el.data('ubook-view', self);
      }
      
      var nops = _.extend(opts, options);
      var r = new Ractive(nops);

      r.on('headerBackButton', function(event) {
        event.original.preventDefault();
        var hash = event.node.hash;

        if(hash !== '#home') {
          window.history.back();
        } else {
          app.navigate(hash, {trigger: true});
        }
      });

      if(viewEl) {
        self.rhtml = r;
        self.pubsub.trigger("rhtml:complete");
        self.pubsub.trigger("rhtml:available");
      }
      return r;
    },
    
    getTpl: function(path, callback) {
      
      alert(path);
      return require(['text!'+ path], function() {
        callback();
      });

      var self = this;
      
      if(self.tpls[path] != undefined) {
        return callback(self.tpls[path]);
      } else {
        if(window._nocachetpl != undefined) {
          path += '?_=' + Math.random();
        }
        return $.get(path, function(tpl){
          var rtpl = Ractive.parse(tpl);
          self.tpls[path] = rtpl;
          callback(rtpl);
        });
      }   
    },
    
    cleanup: function(remove, cb) {
        var old = this;
        if( ! _.isFunction(cb)) {
          cb = function() {};
        }
        
        if(old.subs != undefined && !_.isEmpty(old.subs)) {
          for(sub in old.subs) {
            old.subs[sub].undelegateEvents();
            if(old.subs[sub].rhtml != undefined) {
              old.subs[sub].rhtml.teardown();
            }
          }
        }

        if(old.rhtml != undefined) {
          old.rhtml.teardown(function() {
            old.undelegateEvents();
            old.remove();
            return cb();
          });
        } else {
          old.undelegateEvents();
          if(remove != undefined && remove === true) {
            old.remove();
          }
          
          return cb();
        }
    },
    
    rhtmlLive: function(cb) {
      var self = this;
      if(self.rhtml != undefined) {
        console.log("rhtmlLive via callback");
        cb();
      } else {
        console.log("rhtmlLive via pubsub");
        //_.bind(this, cb);
        self.pubsub.once("rhtml:available", function(){
          var interval = setInterval(function(){
            console.log("rhtmlLive via pubsub - " + typeof self.rhtml);
            if(self.rhtml != undefined) {
              cb();
              clearInterval(interval);  
            }
          }, 10);
          
        });
      }
      return;
    }
      
  });

});