exports.name = 'collision-health';
exports.reqs = ['health', 'collision-information', 'collidable-group-a'];
exports.actionEach = function action(pkt, e, h, cdata) {
  var others = cdata.collidingWith;
  for (var j = 0; j < others.length; j++) {
    h.health -= 1;
  }

  if (h.health <= 0) {
    pkt.destroyEntityById(e.id);
  }
}
