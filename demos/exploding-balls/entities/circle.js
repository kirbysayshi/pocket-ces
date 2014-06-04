module.exports = function(pkt, x, y, rad) {
  return pkt.entity(null, {
    'verlet-position': { x: x, y: y },
    'radius': { rad: 20 },
    'collidable-group-a': null,
    'collision-information': null,
    'health': null,
    'emits-death-particles': { count: 5, force: 15 }
  })
}