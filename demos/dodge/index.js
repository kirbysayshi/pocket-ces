var Pocket = require("../../lib/pocket");
var p = new Pocket();

//
// components
//
p.cmpType('ctx', function(cmp, opts) {

  // a little css
  var style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode("html,body {width: 100%; height: 100%} * { margin: 0; padding: 0 }"));
  document.head.appendChild(style);

  // setup the canvas
  cmp.cvs = document.createElement('canvas');
  cmp.ctx = cmp.cvs.getContext('2d');
  document.body.appendChild(cmp.cvs);

  // super hd awesome canvas
  var width  = window.innerWidth;
  var height = window.innerHeight;

  var dpr = window.devicePixelRatio || 1,
      bsr = cmp.ctx.webkitBackingStorePixelRatio ||
      cmp.ctx.mozBackingStorePixelRatio    ||
      cmp.ctx.msBackingStorePixelRatio     ||
      cmp.ctx.oBackingStorePixelRatio      ||
      cmp.ctx.backingStorePixelRatio       ||
      1;

  var ratio = dpr / bsr;

  if (dpr !== bsr) {

    cmp.cvs.width  = width * ratio;
    cmp.cvs.height = height * ratio;

    cmp.cvs.style.width  = (width) + "px";
    cmp.cvs.style.height = (height) + "px";

    cmp.cvs.getContext('2d').scale(ratio,ratio);
  }

  cmp.center = {
    x: (dpr !== bsr) ? cmp.cvs.width / 4  : cmp.cvs.width / 2,
    y: (dpr !== bsr) ? cmp.cvs.height / 4 : cmp.cvs.height / 2
  }

});

p.cmpType('input-manager', function(cmp, opts) {

  cmp.pressed = {};
  document.addEventListener("keydown", keydown, false);
  document.addEventListener("keyup", keyup, false);

  function keydown(ev) {
    cmp.pressed[ev.keyCode] = true;
  }
  function keyup(ev) {
    cmp.pressed[ev.keyCode] = false;
  }

});

p.cmpType('position', function(cmp, opts) {
  cmp.pos = {
    x: opts.x || p.firstData('ctx').center.x,
    y: opts.y || p.firstData('ctx').center.y
  };
  cmp.vel = {x: 0, y: 0};
  cmp.acc = {x: 0, y: 0};
});

p.cmpType('shape', function(cmp, opts) {
  cmp.width = opts.width || 20;
  cmp.height = opts.height || 100;
});

p.cmpType('color', function(cmp, opts) {
  cmp.fillStyle = opts.color || "#333333";
});

p.cmpType('thrust', function(cmp, opts) {
  cmp.value = opts.accel || 0.002;
});

//
// keys
//

// rendering context and DOM setup
p.key({ 'ctx' : null });

// player 1
p.key({
  'color': { color: '#00bfff' },
  'input-manager' : null,
  'position': { x : 20 },
  'shape' : null,
  'thrust' : null,
  'player-controlled' : null
});

// player 2
p.key({
  'color': { color: "#ffb05c" },
  'input-manager' : null,
  'position': { x : ((p.firstData('ctx').cvs.width/2) - 40) },
  'shape' : null,
  'thrust' : null,
  'player-controlled' : null
});

//
// systems
//
p.sysFromObj({
  name : 'input-accelerate',
  reqs :['position', 'thrust', 'player-controlled'],
  action : function(pkt, keys, positions, thrusts) {

    var player1 = keys[0],
        player2 = keys[1],
        input = pkt.firstData('input-manager');

    // up - w
    if (input.pressed[87]) {
      positions[player1].acc.y = -thrusts[player1].value;
    }

    // down - s
    else if (input.pressed[83]) {
      positions[player1].acc.y = thrusts[player1].value;
    }

    // left - a
    else if (input.pressed[65]) {
      positions[player1].acc.x = -thrusts[player1].value;
    }

    // right - d
    else if (input.pressed[68]) {
      positions[player1].acc.x = thrusts[player1].value;
    }
    else {
      positions[player1].vel.x = 0;
      positions[player1].vel.y = 0;
      positions[player1].acc.x = 0;
      positions[player1].acc.y = 0;
    }

    // up - i
    if (input.pressed[73]) {
      positions[player2].acc.y = -thrusts[player2].value;
    }

    // down - k
    else if (input.pressed[75]) {
      positions[player2].acc.y = thrusts[player2].value;
    }

    // left - j
    else if (input.pressed[74]) {
      positions[player2].acc.x = -thrusts[player2].value;
    }

    // right - l
    else if (input.pressed[76]){
      positions[player2].acc.x = thrusts[player2].value;
    }
    else {
      positions[player2].vel.x = 0;
      positions[player2].acc.x = 0;
      positions[player2].vel.y = 0;
      positions[player2].acc.y = 0;
    }

  }
});

// update positions based on accels
p.sysFromObj({
  name : 'handle-movement',
  reqs : ['position'],
  actionEach : function(pkt, keys, pos) {
    pos.vel.y += pos.acc.y * pkt.dt;
    pos.vel.x += pos.acc.x * pkt.dt;
    pos.pos.y += pos.acc.y * Math.pow(pkt.dt,2) + pos.vel.y * pkt.dt;
    pos.pos.x += pos.acc.x * Math.pow(pkt.dt,2) + pos.vel.x * pkt.dt;
  }
});

// check bounds and 'bounce' if bounds hit
p.sysFromObj({
  name : 'physics-bounds-check',
  reqs : ['position', 'shape'],
  actionEach : function(pkt, keys, position, shape) {
    var cmp = pkt.firstData('ctx'),
      max_width = cmp.cvs.width / 2,
      max_height = cmp.cvs.height / 2;

    if ((position.pos.x + shape.width) >= max_width) {
      position.pos.x = max_width - shape.width - 1;
      position.vel.x *= -0.5;
    }

    if (position.pos.x <= 0) {
      position.pos.x = 1;
      position.vel.x *= -0.5;
    }

    if ((position.pos.y + shape.height) >= max_height) {
      position.pos.y = max_height - shape.height - 1;
      position.vel.y *= -0.5;
    }

    if (position.pos.y <= 0) {
      position.pos.y = 1;
      position.vel.y *= -0.5;
    }

  }
});

// must clear canvas here, otherwise not every object will show
p.sysFromObj({
  name : 'renderer-clear',
  reqs : ['ctx'],
  actionEach : function(pkt, entity, cmp) {
    cmp.ctx.clearRect(0,0, cmp.cvs.width, cmp.cvs.height);
  }
});

p.sysFromObj({
  name : 'renderer-draw',
  reqs : ['position', 'shape', 'color'],
  actionEach : function(pkt, keys, position, shape, color) {
    var c = pkt.firstData('ctx');

    c.ctx.beginPath();
    c.ctx.fillStyle = color.fillStyle;
    c.ctx.fillRect(position.pos.x, position.pos.y, shape.width, shape.height);
    c.ctx.closePath();
  }
});

p.tick(16);

(function num1() {
  requestAnimationFrame(num1);
  p.tick(16);
})();
