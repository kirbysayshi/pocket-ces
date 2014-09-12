module.exports = function(pkt) {

  var size = 10;

  return pkt.key({
    'ship': null,
    'human-controlled-01': null,
    'verlet-position': {
      x: pkt.firstData('ctx-2d').center.x,
      y: pkt.firstData('ctx-2d').center.y
    },
    'rotation': { rate: 0.1 },
    'thrust': null,
    'drag': null,
    'projectile-launcher': { launchForce: 10 },
    'point-shape': { points: [
      { x: size, y: 0 },
      { x: -size, y: -size / 2 },
      { x: -size, y:  size / 2 }
    ]},
    'bbox': null
  })
}
