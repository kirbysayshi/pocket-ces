exports.name = 'timed-life';
exports.reqs = ['timed-life'];
exports.actionEach = function(pkt, key, t) {
  t.livedFor += 1;

  // greater-than to ensure it lives for the full duration.
  if (t.livedFor > t.lifespan) {
    pkt.destroyKey(key);
  }
}
