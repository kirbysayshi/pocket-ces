var v2 = require('../v2');

module.exports = function(pkt, x, y) {

  var config = pkt.firstData('game-config');
  var minRadius = config.MIN_ASTEROID_RADIUS;
  var maxRadius = config.MAX_ASTEROID_RADIUS;
  var PI2 = Math.PI*2;
  var numPoints = Math.max(
    config.MIN_POINTS_PER_ASTEROID_SHAPE,
    Math.random() * config.MAX_POINTS_PER_ASTEROID_SHAPE);
  var acelX = config.asteroidSpeed * Math.cos( Math.random()*PI2 )
  var acelY = config.asteroidSpeed * Math.sin( Math.random()*PI2 )


  var points = [];

  for (var i = 0; i < numPoints; i++) {
    var radius = Math.max(minRadius,
        Math.random() * maxRadius);
    points.push({
      x: radius * Math.cos(i/numPoints * PI2),
      y: radius * Math.sin(i/numPoints * PI2)
    })
  }

  return pkt.entity({
    'asteroid': null,
    'verlet-position': {
      x: x,
      y: y,
      acel: v2(acelX, acelY) },
    'point-shape': { points: points },
    'bbox': null,
    'rotation': null
  })
}
