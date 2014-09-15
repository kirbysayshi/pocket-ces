// This one is configurable.

module.exports = function(preserveInertia, damping) {
  var name = 'circle-collision-resolution';
  var reqs = ['radius', 'verlet-position', 'collision-information', 'collidable-group-a'];
  return { name: name, reqs: reqs, action: action }

  function action(pkt, keys, circles, positions, detectionData) {

    var handled = {};
    var dataA;
    var keyA, keyB;

    for (var i = 0; i < keys.length; i++) {
      keyA = keys[i];
      dataA = detectionData[keyA];

      for (var j = 0; j < dataA.collidingWith.length; j++) {
        keyB = dataA.collidingWith[j];

        if (handled[keyA + '::' + keyB]) continue;
        handled[keyA + '::' + keyB] = true;

        resolve(
          positions[keyA],
          positions[keyB],
          circles[keyA],
          circles[keyB]
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
