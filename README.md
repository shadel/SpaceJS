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


Feature
=====

I. Namespace
=====
1.Create a namespace

     namespace('APP');
    
2.Load config

     namespace('APP').
      config();
    
3.Load eviroment

     namespace('APP').
      evi({});
    
4.Import class or namespace from other js file

     namespace('APP').
      import({});
    
5.Define a Class in namespace

     namespace('APP').
      define();
    
6.Run a class in namespace

     namespace('APP').
      run();
    
II. Class
=====

1.Create a class

     clazz('APP');
    
2.Extend a class

     clazz('APP').extend();
    
3.Set body of class

     clazz('APP').body({});
    
