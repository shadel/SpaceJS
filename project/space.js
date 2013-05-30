(function() {

  /**
   * loaderJS class, core to manager loading require file
   */
  var loaderJS = function() {
    this._funcs = [];
    this._imports = {};
    this._required = [];
  };

  /**
   * import function, use when need import a namespace or class
   * 
   * @param {Function}
   *            func import function
   * @param {namespaceJS}
   *            context namespace need import
   * @param {String}
   *            name name of object need import to store in importObj
   * @param {String}
   *            stringName fullName of object need import
   */
  loaderJS.prototype.import = function(func, context, name, stringName) {
    this.run(func, context, name, stringName);
    this.save(func, context, name, stringName);
  };

  loaderJS.prototype.save = function(func, context, name, stringName) {
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

  loaderJS.prototype.define = function(stringName) {
    var importObj = this._imports[stringName];
    if (importObj) {
      importObj['func'].apply(importObj.context, importObj.params);
    }
  };

  loaderJS.prototype.run = function(func, context) {

    var args = Array.prototype.slice.call(arguments, 0);
    args.splice(0, 2);
    if (!context) {
      context = window;
    }
    if (this._required.length) {
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

  loaderJS.prototype.push = function(path, config) {
    this._required.push({
      loaded : false,
      path : path
    });
    this.load();
  };

  loaderJS.prototype._getUnImportPaths = function() {

    var unloadList = _.where(this._required, {
      loaded : false
    });
    return _.pluck(unloadList, 'path');
  };

  loaderJS.prototype._setImportPaths = function(paths) {
    _.each(this._required, function(pathObj) {
      if (_.indexOf(paths, pathObj.path) >= 0) {
        pathObj.loaded = true;
      }
    }, this);
  };

  loaderJS.prototype.load = function(callback) {
    try {

      var paths = this._getUnImportPaths();
      if (paths.length) {
        require(paths, _.bind(function() {

          _.each(this._funcs, function(funcObj) {
            funcObj['func'].apply(funcObj.context, funcObj.params);
          }, this);
          this._setImportPaths(paths);
          this.load(callback);
        }, this));
      } else {
        this._load(callback);
      }
    } catch (e) {
      console.log(e);
    }
  };

  loaderJS.prototype._load = function(callback) {
    if (_.isFunction(callback)) {
      callback();
    }
  };

  loaderJS.prototype.evi = function(obj) {
    require.config(obj);
  };

  loaderJS.prototype.wrap = function(fct) {
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

  var LoaderJS = new loaderJS();

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
      LoaderJS.push(path, this.config);
    }
    return this;
  };

  namespaceJS.prototype.import = function(obj) {
    _.each(obj, function(value, name) {
      var stringName = value;
      if (_.isObject(value)) {
        stringName = value.name;
        if (value.path) {
          LoaderJS.push(value.path, this.config);
        }
      }

      LoaderJS.import(this._import, this, name, stringName);
    }, this);
    return this;
  };

  namespaceJS.prototype._import = function(name, stringName) {
    this.importObj[name] = namespace(stringName);
  };

  namespaceJS.prototype.define = function(classDfObj) {
    LoaderJS.run(this._define, this, classDfObj);
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
    LoaderJS.define(classFullName);

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

    LoaderJS.load(_.bind(function() {
      this._run(name, func, agrs, obj);
    }, this));
    return this;
  };

  namespaceJS.prototype.evi = function(obj) {
    _.each(obj.paths, function(value, key) {
      LoaderJS.push(key, this.config);
    }, this);

    LoaderJS.evi(obj);
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
    classJSObj = LoaderJS.wrap(classJSObj);
    classJSObj.objectName = className;
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
