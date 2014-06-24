var System = require('./system');
var Entity = require('./entity');

function Pocket() {
  this.componentTypes = {};

  this.systems = [];
  this.components = {};
  this.entities = {};

  this.idCounter = 0;

  this.entityIdsToDestroy = {};

  this.indexedData = this.indexedData.bind(this)
}

Pocket.prototype.nextId = function() {
  return this.idCounter++;
}

Pocket.prototype.tick = function(dt) {

  // Actually destroy queued entities, to avoid undefined components
  // during the tick in which they are destroyed.
  var self = this;
  Object.keys(this.entityIdsToDestroy).forEach(function(id) {
    self.immediatelyDestroyEntityById(id);
    delete self.entityIdsToDestroy[id];
  })

  this.dt = dt;

  for (var i = 0; i < this.systems.length; i++) {

    var system = this.systems[i];

    // datas contain all entities that have any of the names, not
    // an intersection.
    var datas = system.requiredComponents.map(this.indexedData)

    // entities is an intersection.
    var entities = this.entitiesMatching.apply(this, system.requiredComponents);

    // No data matches this system's requirements.
    if (!entities.length && system.requiredComponents.length > 0) continue;

    // Prepare to be used as arguments.
    datas.unshift(entities);
    datas.unshift(this);
    system.action.apply(system, datas);
  }
}

Pocket.prototype.sysFromObj = function(obj) {

  // Allow a system to operate on each individual entity instead of the
  // collection of entities to save on boilerplate.
  if (obj.actionEach) {
    obj.action = function(pkt, entities) {
      var args = [].slice.call(arguments);
      var components = args.slice(0);
      var entity;

      for(var i = 0; i < entities.length; i++) {
        entity = entities[i];
        args[1] = entity;

        for (var j = 2; j < components.length; j++) {
          args[j] = components[j][entity.id];
        }

        obj.actionEach.apply(this, args);
      }
    }
  }

  return this.systems.push(new System(obj.name, obj.reqs, obj.action));
}

Pocket.prototype.cmp =
Pocket.prototype.component = function(name, initializer) {
  this.componentTypes[name] = initializer;
}

Pocket.prototype.entity = function(id, componentsValues) {
  if (!id) {
    id = this.nextId();
  }

  var entity = this.entities[id];

  if (!entity) {
    entity
      = this.entities[id]
      = new Entity(id);

    Object.keys(componentsValues).forEach(function(cmpName) {
      this.addComponentToEntity(id, cmpName, componentsValues[cmpName]);
    }, this)
  }

  return entity;
}

Pocket.prototype.destroyEntityById = function(id) {
  this.entityIdsToDestroy[id] = true;
}

Pocket.prototype.immediatelyDestroyEntityById = function(id) {
  var self = this;
  var found = this.entities[id];

  if (!found) {
    throw new Error('Entity with id ' + id + ' already destroyed');
  }

  delete this.entities[id];

  Object.keys(this.components).forEach(function(name) {
    delete self.components[name][id];
  })
}

Pocket.prototype.addComponentToEntity = function(id, componentName, opt_props) {
  var entity = this.entities[id];
  if (!entity) {
    throw new Error('Could not find entity with id "' + id + '"');
  }

  var initializer = this.componentTypes[componentName];

  // this.components['verlet-position'][id] = { cpos: ..., ppos: ..., ... }

  var others = this.components[componentName]
    || (this.components[componentName] = {});

  var cmp = others[id];

  if (!cmp) {
    cmp = others[id] = {};

    if (initializer) {
      initializer(cmp, opt_props || {})
    } else {
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

Pocket.prototype.dataFor = function(entity, name) {
  return this.components[name][entity.id];
}

Pocket.prototype.firstEntity = function(name1, name2, nameN) {
  for (var i = 0, args = []; i < arguments.length; i++) args[i] = arguments[i];
  var entities = this.entitiesMatching.apply(this, args);
  return entities[0];
}

Pocket.prototype.entitiesMatching = function(name1, name2, nameN) {
  var self = this;
  var all = {};
  var args = [];

  for (var i = 0; i < arguments.length; i++) {
    args[i] = arguments[i];
    var others = this.components[arguments[i]];
    if (!others) continue;

    Object.keys(others).forEach(function(id) {
      all[id] = (all[id] || 0) + 1;
    })
  }

  return Object.keys(all).filter(function(id) {
    return all[id] === args.length;
  }).map(function(id) {
    return self.entities[id];
  })
}

module.exports = Pocket;