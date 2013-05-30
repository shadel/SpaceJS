JS.def('root', {
  need : [ 'views/root' ],
  view : {
    className : 'Root',
    options : {
      $el : $('body')
    }
  },
  load : {
    name : 'view',
    path : 'view'
  }
});