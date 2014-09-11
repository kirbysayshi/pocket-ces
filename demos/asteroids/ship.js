module.exports = function(pkt) {

  return pkt.entity({
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
      { x: 10, y: 0 },
      { x: -10, y: -5 },
      { x: -10, y:  5 }
    ]},
    'bbox': null
  })
}
