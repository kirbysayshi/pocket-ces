
var Pocket = require('../../');

var p = new Pocket();
require('./components/')(p);

var CIRCLE_DAMPING = 0.99;

p.sysFromObj(require('./systems/timed-life'));

p.sysFromObj(require('./systems/verlet-accelerate'))
p.sysFromObj(require('./systems/gravity-well'))

p.sysFromObj(require('./systems/circle-collision-detection'))

p.sysFromObj(require('./systems/collision-health'))
p.sysFromObj(require('./systems/emits-particles-on-death'))

p.sysFromObj(require('./systems/circle-collision-resolution')(false, CIRCLE_DAMPING))
p.sysFromObj(require('./systems/verlet-inertia'))
p.sysFromObj(require('./systems/circle-collision-resolution')(true, CIRCLE_DAMPING))

p.sysFromObj(require('./systems/draw-clear'))
p.sysFromObj(require('./systems/draw-circle'))
p.sysFromObj(require('./systems/draw-particle-explosions'))

var CircleEntity = require('./entities/circle');

var c1 = CircleEntity(p, 50, 50, 30);
var c2 = CircleEntity(p, 150, 50, 30);
var c3 = CircleEntity(p, 250, 50, 30);

// Create the "singleton" entity for managing our context.
p.entity(null, { 'ctx-2d': null })


p.tick(16);

window.p = p;
