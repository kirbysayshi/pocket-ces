var v2 = require('../../v2');

exports.name = 'gravity-well';
exports.reqs = ['verlet-position', 'radius'];
exports.action = function(pkt, entities, positions) {

  var ctx2d = pkt.firstData('ctx-2d')
  var center = v2(ctx2d.cvs.width/2, ctx2d.cvs.height/2);
  var dir = v2(0, 0);

  for (var i = 0, len = entities.length, e, cmp; i < len; i++) {
    e = entities[i];
    cmp = positions[e.id];

    v2.sub(dir, center, cmp.cpos)
    v2.normalize(dir, dir);
    v2.scale(dir, dir, 1);
    v2.add(cmp.acel, cmp.acel, dir);
   }
}