namespace('APP.Views').define(clazz('MainView').extend('Backbone.View').body({
  initialize : function() {
    console.log('init');
  },
  render : function() {
    this.$el.append('This is mainView');
    return this;
  }
}));
