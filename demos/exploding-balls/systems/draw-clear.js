exports.name = 'draw-clear';
exports.reqs = ['ctx-2d'];
exports.action = function(pkt, keys, ctxs) {
  var ctx2d = ctxs[keys[0]];
  ctx2d.ctx.clearRect(0, 0, ctx2d.cvs.width, ctx2d.cvs.height);
}
