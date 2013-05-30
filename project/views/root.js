var Views = Views || {};
Views.Root = Backbone.View.extend({
  initialize : function() {
    this.render();
  },
  render : function() {
    this.$el.append('hello jsLoader');
    return this;
  }
});