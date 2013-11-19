/*global define*/
define([
  'underscore',
  'backbone',
  'models/base-model',
  'store'
], function (_, Backbone, AppModelBase, store) {
  'use strict';
  
  var AppModelSchedule = AppModelBase.extend({

    book: function(postdata, callback) {
      var uri = APIURI + 'schedule/book';
      return this.postJSON(uri, postdata, callback);
    },

    cancelAppointment: function(postdata, callback) {
      var uri = APIURI + 'schedule/cancel';
      return this.postJSON(uri, postdata, callback);
    },

    myappointments: function(params, callback) {
      var uri = APIURI + 'schedule/myappointments';
      return this.postJSON(uri, params, callback, {type: 'GET'});
    }
    
  });

  return AppModelSchedule;
});