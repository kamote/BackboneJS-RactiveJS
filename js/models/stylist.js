/*global define*/
define([
  'underscore',
  'backbone',
  'models/base-model',
  'store'
], function (_, Backbone, AppModelBase, store) {
  'use strict';

  var AppModelStylist = AppModelBase.extend({
    
    findById: function(stylistId, callback) {
      var uri = 'stylist/' + stylistId;
      return this.postJSON(uri, {}, callback);
    },
    
    findServices: function(stylistId, callback) {
      var uri = 'stylist/' + stylistId + '/services';
      return this.postJSON(uri, {}, callback);
    },
    
    findOpeningHours: function(stylistId, callback) {
      var uri = 'stylist/' + stylistId + '/availability';
      return this.postJSON(uri, {}, callback);
    },

    findHoliDaysOffs: function(stylistId, params, callback) {
      var uri = 'stylist/' + stylistId + '/holidaysoffs';
      return this.postJSON(uri, params, callback);
    },
    
    findTimeSlot: function(stylistId, params, callback) {
      var uri = 'stylist/' + stylistId + '/timeslot';
      return this.postJSON(uri, params, callback, {type: 'GET'});
    }
    
  });

  return AppModelStylist;
});