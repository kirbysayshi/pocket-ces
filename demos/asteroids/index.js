
var v2 = require('../v2');
var Pocket = require('../../');

var p = new Pocket();

///////////////////////////////////////////////////////////////////////////////
// Components
///////////////////////////////////////////////////////////////////////////////

// Keep in mind this is just the component (data) that provides the 2d
// context, not the entity that can be manipulated or used in systems.
p.cmp('ctx-2d', function(cmp, opts) {
  cmp.cvs = document.querySelector(opts.cvs || '#c');
  cmp.ctx = cmp.cvs.getContext('2d');
  cmp.center = v2();
  // Ensure it's always as big as possible...
  window.addEventListener('resize', (function resize() {
    cmp.cvs.width = document.body.clientWidth;
    cmp.cvs.height = document.body.clientHeight;
    cmp.width = cmp.cvs.width;
    cmp.height = cmp.cvs.height;
    cmp.center.x = cmp.cvs.width / 2;
    cmp.center.y = cmp.cvs.height / 2;
    return resize;
  }()))
})

p.cmp('game-config', function(cmp, opts) {
  cmp.MAX_POINTS_PER_ASTEROID_SHAPE = opts.MAX_POINTS_PER_ASTEROID_SHAPE || 10;
  cmp.MIN_POINTS_PER_ASTEROID_SHAPE = opts.MIN_POINTS_PER_ASTEROID_SHAPE || 10;
  cmp.MAX_ASTEROID_RADIUS = opts.MAX_ASTEROID_RADIUS || 60;
  cmp.MIN_ASTEROID_RADIUS = opts.MIN_ASTEROID_RADIUS || 20;
  cmp.INITIAL_ASTEROID_DISTANCE = opts.INITIAL_ASTEROID_DISTANCE || 100;

  // This one may change over the course of our game to increase difficulty...
  cmp.maxAsteroids = opts.maxAsteroids || 5;
  cmp.asteroidSpeed = opts.asteroidSpeed || 2;
})

// This is a little weird, since it mutates itself! But it has to due to the
// DOM event model. Otherwise we'd never know the state of keys.
p.cmp('keyboard-state', function(cmp, opts) {
  var target = opts.target || document;
  target.addEventListener('keydown', keydown, false)
  target.addEventListener('keyup', keyup, false)

  cmp.down = {};

  function keydown(e) {
    var named = opts.named[e.which];
    cmp.down[e.which] = true;
    if (named && !cmp.down[named]) {
      cmp.down[named] = Date.now();
    }
  }

  function keyup(e) {
    var named = opts.named[e.which];
    cmp.down[e.which] = false;
    if (named) {
      cmp.down[named] = 0;
    }
  }
})

p.cmp('verlet-position', function(cmp, opts) {
  cmp.cpos = v2(opts.x || 0, opts.y || 0);
  cmp.ppos = v2(opts.x || 0, opts.y || 0);
  cmp.acel = opts.acel
    ? opts.acel
    : v2(0, 0);
})

p.cmp('point-shape', function(cmp, opts) {
  // points are expected to be {x, y} objects, like verlet-positions
  cmp.points = opts.points || [];
  // These are simply here as a preallocation, since they'll be used
  // often and there is no need to garbage collect them each time. It's
  // expected that each time they are requred, they are updated manually.
  cmp.worldXS = new Array(cmp.points.length)
  cmp.worldYS = new Array(cmp.points.length);
})

p.cmp('bbox', function(cmp, opts) {
  cmp.width = 0;
  cmp.height = 0;
  cmp.upperLeft = v2();
  cmp.lowerRight = v2();
})

p.cmp('rotation', function(cmp, opts) {
  cmp.angle = opts.angle || 0;
  cmp.rate = opts.rate || 0;
})

p.cmp('thrust', function(cmp, opts) {
  cmp.force = opts.force || 1;
})

p.cmp('drag', function(cmp, opts) {
  cmp.percentage = opts.percentage || 0.99;
})

p.cmp('projectile-launcher', function(cmp, opts) {
  cmp.launchForce = opts.launchForce || 1;
})

///////////////////////////////////////////////////////////////////////////////
// Starting Entities
///////////////////////////////////////////////////////////////////////////////

// The queryable entity to grab the component that holds the canvas/2d context.
p.entity(null, { 'ctx-2d': null })

// The defaults are fine, but we could override the game configuration if
// stress testing.
p.entity(null, { 'game-config': null })

// Configure our primary input, the keyboard. Other components, such as mouse,
// could be added here to create a complete input entity.
p.entity(null, {
  'input': null,
  'keyboard-state': {
    named: {
      27: 'HALT',
      32: 'SHOOT',
      37: 'LEFT',
      39: 'RIGHT',
      38: 'UP'
    }
  }
})

// Our ship!
p.entity(null, {
  'ship': null,
  'human-controlled-01': null,
  'verlet-position': {
    x: p.firstData('ctx-2d').center.x,
    y: p.firstData('ctx-2d').center.y
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

///////////////////////////////////////////////////////////////////////////////
// Systems For The Components
///////////////////////////////////////////////////////////////////////////////

p.sysFromObj({
  name: 'input-thrust',
  reqs: ['verlet-position', 'rotation', 'thrust', 'human-controlled-01'],
  actionEach: function(pkt, entity, position, rotation, thrust) {
    var input = pkt.firstData('keyboard-state');

    if (input.down.UP) {
      var x = Math.cos(rotation.angle) * thrust.force;
      var y = Math.sin(rotation.angle) * thrust.force;
      position.acel.x += x;
      position.acel.y += y;
    }
  }
})

p.sysFromObj({
  name: 'input-shoot',
  reqs: ['verlet-position', 'rotation', 'projectile-launcher', 'human-controlled-01'],
  actionEach: function(pkt, entity, position, rotation, launcher) {
    var input = pkt.firstData('keyboard-state');
    var config = pkt.firstData('game-config');

    var now = Date.now();
    var timePressed = now - input.down.SHOOT;

    if (input.down.SHOOT && timePressed > 0 && timePressed < 16) {
      var x = Math.cos(rotation.angle) * launcher.launchForce;
      var y = Math.sin(rotation.angle) * launcher.launchForce;

      var size = 2;
      var projectile = p.entity(null, {
        'projectile': null,
        'rotation': null,
        'verlet-position': {
          x: position.cpos.x,
          y: position.cpos.y,
          acel: v2(x, y)
        },
        'point-shape': { points: [
          { x: size, y: 0 },
          { x: 0, y: size },
          { x: -size, y: 0 },
          { x: 0, y: -size }
        ]},
        'bbox': null
      });
    }
  }
})

p.sysFromObj({
  name: 'drag',
  reqs: ['verlet-position', 'drag'],
  actionEach: function(pkt, entity, position, drag) {
    var x = (position.ppos.x - position.cpos.x) * (drag.percentage);
    var y = (position.ppos.y - position.cpos.y) * (drag.percentage);
    position.ppos.x = position.cpos.x + x;
    position.ppos.y = position.cpos.y + y;
  }
})

p.sysFromObj({
  name: 'input-rotation',
  reqs: ['rotation', 'human-controlled-01'],
  actionEach: function(pkt, entity, rotation) {
    var input = pkt.firstData('keyboard-state');

    if (input.down.RIGHT) {
      rotation.angle += rotation.rate;
    } else if (input.down.LEFT) {
      rotation.angle -= rotation.rate;
    }
  }
})

p.sysFromObj({
  name: 'verlet-accelerate',
  reqs: ['verlet-position'],
  actionEach: function(pkt, entity, cmp) {
    // apply acceleration to current position, convert dt to seconds
    cmp.cpos.x += cmp.acel.x * pkt.dt * pkt.dt * 0.001;
    cmp.cpos.y += cmp.acel.y * pkt.dt * pkt.dt * 0.001;

    // reset acceleration
    v2.set(cmp.acel, 0, 0);
  }
})

p.sysFromObj({
  name: 'verlet-inertia',
  reqs: ['verlet-position'],
  actionEach: function(pkt, entity, cmp) {
    var x = cmp.cpos.x*2 - cmp.ppos.x
      , y = cmp.cpos.y*2 - cmp.ppos.y;

    v2.set(cmp.ppos, cmp.cpos.x, cmp.cpos.y);
    v2.set(cmp.cpos, x, y);
  }
})

p.sysFromObj({
  name: 'point-shape-bounding-box-provider',
  reqs: ['point-shape', 'verlet-position', 'bbox'],
  actionEach: function(pkt, entity, shape, position, bbox) {

    var point;
    var maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
    var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE;

    for (var i = 0; i < shape.points.length; i++) {
      point = shape.points[i];
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
    }

    bbox.width = maxX - minX;
    bbox.height = maxY - minY;
    bbox.upperLeft.x = minX;
    bbox.upperLeft.y = minY;
    bbox.lowerRight.x = maxX;
    bbox.lowerRight.y = maxY;
  }
})

p.sysFromObj({
  name: 'bbox-world-wrap',
  reqs: ['bbox', 'verlet-position'],
  actionEach: function(pkt, entity, bbox, position) {
    var ctx = pkt.firstData('ctx-2d');

    var epsilon = 2;

    var top = position.cpos.y + bbox.lowerRight.y + epsilon < 0;
    var right = position.cpos.x - bbox.upperLeft.x - epsilon > ctx.width;
    var bottom = position.cpos.y - bbox.upperLeft.y - epsilon > ctx.height;
    var left = position.cpos.x + bbox.lowerRight.x + epsilon < 0;

    if (top) {
      // Teleport to bottom.
      position.cpos.y += ctx.height + bbox.height;
      position.ppos.y += ctx.height + bbox.height;
      return;
    }

    if (right) {
      // Teleport to left.
      position.cpos.x -= ctx.width - bbox.width/2;
      position.ppos.x -= ctx.width - bbox.width/2;
      return;
    }

    if (bottom) {
      // Teleport to top.
      position.cpos.y -= ctx.height - bbox.height/2;
      position.ppos.y -= ctx.height - bbox.height/2;
      return;
    }

    if (left) {
      // Teleport to right.
      position.cpos.x += ctx.width + bbox.width/2;
      position.ppos.x += ctx.width + bbox.width/2;
      return;
    }
  }
})

p.sysFromObj({
  name: 'initial-asteroid-generation',
  reqs: [],
  action: function(pkt) {

    var config = pkt.firstData('game-config');
    var entities = pkt.entitiesMatching('point-shape', 'asteroid');
    var center = p.firstData('ctx-2d').center;
    var diff = config.maxAsteroids - entities.length;

    while (diff > 0) {
      diff--;

      // Make more asteroids! This could be a function in the event that
      // asteroids must be created in more than one place.

      var PI2 = Math.PI*2;
      var points = [];
      var numPoints = Math.max(
        config.MIN_POINTS_PER_ASTEROID_SHAPE,
        Math.random() * config.MAX_POINTS_PER_ASTEROID_SHAPE);
      for (var i = 0; i < numPoints; i++) {
        var radius = Math.max(config.MIN_ASTEROID_RADIUS,
            Math.random() * config.MAX_ASTEROID_RADIUS);
        points.push({
          x: radius * Math.cos(i/numPoints * PI2),
          y: radius * Math.sin(i/numPoints * PI2)
        })
      }

      var acelX = config.asteroidSpeed * Math.cos( Math.random()*PI2 )
      var acelY = config.asteroidSpeed * Math.sin( Math.random()*PI2 )

      var x = center.x + (config.INITIAL_ASTEROID_DISTANCE * Math.cos(diff / config.maxAsteroids * PI2));
      var y = center.y + (config.INITIAL_ASTEROID_DISTANCE * Math.sin(diff / config.maxAsteroids * PI2));

      pkt.entity(null, {
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
  }
})

function pnpoly(nvert, vertx, verty, testx, testy) {
  var i, j, c = 0;
  for (i = 0, j = nvert-1; i < nvert; j = i++) {
    if ( ((verty[i]>testy) != (verty[j]>testy)) &&
   (testx < (vertx[j]-vertx[i]) * (testy-verty[i]) / (verty[j]-verty[i]) + vertx[i]) )
       c = !c;
  }
  return c;
}

function testPointShapeCollision(shapeA, positionA, shapeB, positionB) {
  var isWithin = false;

  for (var i = 0; i < shapeA.points.length; i++) {
    isWithin = isWithin || pnpoly(
      shapeB.points.length,
      shapeB.worldXS, shapeB.worldYS,
      shapeA.points[i].x + positionA.cpos.x,
      shapeA.points[i].y + positionA.cpos.y
    )

    if (isWithin) break;
  }

  for (var i = 0; i < shapeB.points.length; i++) {
    isWithin = isWithin || pnpoly(
      shapeA.points.length,
      shapeA.worldXS, shapeA.worldYS,
      shapeB.points[i].x + positionB.cpos.x,
      shapeB.points[i].y + positionB.cpos.x
    )

    if (isWithin) break;
  }

  return isWithin;
}

function precomputeWorldCoordinates(shape, position) {
  for (var i = 0; i < shape.points.length; i++) {
    var point = shape.points[i];

    // Optimize access to all the x components and all the ys,
    // and precompute the "absolute" or world coordinates of all
    // the relative points.
    shape.worldXS[i] = point.x + position.cpos.x;
    shape.worldYS[i] = point.y + position.cpos.y;
  }
}

p.sysFromObj({
  name: 'asteroid-ship-collider',
  reqs: ['point-shape', 'verlet-position', 'asteroid'],
  action: function(pkt, entities, shapes, positions) {
    var ship = pkt.firstEntity('ship');
    var shipShape = pkt.dataFor(ship, 'point-shape');
    var shipPos = pkt.dataFor(ship, 'verlet-position');
    precomputeWorldCoordinates(shipShape, shipPos);

    var asteroid, shape, position;
    var isWithin = false;

    for (var i = 0; i < entities.length; i++) {
      asteroid = entities[i];
      shape = shapes[asteroid.id];
      position = positions[asteroid.id];
      precomputeWorldCoordinates(shape, position);

      isWithin = testPointShapeCollision(shape, position, shipShape, shipPos);

      if (isWithin) break;
    }

    if (isWithin) {
      console.log('ship is colliding with an asteroid!');
    }
  }
})

p.sysFromObj({
  name: 'asteroid-projectile-collider',
  reqs: ['point-shape', 'verlet-position', 'asteroid'],
  action: function(pkt, entities, shapes, positions) {

    var projectiles = pkt.entitiesMatching('point-shape', 'verlet-position', 'projectile');

    var asteroid, shape, position;
    var projectile, projectileShape, projectilePosition;
    var isHit;

    for (var i = 0; i < entities.length; i++) {
      isHit = false;
      asteroid = entities[i];
      shape = shapes[asteroid.id];
      position = positions[asteroid.id];
      precomputeWorldCoordinates(shape, position);

      for (var j = 0; j < projectiles.length; j++) {
        projectile = projectiles[j];
        projectileShape = shapes[projectile.id];
        projectilePosition = positions[projectile.id];
        precomputeWorldCoordinates(projectileShape, projectilePosition);

        isHit = testPointShapeCollision(projectileShape, projectilePosition, shape, position);

        if (isHit) break;
      }

      if (isHit) {
        pkt.destroyEntityById(asteroid.id);
        pkt.destroyEntityById(projectile.id);
      }
    }
  }
})

p.sysFromObj({
  name: 'render-clear-canvas',
  reqs: ['ctx-2d'],
  actionEach: function(pkt, entity, cmp) {
    cmp.ctx.clearRect(0, 0, cmp.width, cmp.height);
  }
})

p.sysFromObj({
  name: 'render-point-shape',
  reqs: ['verlet-position', 'point-shape', 'rotation'],
  action: function(pkt, entities, positions, shapes, rotations) {
    var ctx2d = pkt.firstData('ctx-2d')

    for (var i = 0; i < entities.length; i++) {
      var e = entities[i];
      var position = positions[e.id];
      var shape = shapes[e.id];
      var rotation = rotations[e.id];

      ctx2d.ctx.save();
      ctx2d.ctx.translate(position.cpos.x, position.cpos.y);
      ctx2d.ctx.rotate(rotation.angle);
      ctx2d.ctx.beginPath();
      for (var j = 0; j < shape.points.length; j++) {
        var point = shape.points[j];
        if (j == 0) {
          ctx2d.ctx.moveTo(point.x, point.y);
        } else {
          ctx2d.ctx.lineTo(point.x, point.y);
        }
      }
      ctx2d.ctx.lineTo(shape.points[0].x, shape.points[0].y);
      ctx2d.ctx.stroke();
      ctx2d.ctx.restore();
    }
  }
})

p.tick(16);

window.p = p;
p.go = function() {
  (function yeah() { p.tick(16); requestAnimationFrame(yeah) }())
}
