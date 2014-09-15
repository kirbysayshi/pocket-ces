module.exports = function(pkt, x, y, rad) {
  return pkt.key({
    'verlet-position': { x: x, y: y },
    'radius': { rad: 20 },
    'collidable-group-a': null,
    'collision-information': null,
    'health': null,
    'emits-death-particles': { count: 50, force: 15 }
  })
}
