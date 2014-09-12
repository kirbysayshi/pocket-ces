var System = require('./system');

function Pocket() {
  this.componentTypes = {};

  this.systems = [];
  this.components = {};
  this.keys = {};
  this.labels = {};

  this.idCounter = 0;

  this.keysToDestroy = {};

  this.indexedData = this.indexedData.bind(this);
}

Pocket.prototype.nextId = function() {
  return ++this.idCounter;
}

Pocket.prototype.tick = function(dt) {

  // Actually destroy queued keys, to avoid undefined components
  // during the tick in which they are destroyed.
  var self = this;
  Object.keys(this.keysToDestroy).forEach(function(id) {
    self.immediatelyDestroykey(id);
    delete self.keysToDestroy[id];
  })

  this.dt = dt;

  for (var i = 0; i < this.systems.length; i++) {

    var system = this.systems[i];

    // datas contain all keys that have any of the names, not
    // an intersection.
    var datas = system.requiredComponents.map(this.indexedData)

    // keys is an intersection.
    var keys = this.keysMatching.apply(this, system.requiredComponents);

    // No data matches this system's requirements.
    if (!keys.length && system.requiredComponents.length > 0) continue;

    // Prepare to be used as arguments.
    datas.unshift(keys);
    datas.unshift(this);
    system.action.apply(system, datas);
  }
}

Pocket.prototype.system = function(name, requirements, fn) {
  return this.systems.push(new System(name, requirements, fn));
}

// Allow a system to operate on each individual key instead of the
// collection of keys to save on boilerplate.

Pocket.prototype.systemForEach = function(name, requirements, fn) {
  var action = fn;
  fn = function(pkt, keys) {
    for (var i = 0, args = []; i < arguments.length; i++) args[i] = arguments[i];
    var components = args.slice(0);
    var key;

    for(var i = 0; i < keys.length; i++) {
      key = keys[i];
      args[1] = key;

      for (var j = 2; j < components.length; j++) {
        args[j] = components[j][key];
      }

      action.apply(this, args);
    }
  }

  return this.systems.push(new System(name, requirements, fn));
}

Pocket.prototype.cmp =
Pocket.prototype.component = function(name, initializer) {
  this.componentTypes[name] = typeof initializer == 'object'
    ? initializer
    : {
      init: initializer,
      dalloc: function() {},
      malloc: function() { return {} }
    };
}

Pocket.prototype.key = function(componentsValues) {

  // if id is passed in and exists, warn and create a new id.
  // if id is passed in and does not exist, use it.

  var id = componentsValues.id
    ? componentsValues.id
    : this.nextId();

  if (componentsValues.id && this.keys[componentsValues.id]) {
    console.warn('discarding component id ' + componentsValues.id);
    id = this.nextId();
  }

  this.keys[id] = id;

  Object.keys(componentsValues).forEach(function(cmpName) {
    this.addComponentTokey(id, cmpName, componentsValues[cmpName]);
  }, this)

  return id;
}

Pocket.prototype.destroykey = function(id) {
  this.keysToDestroy[id] = true;
}

Pocket.prototype.immediatelyDestroykey = function(id) {
  var self = this;
  var found = this.keys[id];

  if (!found) {
    throw new Error('key with id ' + id + ' already destroyed');
  }

  delete this.keys[id];

  Object.keys(this.components).forEach(function(name) {
    delete self.components[name][id];
  })
}

Pocket.prototype.addComponentTokey = function(id, componentName, opt_props) {
  var key = this.keys[id];
  if (!key) {
    throw new Error('Could not find key with id "' + id + '"');
  }

  // this.components['verlet-position'][id] = { cpos: ..., ppos: ..., ... }

  var others = this.components[componentName]
    || (this.components[componentName] = {});

  var cmp = others[id];

  if (!cmp) {
    cmp = others[id] = {};

    var componentDef = this.componentTypes[componentName];

    if (componentDef) {
      componentDef.init(cmp, opt_props || {})
    } else if (!this.labels[componentName]) {
      this.labels[componentName] = true;
      console.log('Found no component initializer for '
        + '"' + componentName + '"'
        + ', assuming it is a label.');
    }
  }
}

Pocket.prototype.indexedData = function(name) {
  return this.components[name] || {};
}

Pocket.prototype.firstData = function(name) {
  var data = this.components[name] || {};
  return data[Object.keys(data)[0]];
}

Pocket.prototype.dataFor = function(id, name) {
  return this.components[name][id];
}

Pocket.prototype.firstkey = function(name1, name2, nameN) {
  for (var i = 0, args = []; i < arguments.length; i++) args[i] = arguments[i];
  var keys = this.keysMatching.apply(this, args);
  return keys[0];
}

Pocket.prototype.keysMatching = function(name0, nameN) {

  var matching = [];

  var table0 = this.components[name0];
  if (!table0) return matching;

  var ids = Object.keys(table0);
  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    var found = true;
    for (var j = 1; j < arguments.length; j++) {
      var name = arguments[j];
      var tableN = this.components[name];
      if (!tableN || !tableN[id]) {
        found = false;
        break;
      }
    }
    if (found) {
      matching.push(this.keys[id]);
    }
  }

  return matching;
}

module.exports = Pocket;
