(function() {
  
  // Edit by c9 ide

  /**
   * spaceJS class, core to manager loading require file
   */
  var spaceJS = function() {
    this._funcs = [];
    this._imports = {};
    this._required = [];
  };

  /**
   * import function, use when need import a namespace or class
   * 
   * @param {Function}
   *            func import function.
   * @param {namespaceJS}
   *            context namespace need import.
   * @param {String}
   *            name name of object need import to store in importObj.
   * @param {String}
   *            stringName fullName of object need import.
   */
  spaceJS.prototype.import = function(func, context, name, stringName) {
    this.run(func, context, name, stringName);
    this.save(func, context, name, stringName);
  };

  spaceJS.prototype.save = function(func, context, name, stringName) {
    var args = Array.prototype.slice.call(arguments, 0);
    args.splice(0, 2);
    if (!context) {
      context = window;
    }
    this._imports[stringName] = {
      func : func,
      context : context,
      params : args
    };
  };

  spaceJS.prototype.define = function(stringName) {
    var importObj = this._imports[stringName];
    if (importObj) {
      importObj['func'].apply(importObj.context, importObj.params);
    }
  };

  spaceJS.prototype.run = function(func, context) {
    var args = Array.prototype.slice.call(arguments, 0);
    args.splice(0, 2);
    if (!context) {
      context = window;
    }
    var notloadPath = this._getUnImportPaths(0);
    var loadingPath = this._getUnImportPaths(1);
    if (notloadPath.length || loadingPath.length) {
      this._funcs.push({
        func : func,
        context : context,
        params : args
      });
    } else {
      return func.apply(context, args);
    }
    return context;
  };

  spaceJS.prototype.push = function(path, config) {
    this._required.push({
      loaded : 0,
      path : path
    });
    this.load();
  };

  spaceJS.prototype._getUnImportPaths = function(number) {

    var unloadList = _.where(this._required, {
      loaded : number
    });
    return _.pluck(unloadList, 'path') || [];
  };

  spaceJS.prototype._setImportPaths = function(paths, number) {
    _.each(this._required, function(pathObj) {
      if (_.indexOf(paths, pathObj.path) >= 0) {
        pathObj.loaded = number;
      }
    }, this);
  };

  spaceJS.prototype.load = function(callback) {

    var notloadPaths = this._getUnImportPaths(0);
    var loadingPaths = this._getUnImportPaths(1);
    if (notloadPaths.length) {
      this._setImportPaths(notloadPaths, 1);
      require(notloadPaths, _.bind(function() {

        this._setImportPaths(notloadPaths, 2);
        this.load(callback);
      }, this));
    } else if (loadingPaths.length) {
      _.defer(_.bind(function() {
        this.load(callback);
      }, this));
    } else {
      _.each(this._funcs, function(funcObj) {
        funcObj['func'].apply(funcObj.context, funcObj.params);
      }, this);
      this._load(callback);
    }
  };

  spaceJS.prototype._load = function(callback) {
    if (_.isFunction(callback)) {

      callback();
    }
  };

  spaceJS.prototype.evi = function(obj) {
    require.config(obj);
  };

  spaceJS.prototype.wrap = function(fct) {
    for ( var property in fct) {
      if (fct.hasOwnProperty(property) && _.isFunction(fct[property])
          && property != 'clone') {
        var func = fct[property].clone();
        var args1 = [ func, fct ];
        fct[property] = _.bind(function(argus) {
          var args2 = Array.prototype.slice.call(arguments, 0);
          args2.splice(0, 1);
          var args = argus.concat(args2);
          return this.run.apply(this, args);
        }, this);
        fct[property] = _.partial(fct[property], args1);
      }
    }
    return fct;
  };

  var SpaceJS = new spaceJS();

  /**
   * NameSpace Function
   * 
   * @param {String}
   *            ns_string full name of namespace.
   * @return {Global} return a namespaceJS object.
   */
  this.namespace = function(ns_string) {
    var parts = ns_string.split('.'), parent = this, i;
    // strip redundant leading global
    for (i = 0; i < parts.length; i += 1) {
      // create a property if it doesn't exist
      if (typeof parent[parts[i]] === 'undefined') {
        parent[parts[i]] = new namespaceJS(parts[i]);
        parent[parts[i]].ns = parent;
      }
      parent = parent[parts[i]];
    }
    return parent;
  };

  var namespaceJS = function(name) {
    this.type = 'namespace';
    this.name = name;
    this.config = {};
    this.importObj = {};
  };

  namespaceJS.prototype.getFullName = function() {
    if (_.isFunction(this.ns.getFullName)) {
      return this.ns.getFullName() + '.' + this.name;
    }
    return this.name;
  };

  namespaceJS.prototype.config = function(path) {
    if (_.isObject(path)) {
      _.extend(this.config, path);
    } else {
      SpaceJS.push(path, this.config);
    }
    return this;
  };

  namespaceJS.prototype.import = function(obj) {
    _.each(obj, function(value, name) {
      var stringName = value;
      if (_.isObject(value)) {
        stringName = value.name;
        if (value.path) {
          SpaceJS.push(value.path, this.config);
        }
      }

      SpaceJS.import(this._import, this, name, stringName);
    }, this);
    return this;
  };

  namespaceJS.prototype._import = function(name, stringName) {
    this.importObj[name] = namespace(stringName);
  };

  namespaceJS.prototype.define = function(classDfObj) {
    SpaceJS.run(this._define, this, classDfObj);
    return this;
  };

  namespaceJS.prototype._define = function(classDfObj) {
    _.extend(classDfObj.prototype, {
      ns : this,
      import : this.importObj
    });

    var name = classDfObj.objectName;
    this[name] = classDfObj;
    var classFullName = this.getFullName() + '.' + name;
    SpaceJS.define(classFullName);

    return this;
  };

  namespaceJS.prototype._run = function(name, func, agrs, obj) {
    obj = obj || {};
    if (_.isObject(agrs)) {
      obj = _.extend(agrs, obj);
      agrs = [];
    }
    var runer = (new this[name](obj));
    if (func && _.isFunction(runer[func])) {
      agrs = agrs || [];
      runer[func].apply(runer, agrs);
    }
  };

  namespaceJS.prototype.run = function(name, func, agrs, obj) {

    SpaceJS.load(_.bind(function() {
      this._run(name, func, agrs, obj);
    }, this));
    return this;
  };

  namespaceJS.prototype.evi = function(obj) {
    _.each(obj.paths, function(value, key) {
      SpaceJS.push(key, this.config);
    }, this);

    SpaceJS.evi(obj);
    return this;
  };

  Function.prototype.clone = function() {
    var fct = this;
    var clone = function() {
      return fct.apply(this, arguments);
    };
    if (fct.prototype) {
      clone.prototype = _.clone(fct.prototype);
    }
    for ( var property in fct) {
      if (fct.hasOwnProperty(property) && property !== 'prototype') {
        clone[property] = fct[property];
      }
    }
    return clone;
  };

  /**
   * Class Define Function
   * 
   * @param {String}
   *            className name of Class (short name).
   * @return {classJS} return a classJS obj.
   */
  this.clazz = function(className) {
    var classJSObj = classJS.clone();
    classJSObj.objectName = className;
    classJSObj = SpaceJS.wrap(classJSObj);
    return classJSObj;
  };

  var classJS = function() {
    this._____init.apply(this, arguments);
  };

  classJS.prototype._____init = function() {
  };
  classJS.extend = function(extend) {
    var extendObj = namespace(extend);
    if (_.isFunction(extendObj.extend)) {
      extendObj = extendObj.extend(this.prototype);
    } else {
      _.extend(extendObj.prototype, this.prototype);
    }
    this.prototype = extendObj.prototype;
    _.extend(this, extendObj);
    this.prototype._____init = extendObj;
    return this;
  };

  classJS.body = function(obj) {
    _.extend(this.prototype, obj);
    return this;
  };

}).call(this);
