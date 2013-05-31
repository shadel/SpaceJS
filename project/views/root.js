var Views = Views || {};
console.log('aaaaa');
Views.Root = Backbone.View.extend({
	initialize: function(){
		this.render();
	},
	render: function(){
		this.$el.append('hello jsLoader');
		return this;
	}
});