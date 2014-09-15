
var v2 = require('../../v2');

// You could put all of these into separate files, but it's not entirely
// worth it since you'd be duplicating the name of each in the file
// and the call itself.

module.exports = function(p) {

  p.cmpType('verlet-position', function(cmp, opts) {
    cmp.cpos = v2(opts.x || 0, opts.y || 0);
    cmp.ppos = v2(opts.x || 0, opts.y || 0);
    cmp.acel = opts.acel
      ? opts.acel
      : v2(0, 0);
  })

  p.cmpType('radius', function(cmp, opts) {
    cmp.rad = opts.rad || 5;
  })

  p.cmpType('ctx-2d', function(cmp, opts) {
    cmp.cvs = document.querySelector(opts.cvs || '#c');
    cmp.ctx = cmp.cvs.getContext('2d');
  })

  p.cmpType('health', function(cmp, opts) {
    var h = 200;
    cmp.health = opts.health || h;
    cmp.maxHealth = opts.maxHealth || opts.health || h;
  })

  // Simply a tag?
  p.cmpType('collidable-group-a', function() {});

  p.cmpType('collision-information', function(cmp) {
    cmp.isColliding = false;
    cmp.collidingWith = {};
  })

  p.cmpType('timed-life', function(cmp, opts) {
    cmp.lifespan = opts.lifespan || 200; // ticks
    cmp.livedFor = opts.livedFor || 0;
  })

  p.cmpType('emits-death-particles', function(cmp, opts) {
    cmp.count = opts.count || 25;
    cmp.force = opts.force || 2;
  })

  p.cmpType('particle-explosion-fragment', function() {});

  p.cmpType('keyboard-state', function(cmp, opts) {
    var target = opts.target || document;
    target.addEventListener('keydown', keydown, false)
    target.addEventListener('keyup', keyup, false)

    cmp.down = {};

    function keydown(e) {
      cmp.down[e.which] = true;
    }

    function keyup(e) {
      cmp.down[e.which] = false;
    }
  })
}
