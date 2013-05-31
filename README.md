SpaceJS
=======

This is a JS framework, define a new function to create application by js

Init
======

Require file:
- [UnderscroreJS][1]
- [RequireJS][2]

  [1]: http://underscorejs.org      "UnderscroreJS"
  [2]: http://requirejs.org         "RequireJS"


TIP:

- Import file space.js to your index.html
- Import app.js (your main file)


Using
=====

In app.js

    namespace('APP').
        config({}).
        evi({}).
        import({}).
        defined(
            clazz('root').
            body({
                run: function(){
                    alert('hello Space JS');
                }
            })
        ).
        run('root', 'run');




