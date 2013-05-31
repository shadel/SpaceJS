namespace('APP').
    evi({
      paths: {
        jquery: 'lib/jquery-1.9.1.min',
        backbone: 'lib/backbone',
        json2: 'lib/json2'
      },
      shim: {
        backbone: {
          deps: [_, 'jquery'],
          exports: 'Backbone'
        },
        json2: {
          exports: 'JSON'
        }
      }
    }).
    import({
      view: {
        name: 'APP.view',
        path: 'view'
      }
    }).
    define(
    clazz('root').body({
      run: function() {
        var view = new this.import.view({
          el: $('body')
        });
        view.render();
      }
    })).
    run('root', 'run');


