Bibliography
============

Readings
--------

- http://t-machine.org/index.php/2007/09/03/entity-systems-are-the-future-of-mmog-development-part-1/
- http://www.gamedev.net/page/resources/_/technical/game-programming/case-study-bomberman-mechanics-in-an-entity-component-system-r3159
- http://t-machine.org/index.php/2013/05/30/designing-bomberman-with-an-entity-system-which-components/
- http://c0de517e.blogspot.com/2014/06/where-is-my-c-replacement.html
- http://research.scee.net/files/presentations/gcapaustralia09/Pitfalls_of_Object_Oriented_Programming_GCAP_09.pdf
- http://home.comcast.net/~tom_forsyth/blog.wiki.html#[[Data%20Oriented%20Luddites]]
- http://erich.realtimerendering.com/ptinpoly/
- http://www.ecse.rpi.edu/~wrf/Research/Short_Notes/pnpoly.html
- http://en.wikipedia.org/wiki/Asteroids_%28video_game%29#mediaviewer/File:Asteroi1.png
- https://github.com/rolandpoulter/js-entity-components
- https://github.com/adamgit/Entity-System-RDBMS-Beta--Java-
- http://entity-systems-wiki.t-machine.org/artemis-entity-system-framework#artemis
- http://entity-systems-wiki.t-machine.org/fast-entity-component-system
- http://gamedevs.org/uploads/data-driven-game-object-system.pdf
- http://blog.gemserk.com/2012/01/03/reusing-artemis-entities-by-enabling-disabling-and-storing-them/
- http://piemaster.net/2011/07/entity-component-artemis/

Surveyed Component Entity System Modules
----------------------------------------

- github.com/rolandpoulter/js-entity-components
  > strange that the list of entities isn't managed by the
- https://www.npmjs.org/package/aranna
  > Signals for entities being created, components being added, etc.
- https://www.npmjs.org/package/bindlestiff
  > sets properties on the entities themselves
- https://www.npmjs.org/package/cem
  > some magic happening with event handlers
- https://github.com/qiao/ces.js
  > inspired aranna, nearly the same?
- https://www.npmjs.org/package/ces-game-engine
  > no docs, no git repo
- https://github.com/Malharhak/Entities
  > no docs, apparently does something with mysql
- https://github.com/frerom/gast
  > absolutely incomplete
- https://www.npmjs.org/package/lite-engine
  > custom getters for all component properties `Position.get(id, 'x')`. Includes system priority. Incorporates viewport and gameloop.
- https://github.com/odogono/elsinore-nodejs
  > Built in serialization? No README. Global dependency on _. Uses Backbone!?
- https://github.com/MCluck90/psykick2d
  > full engine, with pixi.js. Each system inherits from a type of System (BehaviorSystem). Strange extraction of specific components: https://github.com/MCluck90/psykick2d/blob/master/examples/pong/js/player-input.js#L15
- https://www.npmjs.org/package/sentai
  > deals mostly with reactive updates to value changes, not systems
- https://github.com/zeekay/sente
  > does nothing, incomplete
