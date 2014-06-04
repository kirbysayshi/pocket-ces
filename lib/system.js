function System(name, requiredComponents, action) {
  this.name = name;
  this.action = action;
  this.requiredComponents = requiredComponents;
}

module.exports = System;