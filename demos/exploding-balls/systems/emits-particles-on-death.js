var TimedParticleExplosionEntities = require('../entities/timed-particle-explosion-entities');

exports.name = 'emits-particles-on-death';
exports.reqs = ['verlet-position', 'health', 'emits-death-particles'];
exports.actionEach = function(pkt, entity, position, h, pdata) {
  if (h.health <= 0) {
    // TODO: I don't like how this calls an entity helper since it
    // creates a weird interdependency... perhaps there is another way.
    TimedParticleExplosionEntities(pkt, position.cpos.x, position.cpos.y, pdata.count, pdata.force);
  }
}
