exports.name = 'circle-collision-detection';
exports.reqs = ['radius', 'verlet-position', 'collision-information', 'collidable-group-a'];
exports.action = function action(pkt, keys, circles, positions, detectionData) {
  var i, j, keyA, keyB, circleA, circleB, positionA, positionB, dataA, dataB;

  // Reset... super inefficient.
  for(i = 0; i < keys.length; i++) {
    keyA = keys[i];
    dataA = detectionData[keyA];
    dataA.isColliding = false;
    dataA.collidingWith = [];
  }

  for(i = 0; i < keys.length; i++) {
    keyA = keys[i];
    circleA = circles[keyA];
    positionA = positions[keyA];
    dataA = detectionData[keyA];

    for(j = i+1; j < keys.length; j++) {
      keyB = keys[j];
      circleB = circles[keyB];
      positionB = positions[keyB];
      dataB = detectionData[keyB];

      if (
        circleOverlap(positionA.cpos.x, positionA.cpos.y, circleA.rad,
          positionB.cpos.x, positionB.cpos.y, circleB.rad)
      ) {
        dataA.isColliding = dataB.isColliding = true;
        dataA.collidingWith.push(keyB);
        dataB.collidingWith.push(keyA);
      }
    }
  }
}

function circleOverlap(ax, ay, arad, bx, by, brad) {
  var x = bx - ax;
  var y = by - ay;
  var rad = arad + brad;
  return x*x + y*y < rad*rad;
}
