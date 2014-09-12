module.exports = function(cmp, opts) {
  cmp.MAX_POINTS_PER_ASTEROID_SHAPE = 10;
  cmp.MIN_POINTS_PER_ASTEROID_SHAPE = 10;
  cmp.MAX_ASTEROID_RADIUS = 60;
  cmp.MIN_ASTEROID_RADIUS = 20;
  cmp.INITIAL_ASTEROID_DISTANCE = 500;

  // This one may change over the course of our game to increase difficulty...
  cmp.maxAsteroids = opts.maxAsteroids || 5;
  cmp.asteroidSpeed = opts.asteroidSpeed || 2;
}
