exports.name = 'circle-collision-detection';
exports.reqs = ['radius', 'verlet-position', 'collision-information', 'collidable-group-a'];
exports.action = function action(pkt, entities, circles, positions, detectionData) {
  var i, j, entityA, entityB, circleA, circleB, positionA, positionB, dataA, dataB;

  // Reset... super inefficient.
  for(i = 0; i < entities.length; i++) {
    entityA = entities[i];
    dataA = detectionData[entityA.id];
    dataA.isColliding = false;
    dataA.collidingWith = [];
  }

  for(i = 0; i < entities.length; i++) {
    entityA = entities[i];
    circleA = circles[entityA.id];
    positionA = positions[entityA.id];
    dataA = detectionData[entityA.id];

    for(j = i+1; j < entities.length; j++) {
      entityB = entities[j];
      circleB = circles[entityB.id];
      positionB = positions[entityB.id];
      dataB = detectionData[entityB.id];

      if (
        circleOverlap(positionA.cpos.x, positionA.cpos.y, circleA.rad,
          positionB.cpos.x, positionB.cpos.y, circleB.rad)
      ) {
        dataA.isColliding = dataB.isColliding = true;
        dataA.collidingWith.push(entityB);
        dataB.collidingWith.push(entityA);
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