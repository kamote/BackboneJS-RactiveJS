/*global define*/
define([
  'underscore',
  'backbone',
  'common'
], function (_, Backbone, Common) {
  'use strict';

  var AppModelBase = Backbone.Model.extend({
    postJSON: function(uri, postdata, successCallback, opt) {
      if(arguments.length == 2) {
        successCallback = postdata;
        var postdata = {};
      }
    
      function callback(reply) {
        console.log("postjson logs", uri, postdata);
        successCallback(reply);
      }
      
      var defoptions = {
        type : 'POST'
      }

      var options = _.extend(defoptions, opt);

      var APIURI = Common.APIURI;
      
      if(APIURI == undefined) {
        var APIURI = '';
      }
      
      if(uri.indexOf('http:') > -1 || uri.indexOf('https:') > -1) {
        var APIURI = '';
      }
      
      return $.ajax({
        type: options.type,
        url: APIURI + uri,
        dataType: "json",
        data: postdata,
        success: callback
      });
    }
  });

  return AppModelBase;
});
