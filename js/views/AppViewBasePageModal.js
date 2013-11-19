
// Filename: views/project/list
// Filename: views/project/list
define(function(require) {
  
  var $       = require('jquery'),
  _           = require('underscore'),
  Backbone    = require('backbone'),
  AppViewBase = require('views/AppViewBase'),
  Ractive     = require('ractive');
  
  return AppViewBasePageModal = AppViewBase.extend({
    className: 'app-modal-container',
    initialize: function() {
      //AppViewBase.prototype.initialize.call(this);
      if(this.modalId == undefined) {
        this.modalId = this.className + '-' + new Date().getTime();
      }
      console.log("W", this.modalId);
      _.bindAll(this, "createModal");
      _.bindAll(this, "addRactiveEvents");
      _.bindAll(this, "whenRactiveComplete");
    },
    
    whenRactiveComplete: function(initOnly) {
      var self = this;
      this.pubsub.once("rhtml:complete", function(){
        setTimeout(function() { window.scrollTo(0, 1) }, 10);
        
        //self.$el.fadeIn().animate({top: 0}, 400,function(){
          //self.$el.find('header.navbar').addClass('navbar-fixed-top');
          if(initOnly == undefined || initOnly === false) {
            if(self.parent != undefined) {
              self.parent.$el.hide(); 
            } else {
              $('#app-container').hide(); 
            }
            self.$el.find('header.navbar').addClass('navbar-fixed-top');
            self.$el.show().removeClass('moving-from-bottom');
          }
          
          
          //});
        
      });
      
        
    },
    
    createModal: function(cb, initializeOnly) {
      var self = this;
      if(cb == undefined) cb = $.noop;
      
      var self = this;
      
      if(initializeOnly != undefined && initializeOnly === true) {
        initClass = 'vhide';
        init = true;
      } else {
        initClass = '';
        init = false;
      } 
      console.log('ss', self.modalId, self.$el, initializeOnly, initClass);
      
      $('body').append('<div id="'+self.modalId+'" class="'+initClass+'"></div>')
        .promise()
        .done(function(){
          self.setElement('#' + self.modalId);
          
          self.whenRactiveComplete(init);
          
          //self.opts.el = '#' + self.modalId;
          self.setRHTML(self.opts.template, self.opts);
          self.addRactiveEvents();
          
          cb();
        });
      return this;
    },
    
    close: function() {
      this.cleanup(true);
    },
    
    show: function() {
      var self = this;
      var el = $('#' + this.modalId);
      el.removeClass('vhide').show();
      el.find('header.navbar').addClass('navbar-fixed-top');
      
      if(self.parent != undefined) {
        self.parent.$el.hide(); 
      } else {
        $('#app-container').hide(); 
      }
    },
    
    hide: function() {
      var el = $('#' + this.modalId);
      el.hide();
      el.find('header.navbar').removeClass('navbar-fixed-top');
      
      
    },
    hideModal: function() {
      var self = this;
      
      this.hide();  
      if(self.parent != undefined) {
        console.log("self.parent hideModal", self.parent);
        self.parent.$el.show(); 
      } else {
        $('#app-container').show(); 
      }
      
    },
    
    addRactiveEvents: function() {
      var self = this;
      var ractive = this.rhtml;
      ractive.on('closeModal', function(){
        self.closeModal();
      });
      
      ractive.on('hideModal', function(){
        self.hideModal();
      });
    },

    /*
      @params cb Run after the cleanup event. it will ensure that the modal close before doing something
      // example testcase i want to close modal and open antoher modal so the operation would best implemented inside the callback
    */
    closeModal: function(cb) {
      var self = this;
      console.log('closeModl', self.parent);
      var closeAction = function() {}
      if( cb != undefined) {
        closeAction = cb;
      } else {
        if(self.parent != undefined) {

          //has parent
          if(self.parent.modalId != undefined) {
            closeAction = function() {
              self.parent.show();
            }
          } else {
            closeAction = function() {
              self.parent.$el.show();
            }
          }
          //has parent
          
        } else {
          closeAction = function() {
            $('#app-container').show(); 
          }
        }
      }

      self.cleanup(true, function() {
        closeAction();
      }); 
    }

  });
});