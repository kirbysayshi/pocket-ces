exports.name = 'draw-clear';
exports.reqs = ['ctx-2d'];
exports.action = function(pkt, entities, ctxs) {
  var ctx2d = ctxs[entities[0].id];
  ctx2d.ctx.clearRect(0, 0, ctx2d.cvs.width, ctx2d.cvs.height);
}