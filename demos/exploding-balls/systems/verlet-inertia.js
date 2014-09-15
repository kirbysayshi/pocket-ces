var v2 = require('../../v2');

exports.name = 'verlet-inertia';
exports.reqs = ['verlet-position'];
exports.actionEach = function(pkt, key, cmp) {
  var x = cmp.cpos.x*2 - cmp.ppos.x
    , y = cmp.cpos.y*2 - cmp.ppos.y;

  v2.set(cmp.ppos, cmp.cpos.x, cmp.cpos.y);
  v2.set(cmp.cpos, x, y);
}
