var v2 = require('../../v2');

exports.name = 'verlet-accelerate';
exports.reqs = ['verlet-position'];
exports.actionEach = function(pkt, key, cmp) {
  // apply acceleration to current position, convert dt to seconds
  cmp.cpos.x += cmp.acel.x * pkt.dt * pkt.dt * 0.001;
  cmp.cpos.y += cmp.acel.y * pkt.dt * pkt.dt * 0.001;

  // reset acceleration
  v2.set(cmp.acel, 0, 0);
}
