exports.name = 'drawable-circle';
exports.reqs = ['radius', 'verlet-position', 'health'];
exports.action = function action(pkt, keys, circles, positions, health) {

  // We need this for side effects, but not for the initial system query.
  var ctx2d = pkt.firstData('ctx-2d')

  for (var i = 0, len = keys.length, key, circle, position; i < len; i++) {
    key = keys[i];
    circle = circles[key];
    position = positions[key];

    var h = health[key];

    ctx2d.ctx.fillStyle = 'hsla(0, 100%, 0%, ' + (h.health / h.maxHealth) + ')';
    ctx2d.ctx.strokeStyle = 'black';
    ctx2d.ctx.beginPath();
    ctx2d.ctx.arc(position.cpos.x, position.cpos.y, circle.rad, 0, Math.PI*2, false);
    ctx2d.ctx.stroke();
    ctx2d.ctx.fill();
    ctx2d.ctx.closePath();
  }
}
