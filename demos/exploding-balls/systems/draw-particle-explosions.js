exports.name = 'draw-particle-explosions';
exports.reqs = ['verlet-position', 'timed-life', 'particle-explosion-fragment'];
exports.action = function action(pkt, entities, positions, timedLife) {

  // We need this for side effects, but not for the initial system query.
  var ctx2d = pkt.firstData('ctx-2d');

  for (var i = 0, len = entities.length; i < len; i++) {
    var e = entities[i];
    var position = positions[e.id];
    var life = timedLife[e.id];

    ctx2d.ctx.fillStyle = 'hsla(0, 100%, 0%, ' + Math.max(0, 1 - (life.livedFor / life.lifespan)) + ')';
    ctx2d.ctx.beginPath();
    ctx2d.ctx.arc(position.cpos.x, position.cpos.y, 1, 0, Math.PI*2, false);
    ctx2d.ctx.fill();
    ctx2d.ctx.closePath();
  }
}