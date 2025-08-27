import { BaseLevel } from './baseLevel.js';
import { Obstacle } from '../obstacle.js';
import { Goomba } from '../entities/goomba.js';
import { isColliding, isLandingOn } from '../../collision.js';
import { JUMP_VELOCITY } from '../config.js';

// Tile identifiers inspired by tylerreichle/mario_js.
// 0 = empty, 1 = ground, 2 = platform, 3 = thorn, 4 = moon milk, 5 = enemy
// 6 = star collectible, 7 = checkpoint, 8 = rainbow portal (finish),
// 9 = seed wall (destroyable with shield)
const TILE = {
  EMPTY: 0,
  GROUND: 1,
  PLATFORM: 2,
  THORN: 3,
  MOON_MILK: 4,
  GOOMBA: 5,
  STAR: 6,
  CHECKPOINT: 7,
  PORTAL: 8,
  SEED_WALL: 9,
};

// Two dimensional map describing the level layout. Each number
// corresponds to a tile type defined above. The first row is the
// ground and subsequent rows stack upwards.
// The map is programmatically generated to provide a long progressive
// level with a hidden star path, a central checkpoint and a rainbow
// portal at the end.
const MAP_WIDTH = 240; // ~120 seconds at move speed ~2
const ground = Array(MAP_WIDTH).fill(TILE.GROUND);
const row1 = Array(MAP_WIDTH).fill(TILE.EMPTY);
const row2 = Array(MAP_WIDTH).fill(TILE.EMPTY);

// Ability section - small platforms to practice jumping
for (let c = 10; c < 20; c += 2) row1[c] = TILE.PLATFORM;

// Secret star path high in the sky
for (let c = 30; c < 35; c++) row2[c] = TILE.STAR;

// Challenge obstacles
[60, 90, 130, 170, 210].forEach(c => (row1[c] = TILE.GOOMBA));
[70, 100, 160, 190].forEach(c => (row1[c] = TILE.THORN));
row1[125] = TILE.MOON_MILK;
row1[150] = TILE.SEED_WALL;

// Central checkpoint
row1[120] = TILE.CHECKPOINT;

// Final rainbow portal
row1[MAP_WIDTH - 5] = TILE.PORTAL;

const MAP = [ground, row1, row2];

class Platform extends Obstacle {
  constructor(x, y, size) {
    super(x, y, size, size);
    this.type = 'platform';
  }
}

class Thorn extends Obstacle {
  constructor(x, groundY, size) {
    // Thorns are two tiles tall and rest on the ground
    super(x, groundY - size, size, size * 2);
    this.type = 'thorn';
  }
}

class MoonMilk extends Obstacle {
  constructor(x, y, size) {
    super(x, y, size, size);
    this.type = 'moonmilk';
  }
}

class SeedWall extends Obstacle {
  constructor(x, y, size) {
    super(x, y, size, size);
    this.type = 'seedWall';
  }
}

class Star extends Obstacle {
  constructor(x, y, size) {
    super(x, y, size, size);
    this.type = 'star';
  }
}

class Checkpoint extends Obstacle {
  constructor(x, groundY, size) {
    super(x, groundY - size / 2, size, size);
    this.type = 'checkpoint';
  }
}

class Portal extends Obstacle {
  constructor(x, groundY, size) {
    super(x, groundY - size, size, size * 2);
    this.type = 'portal';
  }
}

// Level 3 - Unicornolandia converted to a tile-based platform section
export class Level3 extends BaseLevel {
  constructor(game, random = Math.random) {
    super(game, random);
    this.game.player.maxJumps = 2;
    this.map = MAP;
    this.tileSize = 1; // world units per tile
    this.distance = 0;
    this.levelLength = this.map[0].length * this.tileSize;
    this.platforms = [];
    this.thorns = [];
    this.moonMilks = [];
    this.seedWalls = [];
    this.enemies = [];
    this.stars = [];
    this.checkpoint = null;
    this.checkpointReached = false;
    this.portal = null;
    this.generateFromMap();
  }

  // Spawn interval from BaseLevel isn't used anymore but kept for
  // compatibility with existing code paths.
  static getInterval() {
    return Infinity;
  }

  getMoveSpeed() {
    // Slightly increase speed to keep the challenge
    return this.game.speed + 0.2;
  }

  generateFromMap() {
    for (let row = 0; row < this.map.length; row++) {
      const cols = this.map[row];
      for (let col = 0; col < cols.length; col++) {
        const tile = cols[col];
        const x = this.game.worldWidth + col * this.tileSize + this.tileSize / 2;
        const y = this.game.groundY - row * this.tileSize - this.tileSize / 2;
        switch (tile) {
          case TILE.PLATFORM:
            this.platforms.push(new Platform(x, y, this.tileSize));
            break;
          case TILE.THORN:
            this.thorns.push(new Thorn(x, this.game.groundY, this.tileSize));
            break;
          case TILE.MOON_MILK:
            this.moonMilks.push(new MoonMilk(x, y, this.tileSize));
            break;
          case TILE.SEED_WALL:
            this.seedWalls.push(new SeedWall(x, y, this.tileSize));
            break;
          case TILE.GOOMBA:
            // Enemies always spawn on the ground regardless of row
            this.enemies.push(
              new Goomba(x, this.game.groundY - this.tileSize / 2, this.tileSize)
            );
            break;
          case TILE.STAR:
            this.stars.push(new Star(x, y, this.tileSize));
            break;
          case TILE.CHECKPOINT:
            this.checkpoint = new Checkpoint(x, this.game.groundY, this.tileSize);
            break;
          case TILE.PORTAL:
            this.portal = new Portal(x, this.game.groundY, this.tileSize);
            break;
          default:
            break;
        }
      }
    }
    this.obstacles = [
      ...this.platforms,
      ...this.thorns,
      ...this.moonMilks,
      ...this.seedWalls,
      ...this.enemies,
    ];
  }

  update(delta) {
    const move = this.getMoveSpeed() * delta;
    this.distance += move;

    const moveArr = arr => arr.forEach(e => e.update(move));
    moveArr(this.platforms);
    moveArr(this.thorns);
    moveArr(this.moonMilks);
    moveArr(this.seedWalls);
    moveArr(this.stars);
    if (this.checkpoint) this.checkpoint.update(move);
    if (this.portal) this.portal.update(move);
    this.enemies.forEach(e => e.update(move, delta));

    const player = this.game.player;
    const collideArr = arr => {
      for (const e of arr) {
        if (isColliding(player, e)) {
          this.game.gameOver = true;
          return false;
        }
      }
      return true;
    };

    if (!collideArr(this.platforms)) return;
    if (!collideArr(this.thorns)) return;

    // Handle enemy collisions and cull off-screen entities
    this.enemies = this.enemies.filter(e => {
      if (isLandingOn(player, e)) {
        player.vy = JUMP_VELOCITY / 2;
        player.jumping = true;
        player.jumpCount = 1;
        return false;
      }
      if (isColliding(player, e)) {
        this.game.gameOver = true;
        return false;
      }
      return e.x + e.width / 2 > 0;
    });

    this.seedWalls = this.seedWalls.filter(w => {
      if (isColliding(player, w)) {
        if (player.shieldActive) {
          return false;
        }
        this.game.gameOver = true;
        return false;
      }
      return w.x + w.width / 2 > 0;
    });
    this.moonMilks = this.moonMilks.filter(m => {
      if (isColliding(player, m)) {
        if (this.checkpointReached && this.checkpoint) {
          const p = this.game.player;
          p.x = this.checkpoint.x;
          p.y = this.game.groundY - p.height / 2;
          p.vy = 0;
          p.vx = 0;
          p.jumping = false;
          p.jumpCount = 0;
        } else {
          this.game.gameOver = true;
        }
        return false;
      }
      return m.x + m.width / 2 > 0;
    });

    const filterArr = arr => arr.filter(e => e.x + e.width / 2 > 0);
    this.platforms = filterArr(this.platforms);
    this.thorns = filterArr(this.thorns);
    this.stars = this.stars.filter(s => {
      if (isColliding(player, s)) {
        this.game.stars++;
        return false;
      }
      return s.x + s.width / 2 > 0;
    });
    if (
      !this.checkpointReached &&
      this.checkpoint &&
      isColliding(player, this.checkpoint)
    ) {
      this.checkpointReached = true;
    }
    if (this.portal && isColliding(player, this.portal)) {
      this.game.gameOver = true;
      this.game.win = true;
    }
    if (this.checkpoint && this.checkpoint.x + this.checkpoint.width / 2 <= 0) {
      this.checkpoint = null;
    }
    if (this.portal && this.portal.x + this.portal.width / 2 <= 0) {
      this.game.gameOver = true;
      this.game.win = true;
    }
    this.obstacles = [
      ...this.platforms,
      ...this.thorns,
      ...this.moonMilks,
      ...this.seedWalls,
      ...this.enemies,
    ];

    if (this.distance >= this.levelLength && !this.portal) {
      this.game.gameOver = true;
      this.game.win = true;
    }
  }

  setScale(scale) {
    [
      ...this.platforms,
      ...this.thorns,
      ...this.moonMilks,
      ...this.seedWalls,
      ...this.enemies,
      ...this.stars,
    ].forEach(o => o.setScale(scale));
    if (this.checkpoint) this.checkpoint.setScale(scale);
    if (this.portal) this.portal.setScale(scale);
  }
}

export { MAP as LEVEL3_MAP, TILE };

