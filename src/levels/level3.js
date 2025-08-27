import { BaseLevel } from './baseLevel.js';
import { Obstacle } from '../obstacle.js';
import { Goomba } from '../entities/goomba.js';
import { ShadowCrow } from '../entities/shadowCrow.js';
import { RhombusSprite } from '../entities/rhombusSprite.js';
import { ThornGuard } from '../entities/thornGuard.js';
import { isColliding, isLandingOn } from '../../collision.js';
import { JUMP_VELOCITY } from '../config.js';

// Tile identifiers inspired by tylerreichle/mario_js.
// 0 = empty, 1 = ground, 2 = platform, 3 = pipe, 4 = block, 5 = enemy
// 6 = star collectible, 7 = checkpoint, 8 = rainbow portal (finish)
const TILE = {
  EMPTY: 0,
  GROUND: 1,
  PLATFORM: 2,
  PIPE: 3,
  BLOCK: 4,
  GOOMBA: 5,
  STAR: 6,
  CHECKPOINT: 7,
  PORTAL: 8,
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
[70, 100, 160, 190].forEach(c => (row1[c] = TILE.PIPE));

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

class Pipe extends Obstacle {
  constructor(x, groundY, size) {
    // Pipes are two tiles tall and rest on the ground
    super(x, groundY - size, size, size * 2);
    this.type = 'pipe';
  }
}

class Block extends Obstacle {
  constructor(x, y, size) {
    super(x, y, size, size);
    this.type = 'block';
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
    this.pipes = [];
    this.blocks = [];
    this.enemies = [];
    this.thornWalls = [];
    this.stars = [];
    this.checkpoint = null;
    this.checkpointReached = false;
    this.portal = null;
    this.generateFromMap();
    this.addExclusiveEnemies();
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
          case TILE.PIPE:
            this.pipes.push(new Pipe(x, this.game.groundY, this.tileSize));
            break;
          case TILE.BLOCK:
            this.blocks.push(new Block(x, y, this.tileSize));
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
      ...this.pipes,
      ...this.blocks,
      ...this.enemies,
    ];
  }

  addExclusiveEnemies() {
    // Position enemies ahead in the level so they appear over time
    const startX = this.game.worldWidth + 20;
    const ground = this.game.groundY - this.tileSize / 2;
    const crow = new ShadowCrow(startX, this.game.groundY - 1.5, this.tileSize);
    const sprite = new RhombusSprite(startX + 20, ground, this.tileSize);
    const guard = new ThornGuard(startX + 40, ground, this.tileSize);
    this.enemies.push(crow, sprite, guard);
    this.obstacles.push(crow, sprite, guard);
  }

  update(delta) {
    const move = this.getMoveSpeed() * delta;
    this.distance += move;

    const moveArr = arr => arr.forEach(e => e.update(move));
    moveArr(this.platforms);
    moveArr(this.pipes);
    moveArr(this.blocks);
    moveArr(this.stars);
    if (this.checkpoint) this.checkpoint.update(move);
    if (this.portal) this.portal.update(move);
    moveArr(this.thornWalls);
    const spawnedWalls = [];
    this.enemies.forEach(e => {
      const spawn = e.update(move, delta);
      if (spawn && spawn.length) {
        spawnedWalls.push(...spawn);
      }
    });
    spawnedWalls.forEach(w => this.thornWalls.push(w));

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
    if (!collideArr(this.pipes)) return;
    if (!collideArr(this.blocks)) return;
    if (!collideArr(this.thornWalls)) return;

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

    const filterArr = arr => arr.filter(e => e.x + e.width / 2 > 0);
    this.platforms = filterArr(this.platforms);
    this.pipes = filterArr(this.pipes);
    this.blocks = filterArr(this.blocks);
    this.thornWalls = filterArr(this.thornWalls);
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
      ...this.pipes,
      ...this.blocks,
      ...this.enemies,
      ...this.thornWalls,
    ];

    if (this.distance >= this.levelLength && !this.portal) {
      this.game.gameOver = true;
      this.game.win = true;
    }
  }

  setScale(scale) {
    [
      ...this.platforms,
      ...this.pipes,
      ...this.blocks,
      ...this.enemies,
      ...this.stars,
      ...this.thornWalls,
    ].forEach(o => o.setScale(scale));
    if (this.checkpoint) this.checkpoint.setScale(scale);
    if (this.portal) this.portal.setScale(scale);
  }
}

export { MAP as LEVEL3_MAP, TILE };

