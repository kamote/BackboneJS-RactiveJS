/*global define*/
define([
  'underscore',
  'backbone',
  'models/base-model',
  'store'
], function (_, Backbone, AppModelBase, store) {
  'use strict';

  var AppModelSearch = AppModelBase.extend({

    cookieKey: "search.result",
    search: function(keyword, location, pagingOptions, callback) {
      var self = this;
      var post = {
        'keyword': keyword,
        'location': location,
        'page': pagingOptions.page  
      };

      //var uri = 'search/s?q=' + keyword + '&location=' + location;
      var uri = 'search/s';

      return this.postJSON(uri, post, function(reply) {
        if(reply.status == 'success') {
          store.set(self.cookieKey, reply.data);
        } else {
          store.set(self.cookieKey, []);
        }

        callback(reply);
      }, {
        type: 'GET'
      });
    },

    getFromCookie: function(key) {
      var self = this;
      return store.get(key || this.cookieKey);
    },

    parseSearchUri: function(keyword, location, root) {

      var defRoot = 'search/';
      var searchTarget = '';

      var rootz  = defRoot;
      
      if(root != undefined) {
        rootz = root;
      }

      if(keyword) {
        searchTarget = rootz + keyword;
      }
      
      if(keyword && location) {
        searchTarget = rootz + keyword + "/city/" + location;
      }

      if(location && ! keyword) {
        searchTarget = rootz + "city/" + location;
      }

      return searchTarget;
    } 
  });

  return AppModelSearch;
});