var v2 = require('../v2');

module.exports = function(pkt, x, y, numParticles, force) {

  var theta;
  var forceX, forceY
  var acel;

  for (var i = 0; i < numParticles; i++) {
    theta = Math.PI * 2 * (i / numParticles);
    forceX = force - (Math.random() * force * 5/6);
    forceY = force - (Math.random() * force * 5/6);
    acel = v2(Math.cos(theta) * forceX, Math.sin(theta) * forceY);

    pkt.entity(null, {
      'verlet-position': { x: x, y: y, acel: acel },
      'timed-life': { lifespan: 240 },
      'particle-explosion-fragment': null
    })
  }
}