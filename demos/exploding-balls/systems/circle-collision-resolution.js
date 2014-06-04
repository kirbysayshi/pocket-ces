// This one is configurable.

module.exports = function(preserveInertia, damping) {
  var name = 'circle-collision-resolution';
  var reqs = ['radius', 'verlet-position', 'collision-information', 'collidable-group-a'];
  return { name: name, reqs: reqs, action: action }

  function action(pkt, entities, circles, positions, detectionData) {

    var handled = {};
    var dataA;
    var entityA, entityB;

    for (var i = 0; i < entities.length; i++) {
      entityA = entities[i];
      dataA = detectionData[entityA.id];

      for (var j = 0; j < dataA.collidingWith.length; j++) {
        entityB = dataA.collidingWith[j];

        if (handled[entityA.id + '::' + entityB.id]) continue;
        handled[entityA.id + '::' + entityB.id] = true;

        resolve(
          positions[entityA.id],
          positions[entityB.id],
          circles[entityA.id],
          circles[entityB.id]
        );
      }
    }
  }

  function resolve(posA, posB, radA, radB) {
    // Calculate X velocities.
    var v1x = posA.cpos.x - posA.ppos.x;
    var v2x = posB.cpos.x - posB.ppos.x;

    // Calculate Y velocities.
    var v1y = posA.cpos.y - posA.ppos.y;
    var v2y = posB.cpos.y - posB.ppos.y;

    var x = posA.cpos.x - posB.cpos.x;
    var y = posA.cpos.y - posB.cpos.y;

    var length2 = x*x + y*y;
    var length = Math.sqrt(length2);
    var target = radA.rad + radB.rad;
    var factor = (length - target) / length;

    // Move a away.
    posA.cpos.x -= x * factor * 0.5;
    posA.cpos.y -= y * factor * 0.5;

    // Move b away.
    posB.cpos.x += x * factor * 0.5;
    posB.cpos.y += y * factor * 0.5;

    if (preserveInertia) {

      // Correct the previous position to compensate.
      var f1 = (damping * (x * v1x + y * v1y)) / length2;
      var f2 = (damping * (x * v2x + y * v2y)) / length2;

      v1x += f2 * x - f1 * x;
      v2x += f1 * x - f2 * x;
      v1y += f2 * y - f1 * y;
      v2y += f1 * y - f2 * y;

      posA.ppos.x = posA.cpos.x - v1x;
      posA.ppos.y = posA.cpos.y - v1y;
      posB.ppos.x = posB.cpos.x - v2x;
      posB.ppos.y = posB.cpos.y - v2y;
    }
  }
}