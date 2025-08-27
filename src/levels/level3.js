import { BaseLevel } from './baseLevel.js';
import { Obstacle } from '../obstacle.js';
import { Goomba } from '../entities/goomba.js';
import { Guardian } from '../entities/guardian.js';
import { isColliding, isLandingOn } from '../../collision.js';
import { JUMP_VELOCITY } from '../config.js';

// Tile identifiers inspired by tylerreichle/mario_js.
// 0 = empty, 1 = ground, 2 = platform, 3 = pipe, 4 = block, 5 = enemy
const TILE = {
  EMPTY: 0,
  GROUND: 1,
  PLATFORM: 2,
  PIPE: 3,
  BLOCK: 4,
  GOOMBA: 5,
};

// Two dimensional map describing the level layout. Each number
// corresponds to a tile type defined above. The first row is the
// ground and subsequent rows stack upwards.
const MAP = [
  // Ground row
  [1, 1, 1, 1, 1, 1, 1, 1],
  // Tiles one unit above the ground
  [5, 2, 0, 3, 5, 2, 0, 0],
  // Tiles two units above the ground
  [0, 0, 0, 0, 4, 0, 0, 0],
];

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
    this.generateFromMap();
    this.boss = null;
    this.portalOpen = false;
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

  spawnBoss() {
    const size = 1;
    this.boss = new Guardian(
      this.game.worldWidth + size / 2,
      this.game.groundY - size / 2,
      size
    );
    this.boss.setScale(this.game.scale);
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

  update(delta) {
    const move = this.getMoveSpeed() * delta;
    this.distance += move;

    const moveArr = arr => arr.forEach(e => e.update(move));
    moveArr(this.platforms);
    moveArr(this.pipes);
    moveArr(this.blocks);
    this.enemies.forEach(e => e.update(move, delta));
    if (this.boss) this.boss.update(move, delta);

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

    if (this.boss) {
      if (isLandingOn(player, this.boss)) {
        player.vy = JUMP_VELOCITY / 2;
        player.jumping = true;
        player.jumpCount = 1;
        this.boss.registerHit();
        if (this.boss.hits >= 3) {
          this.portalOpen = true;
          this.boss = null;
          this.game.gameOver = true;
          this.game.win = true;
        }
      } else if (isColliding(player, this.boss)) {
        this.game.gameOver = true;
      }
    }

    const filterArr = arr => arr.filter(e => e.x + e.width / 2 > 0);
    this.platforms = filterArr(this.platforms);
    this.pipes = filterArr(this.pipes);
    this.blocks = filterArr(this.blocks);
    this.obstacles = [
      ...this.platforms,
      ...this.pipes,
      ...this.blocks,
      ...this.enemies,
    ];

    if (
      !this.boss &&
      this.distance >= this.levelLength &&
      this.obstacles.length === 0 &&
      !this.portalOpen
    ) {
      this.spawnBoss();
    }
  }

  setScale(scale) {
    [...this.platforms, ...this.pipes, ...this.blocks, ...this.enemies].forEach(
      o => o.setScale(scale)
    );
    if (this.boss) this.boss.setScale(scale);
  }
}

export { MAP as LEVEL3_MAP, TILE };

