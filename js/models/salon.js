/*global define*/
define([
  'underscore',
  'backbone',
  'models/base-model',
  'store'
], function (_, Backbone, AppModelBase, store) {
  'use strict';
  
  var AppModelSalon = AppModelBase.extend({
    
    findById: function(salonId, callback) {
      var uri = APIURI + 'branch/' + salonId;
      return this.postJSON(uri, {}, callback);
    },
    
    findServices: function(salonId, callback) {
      var uri = APIURI + 'branch/' + salonId + '/services';
      return this.postJSON(uri, {}, callback);
    },
    
    findTeams: function(salonId, callback) {
      var uri = APIURI + 'branch/' + salonId + '/teams';
      return this.postJSON(uri, {}, callback);
    },

    findBranches: function(salonId, callback) {
      var uri = APIURI + 'branch/' + salonId + '/branches';
      return this.postJSON(uri, {}, callback, {type: 'GET'});
    },

    findBranchStylistByServiceId: function(salonId, serviceId, callback) {
      var uri = APIURI + 'branch/' + salonId + '/teams';
      return this.postJSON(uri, { service_id: serviceId}, callback, {type: 'GET'});
    },

    findOpeningHours: function(salonId, callback) {
      var uri = APIURI + 'branch/' + salonId + '/availability';
      return this.postJSON(uri, {}, callback);
    },
  });

  return AppModelSalon;
});