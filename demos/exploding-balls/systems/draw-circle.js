exports.name = 'drawable-circle';
exports.reqs = ['radius', 'verlet-position', 'health'];
exports.action = function action(pkt, entities, circles, positions, health) {

  // We need this for side effects, but not for the initial system query.
  var ctx2d = pkt.dfcn('ctx-2d');
  ctx2d = ctx2d[Object.keys(ctx2d)[0]];

  for (var i = 0, len = entities.length, e, circle, position; i < len; i++) {
    e = entities[i];
    circle = circles[e.id];
    position = positions[e.id];

    var h = health[e.id];

    ctx2d.ctx.fillStyle = 'hsla(0, 100%, 0%, ' + (h.health / h.maxHealth) + ')';
    ctx2d.ctx.strokeStyle = 'black';
    ctx2d.ctx.beginPath();
    ctx2d.ctx.arc(position.cpos.x, position.cpos.y, circle.rad, 0, Math.PI*2, false);
    ctx2d.ctx.stroke();
    ctx2d.ctx.fill();
    ctx2d.ctx.closePath();
  }
}