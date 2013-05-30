namespace('APP').import({
  mainView : {
    name : 'APP.Views.MainView',
    path : 'main'
  }
}).define(clazz('view').extend('Backbone.View').body({
  initialize : function() {
    console.log('init');
  },
  render : function() {
    this.$el.append('Hello Namespace JS');
    var main = new this.import.mainView();
    this.$el.append(main.render().el);
  }
}));
